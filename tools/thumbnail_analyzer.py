"""
Niche thumbnail research tool — scrapes real thumbnails from top creators in a niche,
analyzes them for color palettes, composition, expressions, and text overlay patterns.

Usage:
    python tools/thumbnail_analyzer.py --niche "personal finance" --platform youtube --count 15
    python tools/thumbnail_analyzer.py --niche "tech reviews" --platform youtube --count 10 --analyze-images

Env:
    TAVILY_API_KEY or BRAVE_API_KEY (for creator discovery)
    GROQ_API_KEY (for AI thumbnail analysis)
"""

import os
import json
import argparse
import re
import time
from io import BytesIO
from typing import Any

import requests
from bs4 import BeautifulSoup

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def _search_web(query: str, max_results: int = 10) -> list[dict[str, Any]]:
    api_key = os.environ.get("TAVILY_API_KEY")
    if api_key:
        resp = requests.post(
            "https://api.tavily.com/search",
            json={"api_key": api_key, "query": query, "max_results": max_results},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json().get("results", [])
    api_key = os.environ.get("BRAVE_API_KEY")
    if api_key:
        resp = requests.get(
            "https://api.search.brave.com/res/v1/web/search",
            params={"q": query, "count": max_results},
            headers={"Accept": "application/json", "X-Subscription-Token": api_key},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json().get("web", {}).get("results", [])
    raise ValueError("TAVILY_API_KEY or BRAVE_API_KEY must be set")


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


def _scrape_youtube_video_metadata(video_url: str) -> dict[str, Any]:
    video_id = _extract_youtube_video_id(video_url)
    if not video_id:
        return {"error": "Could not extract video ID"}
    url = f"https://www.youtube.com/watch?v={video_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
    except requests.RequestException as e:
        return {"error": f"HTTP error: {e}"}
    soup = BeautifulSoup(resp.text, "html.parser")
    title = None
    og_title = soup.find("meta", property="og:title")
    if og_title:
        title = og_title.get("content")
    thumbnail_url = None
    og_image = soup.find("meta", property="og:image")
    if og_image:
        thumbnail_url = og_image.get("content")
    view_count = None
    for match in re.finditer(r'([0-9,.]+[KkMmBb]?)\s*views?', resp.text, re.IGNORECASE):
        view_count = match.group(1)
        break
    channel_name = None
    for link in soup.find_all("a", href=re.compile(r"/@|/channel/")):
        rel = link.get("rel", [])
        if "author" in rel:
            channel_name = link.get_text(strip=True)
            break
    return {
        "video_id": video_id,
        "title": title,
        "thumbnail_url": thumbnail_url,
        "view_count_raw": view_count,
        "channel_name": channel_name,
    }


def _parse_count(text: str) -> int | None:
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


def _download_image(url: str, max_size: int = 500 * 1024) -> bytes | None:
    if not url:
        return None
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        resp = requests.get(url, headers=headers, timeout=15, stream=True)
        resp.raise_for_status()
        content_length = resp.headers.get("Content-Length")
        if content_length and int(content_length) > max_size * 2:
            return None
        data = resp.content
        if len(data) > max_size * 2:
            return None
        return data
    except requests.RequestException:
        return None


def _analyze_thumbnail_via_ai(
    title: str,
    thumbnail_url: str | None,
    channel_name: str | None,
    view_count: int | None,
) -> dict[str, Any]:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return {}
    from openai import OpenAI
    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    system_prompt = """You are a YouTube thumbnail analyst. Analyze the following video's thumbnail and return ONLY valid JSON (no markdown):
{
  "dominant_colors": ["#hex1", "#hex2", "#hex3"],
  "composition_type": "close-up face | mid-shot face | wide shot | text-heavy | split-screen | product focus | collage | minimal",
  "facial_expression": "shocked | curious | excited | serious | angry | sad | laughing | skeptical | neutral | fear | disgust | no_face",
  "text_overlay": {
    "present": true/false,
    "text_position": "top | center | bottom | left | right | split | none",
    "text_size": "large | medium | small",
    "text_count": 0
  },
  "contrast_level": "high | medium | low",
  "color_style": "monochromatic | complementary | vibrant | muted | dark | light | warm | cool | neon | pastel",
  "has_face": true/false,
  "face_position": "center | left | right | none",
  "branding_elements": ["channel_name_in_frame", "logo", "consistent_border", "none"],
  "bg_type": "solid | gradient | blurred | scene | dark | light | pattern | none",
  "ctr_factors": ["curiosity gap", "shock value", "educational promise", "face expression", "contrast", "text hook", "color pop", "urgency", "comparison"]
}"""
    content = f"Video Title: {title}\nChannel: {channel_name or 'unknown'}\nViews: {view_count or 'unknown'}\nThumbnail URL: {thumbnail_url or 'not available'}"
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this YouTube thumbnail:\n\n{content}"},
            ],
            max_tokens=1024,
            temperature=0.3,
        )
        result = completion.choices[0].message.content or "{}"
        json_start = result.find("{")
        json_end = result.rfind("}")
        if json_start != -1 and json_end != -1 and json_end > json_start:
            result = result[json_start:json_end + 1]
        return json.loads(result.strip())
    except Exception:
        return {}


