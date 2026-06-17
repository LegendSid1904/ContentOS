"""
Deep video/post analysis — extracts metadata, engagement, hook, CTA, thumbnail details, and transcript.

Usage:
    python analyze_video.py --url "https://youtube.com/watch?v=..." [--include-transcript]
    python analyze_video.py --url "https://instagram.com/p/..."
    python analyze_video.py --url "https://youtu.be/..." --include-transcript

Env:
    GROQ_API_KEY (optional, for AI-powered hook/CTA/virality classification)
"""

import os
import json
import argparse
import re
import time
from typing import Any

import requests
from bs4 import BeautifulSoup

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def _detect_platform(url: str) -> str:
    url_lower = url.lower()
    if "youtube.com" in url_lower or "youtu.be" in url_lower:
        return "youtube"
    if "instagram.com" in url_lower:
        return "instagram"
    if "tiktok.com" in url_lower:
        return "tiktok"
    if "linkedin.com" in url_lower:
        return "linkedin"
    return "unknown"


def _parse_count(text: str | None) -> int | None:
    if not text:
        return None
    text = text.strip().lower()
    multipliers = {"k": 1000, "m": 1000000, "b": 1000000000}
    try:
        if text[-1] in multipliers:
            return int(float(text[:-1]) * multipliers[text[-1]])
        return int(re.sub(r'[^0-9]', '', text))
    except (ValueError, IndexError):
        return None


def _extract_youtube_video_id(url: str) -> str | None:
    patterns = [
        r'(?:youtube\.com/watch\?v=)([a-zA-Z0-9_-]{11})',
        r'(?:youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/embed/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/shorts/)([a-zA-Z0-9_-]{11})',
    ]
    for pat in patterns:
        m = re.search(pat, url)
        if m:
            return m.group(1)
    return None


def _scrape_youtube_metadata(video_id: str) -> dict[str, Any]:
    url = f"https://www.youtube.com/watch?v={video_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    resp = requests.get(url, headers=headers, timeout=20)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    title = None
    og_title = soup.find("meta", property="og:title")
    if og_title:
        title = og_title.get("content")

    description = None
    og_desc = soup.find("meta", property="og:description")
    if og_desc:
        description = og_desc.get("content")

    thumbnail_url = None
    og_image = soup.find("meta", property="og:image")
    if og_image:
        thumbnail_url = og_image.get("content")

    channel_name = None
    channel_url = None

    yt_initial = re.search(r'var ytInitialData = ({.*?});', resp.text, re.DOTALL)
    if yt_initial:
        try:
            data = json.loads(yt_initial.group(1))
            microformat = (
                data.get("contents", {})
                .get("twoColumnWatchNextResults", {})
                .get("results", {})
                .get("results", {})
                .get("contents", [])
            )
            for item in microformat:
                vmr = item.get("videoPrimaryInfoRenderer", {})
                if vmr:
                    title_runs = vmr.get("title", {}).get("runs", [])
                    if title_runs:
                        title = "".join(r.get("text", "") for r in title_runs)

                    view_count = vmr.get("viewCount", {}).get("videoViewCountRenderer", {}).get("viewCount", {}).get("simpleText", "")
                    if not view_count:
                        view_count = vmr.get("viewCount", {}).get("simpleText", "")

                owner = item.get("videoSecondaryInfoRenderer", {}).get("owner", {}).get("videoOwnerRenderer", {})
                if owner:
                    channel_runs = owner.get("title", {}).get("runs", [])
                    if channel_runs:
                        channel_name = "".join(r.get("text", "") for r in channel_runs)
                        nav = channel_runs[0].get("navigationEndpoint", {})
                        bid = nav.get("browseEndpoint", {}).get("browseId")
                        if bid:
                            channel_url = f"https://www.youtube.com/channel/{bid}"

        except (json.JSONDecodeError, KeyError, TypeError):
            pass

    if not title:
        title_tag = soup.find("title")
        if title_tag:
            title = title_tag.get_text(strip=True).replace(" - YouTube", "")

    if not description:
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc:
            description = meta_desc.get("content")

    if not channel_name:
        for link in soup.find_all("a", href=re.compile(r"/@|/channel/")):
            rel = link.get("rel", [])
            if "author" in rel:
                channel_name = link.get_text(strip=True)
                href = link.get("href", "")
                if href.startswith("/"):
                    channel_url = f"https://www.youtube.com{href}"
                break

    raw_views = None
    for match in re.finditer(r'([0-9,.]+[KkMmBb]?)\s*views?', resp.text, re.IGNORECASE):
        raw_views = match.group(1)
        break

    raw_likes = None
    for match in re.finditer(r'"likeCount":"([^"]+)"', resp.text):
        raw_likes = match.group(1)
        break
    if not raw_likes:
        for match in re.finditer(r'([0-9,.]+[KkMmBb]?)\s*likes?', resp.text, re.IGNORECASE):
            raw_likes = match.group(1)
            break

    raw_comments = None
    for match in re.finditer(r'"commentCount":"(\d+)"', resp.text):
        raw_comments = match.group(1)
        break

    publish_date = None
    pub_meta = soup.find("meta", itemprop="datePublished")
    if pub_meta:
        publish_date = pub_meta.get("content")

    duration = None
    dur_meta = soup.find("meta", itemprop="duration")
    if dur_meta:
        duration = dur_meta.get("content")

    tags_meta = soup.find("meta", property="og:video:tag")
    tags = []
    if tags_meta:
        content = tags_meta.get("content", "")
        tags = [t.strip() for t in content.split(",") if t.strip()]

    return {
        "title": title,
        "description": description,
        "thumbnail_url": thumbnail_url,
        "channel_name": channel_name,
        "channel_url": channel_url,
        "view_count": _parse_count(raw_views),
        "view_count_raw": raw_views,
        "like_count": _parse_count(raw_likes),
        "like_count_raw": raw_likes,
        "comment_count": _parse_count(raw_comments),
        "comment_count_raw": raw_comments,
        "publish_date": publish_date,
        "duration": duration,
        "tags": tags,
        "source": "youtube_scrape",
    }


