"""
Streaming AI response handler — calls Groq API with SSE streaming.

Usage:
    python claude_stream.py --system-prompt "You are a writer" --prompt "Write a script"
    python claude_stream.py --system-prompt "..." --prompt "..." --model "llama-3.3-70b-versatile"

Env:
    GROQ_API_KEY (required)
"""

import os
import json
import argparse
import sys

from openai import OpenAI


def stream_generate(
    system_prompt: str,
    prompt: str,
    model: str = "llama-3.3-70b-versatile",
    max_tokens: int = 4096,
    temperature: float = 0.7,
):
    client = OpenAI(
        api_key=os.environ["GROQ_API_KEY"],
        base_url="https://api.groq.com/openai/v1",
    )

    stream = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
        stream=True,
        stream_options={"include_usage": True},
    )

    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            sys.stdout.write(chunk.choices[0].delta.content)
            sys.stdout.flush()
        if chunk.usage:
            usage = {
                "input_tokens": chunk.usage.prompt_tokens,
                "output_tokens": chunk.usage.completion_tokens,
            }
            sys.stderr.write(json.dumps({"__usage__": usage}) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stream content via Groq AI")
    parser.add_argument("--system-prompt", required=True, help="System prompt")
    parser.add_argument("--prompt", required=True, help="User prompt")
    parser.add_argument("--model", default="llama-3.3-70b-versatile")
    parser.add_argument("--max-tokens", type=int, default=4096)
    parser.add_argument("--temperature", type=float, default=0.7)

    args = parser.parse_args()
    stream_generate(
        system_prompt=args.system_prompt,
        prompt=args.prompt,
        model=args.model,
        max_tokens=args.max_tokens,
        temperature=args.temperature,
    )
