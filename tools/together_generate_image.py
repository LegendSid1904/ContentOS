"""
Image generator — calls Together AI (OpenAI-compatible, Flux/SDXL models).

Usage:
    python together_generate_image.py --prompt "A futuristic cityscape" --output slide1.png
    python together_generate_image.py --prompt "..." --model "black-forest-labs/FLUX.1-schnell" --size "1024x1024" --output out.png

Env:
    TOGETHER_API_KEY (required)
"""

import os
import json
import base64
import argparse
from typing import Any

from openai import OpenAI


SUPPORTED_MODELS = {
    "flux-schnell": "black-forest-labs/FLUX.1-schnell",
    "flux-dev": "black-forest-labs/FLUX.1-dev",
    "sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
}


def generate_image(
    prompt: str,
    model: str = "black-forest-labs/FLUX.1-schnell",
    n: int = 1,
    size: str = "1024x1024",
    output_path: str | None = None,
    response_format: str = "b64_json",
) -> dict[str, Any]:
    client = OpenAI(
        api_key=os.environ["TOGETHER_API_KEY"],
        base_url="https://api.together.xyz/v1",
    )

    response = client.images.generate(
        model=model,
        prompt=prompt,
        n=n,
        size=size,
        response_format=response_format,
    )

    images = []
    for i, img in enumerate(response.data):
        result: dict[str, Any] = {
            "index": i,
            "revised_prompt": img.revised_prompt or prompt,
        }

        if output_path:
            if response_format == "b64_json" and img.b64_json:
                import pathlib

                path = pathlib.Path(output_path)
                stem = path.stem
                suffix = path.suffix or ".png"
                final_path = (
                    path.parent / f"{stem}_{i}{suffix}" if n > 1 else path
                )
                final_path.parent.mkdir(parents=True, exist_ok=True)
                final_path.write_bytes(base64.b64decode(img.b64_json))
                result["file_path"] = str(final_path)
            elif img.url:
                result["url"] = img.url
        else:
            if response_format == "b64_json" and img.b64_json:
                result["b64_json"] = img.b64_json
            elif img.url:
                result["url"] = img.url

        images.append(result)

    payload = {
        "images": images,
        "usage": {
            "model": model,
            "prompt": prompt,
            "n": n,
            "size": size,
        },
    }
    return payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate images via Together AI")
    parser.add_argument("--prompt", required=True, help="Image description prompt")
    parser.add_argument(
        "--model",
        default="black-forest-labs/FLUX.1-schnell",
        choices=list(SUPPORTED_MODELS.values()) + list(SUPPORTED_MODELS.keys()),
        help="Model alias or full name",
    )
    parser.add_argument("--n", type=int, default=1, help="Number of images (1-4)")
    parser.add_argument(
        "--size",
        default="1024x1024",
        choices=["1024x1024", "1024x768", "768x1024", "1280x720", "720x1280"],
        help="Image dimensions",
    )
    parser.add_argument("--output", help="Save to file path")
    parser.add_argument("--json", action="store_true", help="Output as JSON to stdout")

    args = parser.parse_args()

    model = SUPPORTED_MODELS.get(args.model, args.model)

    result = generate_image(
        prompt=args.prompt,
        model=model,
        n=args.n,
        size=args.size,
        output_path=args.output,
    )

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Generated {len(result['images'])} image(s) with model: {model}")
        for img in result["images"]:
            if "file_path" in img:
                print(f"  Saved: {img['file_path']}")
            elif "url" in img:
                print(f"  URL: {img['url']}")
            else:
                print(f"  Image {img['index']}: (base64 data)")
