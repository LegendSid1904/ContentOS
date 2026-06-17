# Thumbnail Maker — Workflow

## Objective
Generate CTR-optimized thumbnail concepts and visual direction briefs, informed by real thumbnail patterns from the target niche.

## Inputs
- **Video/Post Topic** (required)
- **Platform** (required): YouTube / Instagram / LinkedIn
- **Target Audience** (required)
- **Niche** (optional, auto-derived from topic): The content niche for competitor thumbnail research
- **Brand Kit** (optional): Colors, fonts for visual consistency

## Steps

### 0. Research Niche Thumbnails (Research-First Phase)
Before generating concepts, research real thumbnails from top-performing content in the same niche:

Run `tools/thumbnail_analyzer.py`:
```
python tools/thumbnail_analyzer.py --niche "{niche}" --platform "{platform}" --count 15 [--analyze-images]
```

This produces a **NicheThumbnailReport** with:
- **Winning composition type**: What framing works best (close-up face, mid-shot, text-heavy, etc.)
- **Most common facial expression**: The expression pattern in top thumbnails
- **Dominant colors across the niche**: Color palette trends
- **Contrast level analysis**: High/medium/low contrast preferences
- **Text overlay patterns**: Whether text is used, position, size
- **Top CTR factors**: What drives clicks in this niche (curiosity gap, shock, educational promise, etc.)
- **Winning formula**: The composition of composition + expression + contrast + color_style that wins most

Pass the pattern report as context to the concept generation in Phase 1.

### 1. Generate 5 Thumbnail Concepts (Pattern-Informed)
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a thumbnail strategist. Generate 5 unique thumbnail concepts. Each concept must have: concept_name, headline_text (2-5 words), visual_description, color_palette, facial_expression_hint, background_suggestion, props. Return as JSON."
- `--prompt`: "Topic: {topic}. Platform: {platform}. Audience: {audience}. Niche thumbnail research findings: {niche_patterns}."
- `--json`: true

The niche patterns should be used to inform but not constrain the concepts — the goal is to align with what works in the niche while still differentiating.

### 2. Generate Thumbnail Images (AI)
Call `lib/actions-thumbnail.ts:generateThumbnailImages()` — generates one Flux AI image per concept via Together AI. Images are 1280x720 (16:9 YouTube thumbnail) and uploaded to Supabase Storage.

### 3. Generate Canva Prompt (optional)
For the selected concept, generate a ready-to-paste design prompt.

### 4. A/B Test Planner
Generate a framework for testing 2 thumbnail variants with CTR comparison.

## Edge Cases
- **No niche research data**: If the niche is too specific or no thumbnails found, skip Phase 0 and proceed with basic AI generation
- **Thumbnail scraper rate-limited**: If scraping fails, cache results in `.tmp/` and use LLM-based pattern estimation as fallback
- **No brand kit**: Use default ContentOS design system colors
- **Platform mismatch**: Ensure size presets match platform specs (YouTube: 1280x720, Instagram: 1080x1080)
- **Image generation fails**: If Together AI returns an error, skip image gen and fall back to text-only concepts
- **API credit limit**: If TOGETHER_API_KEY is missing or exhausted, proceed with text-only concepts

## Output
Saved to `content_outputs` table with type "thumbnail_brief". Contains `patterns[]` (niche research), `concepts[]` and `thumbnails[]` (with `storageUrl`).
