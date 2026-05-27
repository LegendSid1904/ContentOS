"""
Canva export tool — pushes design briefs and generates Canva share links.

Usage:
    python canva_export.py --brief "A carousel about 5 AI tools" --output brief.txt
    python canva_export.py --brief "Thumbnail: bold text, yellow bg" --format "thumbnail"

Env:
    CANVA_CLIENT_ID (optional)
    CANVA_CLIENT_SECRET (optional)

Note:
    Currently generates Canva-compatible design briefs as text.
    Full Canva Connect API integration requires OAuth flow.
"""

import os
import json
import argparse
from typing import Any
from datetime import datetime


def generate_brief(
    brief: str,
    format: str = "carousel",
    brand_colors: list[str] | None = None,
    brand_fonts: list[str] | None = None,
) -> dict[str, Any]:
    colors = brand_colors or ["#8B5CF6", "#22D3EE", "#050505"]
    fonts = brand_fonts or ["Hanken Grotesk", "JetBrains Mono"]

    templates = {
        "carousel": {
            "type": "Carousel (10:16)",
            "slides": 5,
            "instructions": [
                "Slide 1: Cover slide with headline in bold Hanken Grotesk",
                "Slide 2: Problem statement with stats or hook text",
                "Slide 3: Main content / list format with icons",
                "Slide 4: Key insight or counter-intuitive point",
                "Slide 5: CTA slide with action prompt",
            ],
        },
        "thumbnail": {
            "type": "YouTube Thumbnail (16:9)",
            "instructions": [
                "Use bold, sans-serif headline (2-5 words max)",
                "High contrast between text and background",
                "Facial close-up with exaggerated expression if applicable",
                "Add arrow or circle highlight element",
            ],
        },
        "social": {
            "type": "Social Media Graphic (1:1)",
            "instructions": [
                "Clean layout with plenty of negative space",
                "Use brand color palette consistently",
                "Include logo or watermark",
            ],
        },
    }

    template = templates.get(format, templates["carousel"])

    brief_doc = {
        "generated_at": datetime.utcnow().isoformat(),
        "format": template["type"],
        "description": brief,
        "brand_colors": colors,
        "brand_fonts": fonts,
        "design_instructions": template.get("instructions", []),
        "canva_ready_prompt": (
            f"Design a {template['type']} for: {brief}. "
            f"Use colors: {', '.join(colors)}. "
            f"Fonts: {', '.join(fonts)}."
        ),
    }

    return brief_doc


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Canva design brief")
    parser.add_argument("--brief", required=True, help="Design description")
    parser.add_argument("--format", choices=["carousel", "thumbnail", "social"], default="carousel")
    parser.add_argument("--colors", nargs="*", help="Brand colors (hex)")
    parser.add_argument("--fonts", nargs="*", help="Brand fonts")

    args = parser.parse_args()
    result = generate_brief(
        brief=args.brief,
        format=args.format,
        brand_colors=args.colors,
        brand_fonts=args.fonts,
    )
    print(json.dumps(result, indent=2))
