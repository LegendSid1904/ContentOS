# Content Idea Engine — Workflow

## Objective
Generate weeks of content ideas tailored to a niche and audience.

## Inputs
- **Niche** (required): e.g., Personal Finance India, Fitness for Busy Professionals
- **Target Audience** (required): Who consumes this content
- **Trend Mode** (optional): Enable web search for trending topics

## Steps

### 1. Generate 30 Content Ideas
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a content strategist. Generate 30 content ideas for the given niche and audience. Each idea must have: title, format (video/post/carousel), pillar (1 of 4-5 content pillars), effort (Low/Medium/High), shareability (1-10), seo_value (1-10). Return as JSON array."
- `--prompt`: "Niche: {niche}. Audience: {audience}."
- `--json`: true

### 2. (Optional) Trend Surfing Mode
If enabled, first call `tools/web_search.py --query "trending {niche} topics 2026" --max-results 10`.
Pass results as additional context to the idea generator prompt.

### 3. Organize Into Content Pillars
The AI automatically categorizes ideas under 4-5 strategic pillars.
Display as grouped cards in the UI.

### 4. Generate Viral Angles
For any selected idea, call Claude with:
- `--prompt`: "Topic: {idea_title}. Generate 10 unique angles to make this topic go viral."
- `--json`: true

### 5. Build 30-Day Calendar
Call Claude with:
- `--prompt`: "Organize these 30 ideas into a 30-day content calendar with platform assignments and posting schedule."
- `--json`: true

## Edge Cases
- **Niche too broad**: If Claude returns generic ideas, prompt user to narrow niche (e.g., "Personal Finance India" → "Tax Saving Tips for Salaried Employees")
- **No trending results**: Fall back to niche-only generation with a note that trend mode returned no results

## Tools Used
- `tools/claude_generate.py`
- `tools/web_search.py`

## Output
Saved to `content_outputs` table with type "ideas" or "calendar".
