# Competitor Intelligence — Workflow

## Objective
Analyze a competitor's content strategy from their channel/profile URL, identifying top content, patterns, and gaps.

## Inputs
- **Competitor URL** (required): YouTube channel / Instagram profile / LinkedIn profile
- **Depth** (required): Basic (top 10 posts) / Deep (full channel analysis)
- **Niche** (optional): Pre-set niche for comparative analysis

## Steps

### 1. Scrape Competitor Profile
Call `tools/scrape_url.py --url "{competitor_url}"` to extract profile information.

### 2. Analyze Top Content
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a content analyst. Analyze the competitor's content and identify: content pillars, posting frequency, engagement patterns, hook styles, thumbnail patterns. Return as JSON."
- `--prompt`: "Profile data: {scraped_data}. Niche: {niche}."
- `--json`: true

**Output:** Competitor profile breakdown with pillars, patterns, and engagement insights.

### 3. Identify Content Gaps
Call `tools/claude_generate.py` with:
- `--system-prompt`: "Compare the competitor's content coverage with common topics in this niche. Identify 5-10 content gaps the competitor is not covering. Return as JSON array with topic, rationale, and opportunity_score (1-10)."
- `--prompt`: "Competitor pillars: {pillars}. Niche: {niche}."
- `--json`: true

### 4. (Deep Mode) Full Channel Audit
Call `tools/claude_generate.py` with:
- `--prompt`: "Generate a comprehensive competitive audit including: content strategy score, production quality score, SEO optimization score, engagement benchmark, and 3 actionable recommendations."
- `--json`: true

### 5. Export Report
- Compile into PDF via `tools/export_pdf.py`

## Edge Cases
- **URL not accessible**: If scraping fails, ask user to paste top 5 post titles/topics manually
- **No clear niche**: If competitor covers multiple niches, identify the dominant one by post volume

## Tools Used
- `tools/scrape_url.py`
- `tools/claude_generate.py`
- `tools/export_pdf.py`

## Output
Saved to `content_outputs` table with type "competitor_intel".
