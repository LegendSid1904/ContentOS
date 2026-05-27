"""
AI text generator — calls Groq API (OpenAI-compatible, free tier).

Usage:
    python claude_generate.py --system-prompt "You are a script writer" --prompt "Write a script about AI"
    python claude_generate.py --system-prompt "..." --prompt "..." --json

Env:
    GROQ_API_KEY (required)
"""

import os
import json
import argparse
from typing import Any

from openai import OpenAI


def generate(
    system_prompt: str,
    prompt: str,
    model: str = "llama-3.3-70b-versatile",
    max_tokens: int = 4096,
    temperature: float = 0.7,
    parse_json: bool = False,
) -> dict[str, Any]:
    client = OpenAI(
        api_key=os.environ["GROQ_API_KEY"],
        base_url="https://api.groq.com/openai/v1",
    )

    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
    )

    content = completion.choices[0].message.content or ""

    result: dict[str, Any] = {
        "content": json.loads(content) if parse_json else content,
        "usage": {
            "input_tokens": completion.usage.prompt_tokens if completion.usage else 0,
            "output_tokens": completion.usage.completion_tokens if completion.usage else 0,
        },
    }
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate content via Groq AI")
    parser.add_argument("--system-prompt", required=True, help="System prompt")
    parser.add_argument("--prompt", required=True, help="User prompt")
    parser.add_argument("--model", default="llama-3.3-70b-versatile")
    parser.add_argument("--max-tokens", type=int, default=4096)
    parser.add_argument("--temperature", type=float, default=0.7)
    parser.add_argument("--json", action="store_true", help="Parse output as JSON")

    args = parser.parse_args()
    result = generate(
        system_prompt=args.system_prompt,
        prompt=args.prompt,
        model=args.model,
        max_tokens=args.max_tokens,
        temperature=args.temperature,
        parse_json=args.json,
    )
    print(json.dumps(result, indent=2))
