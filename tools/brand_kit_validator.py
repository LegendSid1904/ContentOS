"""
Brand kit validator — checks completeness and consistency of brand data.

Usage:
    python brand_kit_validator.py --file brand_kit.json
    python brand_kit_validator.py --json '{"niche":"Fitness","colors":["#000"],"fonts":["Inter"]}'

Output:
    JSON with score, missing fields, and suggestions.
"""

import os
import json
import argparse
from typing import Any


REQUIRED_FIELDS = {
    "niche": "Content niche (e.g., Personal Finance India)",
    "colors": "Brand color palette (3-5 hex colors)",
    "fonts": "Font family selections (headline + body)",
    "tone": "Brand voice/tone (e.g., Educational, Motivational)",
}

RECOMMENDED_FIELDS = {
    "platform": "Primary content platform",
    "audience": "Target audience description",
    "logo_url": "Brand logo URL",
    "tagline": "Brand tagline or motto",
}


def validate(brand_kit: dict[str, Any]) -> dict[str, Any]:
    missing_required = []
    missing_recommended = []
    suggestions = []

    for field, desc in REQUIRED_FIELDS.items():
        if field not in brand_kit or not brand_kit[field]:
            missing_required.append(f"{field} ({desc})")

    for field, desc in RECOMMENDED_FIELDS.items():
        if field not in brand_kit or not brand_kit[field]:
            missing_recommended.append(f"{field} ({desc})")

    if "colors" in brand_kit and isinstance(brand_kit["colors"], list):
        if len(brand_kit["colors"]) < 3:
            suggestions.append("Add at least 3 brand colors for a complete palette")
        if len(brand_kit["colors"]) > 6:
            suggestions.append("Consider reducing to 3-5 core colors for brand consistency")

    if "fonts" in brand_kit and isinstance(brand_kit["fonts"], list):
        if len(brand_kit["fonts"]) < 2:
            suggestions.append("Add at least 2 fonts (headline + body)")

    if "tone" in brand_kit and isinstance(brand_kit["tone"], str):
        valid_tones = ["educational", "entertaining", "motivational", "controversial", "storytelling"]
        if brand_kit["tone"].lower() not in valid_tones:
            suggestions.append(f"Tone '{brand_kit['tone']}' not in standard set: {', '.join(valid_tones)}")

    total = len(REQUIRED_FIELDS) + len(RECOMMENDED_FIELDS)
    present = total - len(missing_required) - len(missing_recommended)
    score = round((present / total) * 100)

    return {
        "score": score,
        "status": "complete" if score >= 80 else "needs_work" if score >= 50 else "incomplete",
        "missing_required": missing_required,
        "missing_recommended": missing_recommended,
        "suggestions": suggestions,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate brand kit completeness")
    parser.add_argument("--file", help="Path to brand kit JSON file")
    parser.add_argument("--json", help="Brand kit as JSON string")

    args = parser.parse_args()

    if args.file:
        with open(args.file, "r") as f:
            data = json.load(f)
    elif args.json:
        data = json.loads(args.json)
    else:
        raise ValueError("Provide either --file or --json")

    result = validate(data)
    print(json.dumps(result, indent=2))
