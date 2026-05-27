# Thumbnail Maker — Workflow

## Objective
Generate CTR-optimized thumbnail concepts and visual direction briefs.

## Inputs
- **Video/Post Topic** (required)
- **Platform** (required): YouTube / Instagram / LinkedIn
- **Target Audience** (required)
- **Brand Kit** (optional): Colors, fonts for visual consistency

## Steps

### 1. Generate 5 Thumbnail Concepts
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a thumbnail strategist. Generate 5 unique thumbnail concepts. Each concept must have: concept_name, headline_text (2-5 words), visual_description, color_palette, facial_expression_hint, background_suggestion, props. Return as JSON."
- `--prompt`: "Topic: {topic}. Platform: {platform}. Audience: {audience}."
- `--json`: true

### 2. Generate Canva Prompt
For the selected concept, generate a ready-to-paste design prompt.

### 3. A/B Test Planner
Generate a framework for testing 2 thumbnail variants with CTR comparison.

## Edge Cases
- **No brand kit**: Use default ContentOS design system colors (violet/teal)
- **Platform mismatch**: Ensure size presets match platform specs

## Output
Saved to `content_outputs` table with type "thumbnail_brief".