def _fetch_youtube_transcript(video_id: str) -> list[dict[str, Any]] | None:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        transcript = YouTubeTranscriptApi().fetch(video_id, languages=["en", "en-US", "en-GB"])
        result = []
        for entry in transcript.snippets:
            result.append({
                "text": entry.text,
                "start": entry.start,
                "duration": entry.duration,
            })
        if not result:
            return None
        return result
    except Exception:
        return None


def _scrape_instagram_metadata(url: str) -> dict[str, Any]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
    except requests.RequestException:
        return {}

    soup = BeautifulSoup(resp.text, "html.parser")

    og_title = soup.find("meta", property="og:title")
    title = og_title.get("content") if og_title else None

    og_desc = soup.find("meta", property="og:description")
    description = og_desc.get("content") if og_desc else None

    og_image = soup.find("meta", property="og:image")
    thumbnail_url = og_image.get("content") if og_image else None

    username = None
    if title and "on Instagram:" in title:
        username = title.split(" on Instagram:")[0].strip()

    return {
        "title": title,
        "caption": description,
        "thumbnail_url": thumbnail_url,
        "username": username,
        "source": "instagram_scrape",
    }


def _classify_with_ai(title: str, description: str | None, transcript_text: str | None, platform: str) -> dict[str, Any]:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return {}

    from openai import OpenAI
    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

    content_for_analysis = f"Title: {title}\n"
    if description:
        content_for_analysis += f"Description: {description}\n"
    if transcript_text:
        content_for_analysis += f"Transcript (first 3000 chars): {transcript_text[:3000]}\n"

    system_prompt = """You are a viral content analyst. Analyze this video/post and return ONLY a valid JSON object (no markdown, no extra text) with:
- hook_type: what hook archetype is used (question, statistic, pattern interrupt, curiosity gap, shock, story, controversial statement, relatable situation, how-to, listicle, trend jack, challenge, emotional trigger, unknown)
- hook_text: the exact hook from title/intro (first 1-2 sentences)
- cta_type: what call-to-action is used (subscribe, like, comment, share, follow, link in bio, watch next, download, sign up, shop now, none, multiple)
- cta_text: the exact CTA phrasing
- cta_position: where the CTA appears (start, middle, end, throughout, none)
- thumbnail_strategy: description of the thumbnail approach (face expression, text overlay, color scheme, composition)
- video_structure: hook->intro->body->cta->outro or similar
- virality_factors: list of reasons this content might perform well (emotional, educational, entertaining, trending topic, controversy, relatability, production quality, timing, seo)
- engagement_rate_estimate: estimated engagement rate (likes+comments/views as percentage, or null)
- content_style: educational, entertaining, inspirational, controversial, news, tutorial, review, vlog, storytelling, other
- pace: fast, medium, slow
- editing_style: jump cuts, cinematic, raw, talking head, animated, hybrid, unknown"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this {platform} content:\n\n{content_for_analysis}"},
            ],
            max_tokens=2048,
            temperature=0.3,
        )
        content = completion.choices[0].message.content or "{}"
        json_start = content.find("{")
        json_end = content.rfind("}")
        if json_start != -1 and json_end != -1 and json_end > json_start:
            content = content[json_start:json_end+1]
        content = content.strip()
        return json.loads(content)
    except Exception:
        return {}


def analyze(url: str, include_transcript: bool = False, ai_classify: bool = True) -> dict[str, Any]:
    platform = _detect_platform(url)
    result = {
        "url": url,
        "platform": platform,
        "metadata": {},
        "transcript": None,
        "analysis": {},
        "error": None,
    }

    try:
        if platform == "youtube":
            video_id = _extract_youtube_video_id(url)
            if not video_id:
                result["error"] = "Could not extract YouTube video ID from URL"
                return result
            result["video_id"] = video_id
            result["metadata"] = _scrape_youtube_metadata(video_id)

            if include_transcript:
                transcript = _fetch_youtube_transcript(video_id)
                if transcript:
                    result["transcript"] = {
                        "segments": transcript,
                        "full_text": " ".join(s["text"] for s in transcript),
                        "language": "en",
                    }

        elif platform == "instagram":
            result["metadata"] = _scrape_instagram_metadata(url)

        else:
            result["error"] = f"Platform '{platform}' not yet supported"
            return result

    except requests.RequestException as e:
        result["error"] = f"HTTP error scraping video page: {e}"
        return result
    except Exception as e:
        result["error"] = f"Unexpected error: {e}"
        return result

    if ai_classify and result.get("metadata", {}).get("title"):
        title = result["metadata"].get("title", "")
        description = result["metadata"].get("description") or result["metadata"].get("caption")
        transcript_text = result["transcript"]["full_text"] if result.get("transcript") else None

        analysis = _classify_with_ai(title, description, transcript_text, platform)
        result["analysis"] = analysis

    if result.get("analysis", {}).get("engagement_rate_estimate") is None:
        meta = result.get("metadata", {})
        views = meta.get("view_count")
        likes = meta.get("like_count")
        comments = meta.get("comment_count")
        if views and views > 0:
            engagement = ((likes or 0) + (comments or 0)) / views * 100
            result["analysis"]["engagement_rate_estimate"] = round(engagement, 2)

    result["_metadata"] = {
        "ai_classification": ai_classify,
        "groq_available": bool(os.environ.get("GROQ_API_KEY")),
    }

    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deep video/post analysis")
    parser.add_argument("--url", required=True, help="Video or post URL")
    parser.add_argument("--include-transcript", action="store_true", help="Fetch YouTube transcript (if available)")
    parser.add_argument("--no-ai-classify", action="store_true", help="Skip AI-powered hook/CTA/virality classification")

    args = parser.parse_args()
    result = analyze(
        url=args.url,
        include_transcript=args.include_transcript,
        ai_classify=not args.no_ai_classify,
    )
    print(json.dumps(result, indent=2, default=str))