def _extract_dominant_colors_from_image(image_data: bytes) -> list[str]:
    try:
        from PIL import Image
        img = Image.open(BytesIO(image_data))
        if img.mode != "RGB":
            img = img.convert("RGB")
        img = img.resize((100, 100))
        pixels = list(img.getdata())
        color_counts: dict[tuple[int, int, int], int] = {}
        for pixel in pixels:
            quantized = (pixel[0] // 32 * 32, pixel[1] // 32 * 32, pixel[2] // 32 * 32)
            color_counts[quantized] = color_counts.get(quantized, 0) + 1
        sorted_colors = sorted(color_counts.items(), key=lambda x: -x[1])
        hex_colors = []
        for color, _ in sorted_colors[:5]:
            hex_colors.append(f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}")
        return hex_colors
    except ImportError:
        return []


def discover_videos_in_niche(niche: str, platform: str, count: int = 15) -> list[dict[str, Any]]:
    all_videos: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    web_queries = [
        f"best {niche} videos on {platform} 2026",
        f"most viewed {niche} {platform} videos",
        f"trending {niche} content {platform}",
        f"top {niche} {platform} creators viral",
        f"best {niche} YouTube thumbnails",
    ]
    for query in web_queries:
        try:
            results = _search_web(query, max_results=count)
            for r in results:
                url = r.get("url", "")
                if not url or url in seen_urls:
                    continue
                if "youtube.com/watch" in url or "youtu.be/" in url:
                    seen_urls.add(url)
                    all_videos.append({
                        "url": url,
                        "title": r.get("title", ""),
                        "source": "web_search",
                    })
        except Exception:
            pass
        time.sleep(0.3)
    if platform == "youtube" or platform == "all":
        try:
            search_url = f"https://www.youtube.com/results?search_query={requests.utils.quote(niche)}"
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            resp = requests.get(search_url, headers=headers, timeout=15)
            resp.raise_for_status()
            match = re.search(r'var ytInitialData = ({.*?});', resp.text, re.DOTALL)
            if match:
                data = json.loads(match.group(1))
                contents = (
                    data.get("contents", {})
                    .get("twoColumnSearchResultsRenderer", {})
                    .get("primaryContents", {})
                    .get("sectionListRenderer", {})
                    .get("contents", [])
                )
                for section in contents:
                    items = section.get("itemSectionRenderer", {}).get("contents", [])
                    for item in items:
                        vmr = item.get("videoRenderer", {})
                        if not vmr:
                            continue
                        video_id = vmr.get("videoId", "")
                        title_runs = vmr.get("title", {}).get("runs", [])
                        title = "".join(r.get("text", "") for r in title_runs)
                        video_url = f"https://www.youtube.com/watch?v={video_id}"
                        if video_url not in seen_urls:
                            seen_urls.add(video_url)
                            all_videos.append({
                                "url": video_url,
                                "title": title,
                                "source": "youtube_search",
                            })
        except Exception:
            pass
    return all_videos[:count]


def analyze_thumbnail(video: dict[str, Any], analyze_images: bool = False) -> dict[str, Any]:
    meta = _scrape_youtube_video_metadata(video["url"])
    if meta.get("error"):
        return {"url": video["url"], "error": meta["error"]}
    thumbnail_url = meta.get("thumbnail_url")
    view_count = _parse_count(meta.get("view_count_raw"))
    ai_analysis = _analyze_thumbnail_via_ai(
        title=meta.get("title") or video.get("title", ""),
        thumbnail_url=thumbnail_url,
        channel_name=meta.get("channel_name"),
        view_count=view_count,
    )
    image_colors: list[str] = []
    if analyze_images and thumbnail_url:
        img_data = _download_image(thumbnail_url)
        if img_data:
            image_colors = _extract_dominant_colors_from_image(img_data)
    return {
        "url": video["url"],
        "title": meta.get("title") or video.get("title", ""),
        "channel_name": meta.get("channel_name"),
        "thumbnail_url": thumbnail_url,
        "view_count": view_count,
        "view_count_raw": meta.get("view_count_raw"),
        "ai_analysis": ai_analysis,
        "image_colors": image_colors,
    }


def synthesize_patterns(thumbnails: list[dict[str, Any]]) -> dict[str, Any]:
    analyzed = [t for t in thumbnails if "error" not in t and t.get("ai_analysis")]
    if not analyzed:
        return {"patterns_found": False, "thumbnail_count": 0}
    composition_freq: dict[str, int] = {}
    expression_freq: dict[str, int] = {}
    text_overlay_count = 0
    face_count = 0
    contrast_freq: dict[str, int] = {}
    color_style_freq: dict[str, int] = {}
    ctr_factor_freq: dict[str, int] = {}
    all_colors: list[str] = []
    for t in analyzed:
        ai = t.get("ai_analysis", {})
        comp = ai.get("composition_type", "unknown")
        composition_freq[comp] = composition_freq.get(comp, 0) + 1
        expr = ai.get("facial_expression", "none")
        expression_freq[expr] = expression_freq.get(expr, 0) + 1
        to = ai.get("text_overlay", {})
        if to.get("present"):
            text_overlay_count += 1
        if ai.get("has_face"):
            face_count += 1
        contrast = ai.get("contrast_level", "unknown")
        contrast_freq[contrast] = contrast_freq.get(contrast, 0) + 1
        style = ai.get("color_style", "unknown")
        color_style_freq[style] = color_style_freq.get(style, 0) + 1
        for factor in ai.get("ctr_factors", []):
            ctr_factor_freq[factor] = ctr_factor_freq.get(factor, 0) + 1
        for c in ai.get("dominant_colors", []):
            all_colors.append(c)
        for c in t.get("image_colors", []):
            all_colors.append(c)
    total = len(analyzed)
    return {
        "patterns_found": True,
        "thumbnail_count": total,
        "dominant_colors_across_niche": list(dict.fromkeys(all_colors))[:8],
        "composition_breakdown": [
            {"type": k, "percentage": round(v / total * 100, 1)}
            for k, v in sorted(composition_freq.items(), key=lambda x: -x[1])
        ],
        "most_common_composition": max(composition_freq, key=composition_freq.get) if composition_freq else "unknown",
        "expression_breakdown": [
            {"type": k, "percentage": round(v / total * 100, 1)}
            for k, v in sorted(expression_freq.items(), key=lambda x: -x[1])
        ],
        "most_common_expression": max(expression_freq, key=expression_freq.get) if expression_freq else "unknown",
        "text_overlay_percentage": round(text_overlay_count / total * 100, 1),
        "face_present_percentage": round(face_count / total * 100, 1),
        "contrast_breakdown": [
            {"level": k, "percentage": round(v / total * 100, 1)}
            for k, v in sorted(contrast_freq.items(), key=lambda x: -x[1])
        ],
        "most_common_contrast": max(contrast_freq, key=contrast_freq.get) if contrast_freq else "unknown",
        "most_common_color_style": max(color_style_freq, key=color_style_freq.get) if color_style_freq else "unknown",
        "top_ctr_factors": [
            {"factor": k, "frequency": v}
            for k, v in sorted(ctr_factor_freq.items(), key=lambda x: -x[1])[:5]
        ],
        "winning_formula": {
            "composition": max(composition_freq, key=composition_freq.get) if composition_freq else "unknown",
            "expression": max(expression_freq, key=expression_freq.get) if expression_freq else "unknown",
            "contrast": max(contrast_freq, key=contrast_freq.get) if contrast_freq else "unknown",
            "color_style": max(color_style_freq, key=color_style_freq.get) if color_style_freq else "unknown",
            "text_overlay": text_overlay_count > total / 2,
        },
    }


def analyze_niche(niche: str, platform: str = "youtube", count: int = 15, analyze_images: bool = False) -> dict[str, Any]:
    videos = discover_videos_in_niche(niche, platform, count)
    if not videos:
        return {
            "niche": niche,
            "platform": platform,
            "error": "No videos found for this niche",
            "videos_analyzed": 0,
            "patterns": {"patterns_found": False, "thumbnail_count": 0},
        }
    analyzed_thumbnails = []
    for i, video in enumerate(videos):
        result = analyze_thumbnail(video, analyze_images)
        analyzed_thumbnails.append(result)
        time.sleep(0.5)
    patterns = synthesize_patterns(analyzed_thumbnails)
    return {
        "niche": niche,
        "platform": platform,
        "videos_searched": len(videos),
        "videos_analyzed": len([t for t in analyzed_thumbnails if "error" not in t]),
        "videos_with_errors": len([t for t in analyzed_thumbnails if "error" in t]),
        "patterns": patterns,
        "thumbnails": [
            {
                "url": t["url"],
                "title": t.get("title"),
                "channel": t.get("channel_name"),
                "thumbnail_url": t.get("thumbnail_url"),
                "view_count": t.get("view_count"),
                "analysis": t.get("ai_analysis"),
                "image_colors": t.get("image_colors", []),
            }
            for t in analyzed_thumbnails if "error" not in t
        ],
    }


def main():
    parser = argparse.ArgumentParser(description="Niche thumbnail research — scrape + analyze real thumbnails")
    parser.add_argument("--niche", required=True, help="Content niche (e.g. 'personal finance')")
    parser.add_argument("--platform", default="youtube", choices=["youtube", "instagram", "all"], help="Social media platform")
    parser.add_argument("--count", type=int, default=15, help="Number of videos to analyze")
    parser.add_argument("--analyze-images", action="store_true", help="Download and extract colors from actual thumbnail images (requires Pillow)")
    parser.add_argument("--output", help="Output JSON file path (optional)")
    args = parser.parse_args()
    result = analyze_niche(niche=args.niche, platform=args.platform, count=args.count, analyze_images=args.analyze_images)
    output = json.dumps(result, indent=2, default=str)
    if args.output:
        os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Results saved to {args.output}")
    else:
        print(output)


if __name__ == "__main__":
    main()
