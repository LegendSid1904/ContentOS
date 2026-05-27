# Carousel & Graphic Maker — Workflow

## Objective
Generate platform-optimized carousel outlines with slide-by-slide copy and design direction.

## Inputs
- **Topic** (required): What the carousel is about
- **Target Audience** (required): Who this is for
- **Platform** (required): Instagram / LinkedIn / Twitter
- **Number of Slides** (optional): 5-10 (default 5)

## Steps

### 1. Generate Carousel Outline
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a carousel strategist. Create a {slide_count}-slide narrative arc. Each slide must have: slide_number, headline, copy (1-3 lines), visual_direction. Return as JSON array."
- `--prompt`: "Topic: {topic}. Audience: {audience}. Platform: {platform}."
- `--json`: true

**Output:** Array of slide objects with headline, copy, and visual direction.

### 2. Generate Cover Slide Headlines
Call `tools/claude_generate.py` with:
- `--system-prompt`: "Generate 5 cover slide headline variants for a carousel. Each should be click-stopping and curiosity-driven. Return as JSON array."
- `--prompt`: "Topic: {topic}. Audience: {audience}."
- `--json`: true

### 3. Build Canva Design Brief
Call `tools/canva_export.py --brief "{topic} carousel" --format carousel --colors {brand_colors}` to generate the design brief.

### 4. Export
- Download as PDF via `tools/export_pdf.py`
- Generate design prompt copy-paste for Canva

## Edge Cases
- **Slide count mismatch**: If AI returns fewer slides than requested, re-prompt with "Generate {N} more slides continuing from slide {last}"
- **Too text-heavy**: If slide copy exceeds 3 lines, flag for trimming and suggest visual alternatives

## Tools Used
- `tools/claude_generate.py`
- `tools/canva_export.py`
- `tools/export_pdf.py`

## Output
Saved to `content_outputs` table with type "carousel".
