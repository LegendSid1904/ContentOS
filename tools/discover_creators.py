"""
Discover top creators in a niche — searches the web + scrapes platform search pages.

Usage:
    python discover_creators.py --niche "finance India" --platform youtube --count 10
    python discover_creators.py --niche "vegan recipes" --platform instagram --count 5
    python discover_creators.py --niche "AI tools" --platform all --count 8

Env:
    TAVILY_API_KEY or BRAVE_API_KEY (one required)
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


def _scrape_youtube_search(query: str, max_results: int = 10) -> list[dict[str, Any]]:
    url = f"https://www.youtube.com/results?search_query={requests.utils.quote(query)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
    except requests.RequestException:
        return []

    results = []
    match = re.search(r'var ytInitialData = ({.*?});', resp.text, re.DOTALL)
    if not match:
        return results

    try:
        data = json.loads(match.group(1))
        contents = (
            data.get("contents", {})
            .get("twoColumnSearchResultsRenderer", {})
            .get("primaryContents", {})
            .get("sectionListRenderer", {})
            .get("contents", [])
        )
        for section in contents:
            items = (
                section.get("itemSectionRenderer", {})
                .get("contents", [])
            )
            for item in items:
                vmr = item.get("videoRenderer", {})
                if not vmr:
                    continue
                video_id = vmr.get("videoId", "")
                title_runs = vmr.get("title", {}).get("runs", [])
                title = "".join(r.get("text", "") for r in title_runs)
                channel_runs = (
                    vmr.get("ownerText", {})
                    .get("runs", [])
                )
                channel_name = "".join(r.get("text", "") for r in channel_runs)
                channel_url = None
                for r in channel_runs:
                    if r.get("navigationEndpoint", {}).get("browseEndpoint", {}).get("browseId"):
                        browse_id = r["navigationEndpoint"]["browseEndpoint"]["browseId"]
                        channel_url = f"https://www.youtube.com/channel/{browse_id}"

                view_text = vmr.get("viewCountText", {}).get("simpleText", "")
                sub_count = None
                results.append({
                    "name": channel_name,
                    "channel_url": channel_url,
                    "platform": "youtube",
                    "video_id": video_id,
                    "video_url": f"https://www.youtube.com/watch?v={video_id}",
                    "video_title": title,
                    "subscriber_estimate": sub_count,
                    "source": "youtube_search_scrape",
                })
    except (json.JSONDecodeError, KeyError, TypeError):
        pass

    return results[:max_results]


def _scrape_instagram_search(query: str, max_results: int = 10) -> list[dict[str, Any]]:
    url = f"https://www.instagram.com/web/search/topsearch/?context=blended&query={requests.utils.quote(query)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, json.JSONDecodeError):
        return []

    results = []
    for user in data.get("users", [])[:max_results]:
        user_data = user.get("user", {})
        results.append({
            "name": user_data.get("full_name", ""),
            "username": user_data.get("username", ""),
            "channel_url": f"https://www.instagram.com/{user_data.get('username', '')}/",
            "platform": "instagram",
            "profile_pic_url": user_data.get("profile_pic_url", ""),
            "follower_count": user_data.get("follower_count"),
            "is_verified": user_data.get("is_verified", False),
            "source": "instagram_search_scrape",
        })
    return results


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


def _extract_creators_from_web_results(results: list[dict[str, Any]], platform: str) -> list[dict[str, Any]]:
    creators = []
    platform_domains = {
        "youtube": ["youtube.com", "youtu.be"],
        "instagram": ["instagram.com"],
    }
    domains = platform_domains.get(platform, [])
    seen_urls = set()

    for r in results:
        url = r.get("url", "")
        if not any(d in url.lower() for d in domains):
            continue

        name = r.get("title", "").replace(" - YouTube", "").replace(" (@", " (@")
        creator_url = url

        if creator_url in seen_urls:
            continue
        seen_urls.add(creator_url)

        snippet = r.get("content", "") or r.get("snippet", "") or ""

        creators.append({
            "name": name,
            "channel_url": creator_url,
            "platform": platform,
            "description": snippet[:300],
            "source": "web_search",
        })

    return creators


def discover(
    niche: str,
    platform: str = "youtube",
    count: int = 10,
) -> dict[str, Any]:
    all_creators = []
    seen_names = set()

    web_queries = [
        f"top {niche} creators on {platform} 2026",
        f"best {niche} {platform} channels to follow",
        f"most popular {niche} content creators {platform}",
        f"top 10 {niche} influencers {platform}",
    ]

    for query in web_queries:
        try:
            results = _search_web(query, max_results=count)
            creators = _extract_creators_from_web_results(results, platform)
            for c in creators:
                name_lower = c["name"].lower()
                if name_lower not in seen_names:
                    seen_names.add(name_lower)
                    all_creators.append(c)
        except Exception:
            pass
        time.sleep(0.3)

    if platform == "youtube" or platform == "all":
        try:
            yt_creators = _scrape_youtube_search(niche, max_results=count)
            for c in yt_creators:
                name_lower = c["name"].lower()
                if name_lower not in seen_names:
                    seen_names.add(name_lower)
                    all_creators.append(c)
        except Exception:
            pass

    if platform == "instagram" or platform == "all":
        try:
            ig_creators = _scrape_instagram_search(niche, max_results=count)
            for c in ig_creators:
                name_lower = c.get("name", "").lower()
                if name_lower not in seen_names:
                    seen_names.add(name_lower)
                    all_creators.append(c)
        except Exception:
            pass

    return {
        "niche": niche,
        "platform": platform,
        "total_found": len(all_creators),
        "creators": all_creators[:max(count * 2, 20)],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Discover top creators in a niche")
    parser.add_argument("--niche", required=True, help="Content niche (e.g. 'finance India')")
    parser.add_argument("--platform", default="youtube", choices=["youtube", "instagram", "all"],
                        help="Social media platform")
    parser.add_argument("--count", type=int, default=10, help="Number of creators to find")

    args = parser.parse_args()
    result = discover(niche=args.niche, platform=args.platform, count=args.count)
    print(json.dumps(result, indent=2))
