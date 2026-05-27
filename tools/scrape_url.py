"""
URL content extractor — fetches and extracts readable content from a URL.

Usage:
    python scrape_url.py --url "https://example.com/article"
    python scrape_url.py --url "https://youtube.com/watch?v=..." --selector "article"

Dependencies:
    pip install beautifulsoup4 requests
"""

import os
import json
import argparse
import re
from typing import Any

import requests
from bs4 import BeautifulSoup


def extract_text(html: str, selector: str | None = None) -> str:
    soup = BeautifulSoup(html, "html.parser")
    if selector:
        elements = soup.select(selector)
        return "\n\n".join(el.get_text(strip=True) for el in elements)
    for tag in ["article", "main", ".post-content", ".entry-content"]:
        element = soup.select_one(tag)
        if element:
            return element.get_text(strip=True)
    return soup.get_text(strip=True)[:10000]


def scrape(
    url: str,
    selector: str | None = None,
    max_length: int = 10000,
) -> dict[str, Any]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    resp = requests.get(url, headers=headers, timeout=20)
    resp.raise_for_status()

    text = extract_text(resp.text, selector)[:max_length]
    title = None
    soup = BeautifulSoup(resp.text, "html.parser")
    if soup.title:
        title = soup.title.get_text(strip=True)

    return {
        "url": url,
        "title": title,
        "content": text,
        "content_length": len(text),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract content from a URL")
    parser.add_argument("--url", required=True, help="URL to scrape")
    parser.add_argument("--selector", help="CSS selector for specific content area")
    parser.add_argument("--max-length", type=int, default=10000)

    args = parser.parse_args()
    result = scrape(url=args.url, selector=args.selector, max_length=args.max_length)
    print(json.dumps(result, indent=2))
