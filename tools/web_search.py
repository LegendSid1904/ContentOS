"""
Web search tool — searches the web for trending topics or competitor info.

Usage:
    python web_search.py --query "AI content creation trends 2026"
    python web_search.py --query "top YouTube creators in finance India" --max-results 10

Env:
    TAVILY_API_KEY or BRAVE_API_KEY (one required)
"""

import os
import json
import argparse
from typing import Any

import requests


def search_tavily(query: str, max_results: int = 5) -> list[dict[str, Any]]:
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        raise ValueError("TAVILY_API_KEY not set")

    resp = requests.post(
        "https://api.tavily.com/search",
        json={"api_key": api_key, "query": query, "max_results": max_results},
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("results", [])


def search_brave(query: str, max_results: int = 5) -> list[dict[str, Any]]:
    api_key = os.environ.get("BRAVE_API_KEY")
    if not api_key:
        raise ValueError("BRAVE_API_KEY not set")

    resp = requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        params={"q": query, "count": max_results},
        headers={"Accept": "application/json", "X-Subscription-Token": api_key},
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("web", {}).get("results", [])


def search(query: str, max_results: int = 5, provider: str = "tavily") -> list[dict[str, Any]]:
    if provider == "tavily":
        return search_tavily(query, max_results)
    elif provider == "brave":
        return search_brave(query, max_results)
    else:
        raise ValueError(f"Unknown provider: {provider}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Web search tool")
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--max-results", type=int, default=5)
    parser.add_argument("--provider", choices=["tavily", "brave"], default="tavily")

    args = parser.parse_args()
    results = search(query=args.query, max_results=args.max_results, provider=args.provider)
    print(json.dumps(results, indent=2))
