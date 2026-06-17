# Competitor Intelligence — Workflow

## Objective
Analyze competitors' content strategy — either a single competitor from URL or discover multiple competitors in a niche. Identifies top content, micro-details (hooks, CTAs, thumbnails), patterns, and gaps.

## Inputs
- **Mode** (required): Single (single competitor URL) / Multi (discover competitors in a niche)
- **Competitor URL** (required for Single mode): YouTube channel / Instagram profile
- **Niche** (required for Multi mode): Content niche to research (e.g. "finance India", "vegan recipes")
- **Platform** (required for Multi mode): youtube / instagram / all
- **Depth** (required): Basic (top 10 posts) / Deep (full channel analysis + video-level micro-analysis)
- **Include Transcripts** (optional, default false): Fetch YouTube transcripts for deeper content analysis

## Steps

### Option A — Multi-Competitor Discovery Mode

#### 1. Discover Creators in Niche
Call `tools/discover_creators.py` to find top creators:
```
python tools/discover_creators.py --niche "{niche}" --platform "{platform}" --count 15
```

#### 2. Filter to Top 5-10 Most Relevant
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a competitive research analyst. From this list of creators, select the 5-10 most relevant for deep analysis. Prioritize: consistent posting, strong engagement, audience overlap, mix of established and rising stars. Return as JSON array with: name, channel_url, reason_for_selection."
- `--prompt`: "Discovered creators: {discovery_output}. Niche: {niche}."
- `--json`: true

#### 3. Analyze Each Creator's Profile
For each selected creator, call:
```
python tools/scrape_url.py --url "{creator_channel_url}"
```

#### 4. Analyze Top 5-10 Videos Per Creator
For each creator, run deep analysis on their top-performing videos:
```
python tools/analyze_video.py --url "{video_url}" [--include-transcript]
```

If transcripts are included, the analysis will also capture hook types, CTA patterns, and virality factors via AI classification.

#### 5. Cross-Creator Pattern Synthesis
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a competitive content analyst. You will receive a detailed breakdown of videos across multiple creators in a niche. Identify: 1) HOOK ARCHETYPES ranked by frequency and performance with examples, 2) CTA PATTERNS (types, positions, phrasing), 3) THUMBNAIL FORMULA (colors, expressions, text, composition), 4) CONTENT FORMATS that correlate with highest performance, 5) CAPTION STRATEGY patterns, 6) VIRALITY TRIGGERS (emotional/psychological), 7) CONTENT GAPS (underserved topics/angles/formats), 8) POSTING CADENCE patterns. Return as JSON with each finding containing: pattern, evidence, frequency, impact_score (1-10)."
- `--prompt`: "Analyzed videos data: {all_video_analyses}. Niche: {niche}."
- `--json`: true

### Option B — Single Competitor URL Mode

#### 1. Scrape Competitor Profile
Call `tools/scrape_url.py --url "{competitor_url}"` to extract profile information.

#### 2. Identify Top Performing Videos
Use `tools/web_search.py` to find their most-viewed content:
```
python tools/web_search.py --query "{creator_name} top videos" --max-results 10
```
Or ask the user to provide specific video URLs.

#### 3. Deep Video Analysis
For each top video, run:
```
python tools/analyze_video.py --url "{video_url}" [--include-transcript]
```

#### 4. Analyze Patterns
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a content analyst. Analyze the competitor's content and identify: content pillars, posting frequency, engagement patterns, hook styles, thumbnail patterns, CTA strategies. Return as JSON."
- `--prompt`: "Profile data: {scraped_data}. Video analyses: {video_analyses}. Niche: {niche}."
- `--json`: true

**Output:** Competitor profile breakdown with pillars, patterns, hooks, CTAs, and engagement insights.

#### 5. Identify Content Gaps
Call `tools/claude_generate.py` with:
- `--system-prompt`: "Compare the competitor's content coverage with common topics in this niche. Identify 5-10 content gaps the competitor is not covering. Return as JSON array with topic, rationale, and opportunity_score (1-10)."
- `--prompt`: "Competitor pillars: {pillars}. Niche: {niche}."
- `--json`: true

#### 6. (Deep Mode) Full Channel Audit
Call `tools/claude_generate.py` with:
- `--prompt`: "Generate a comprehensive competitive audit including: content strategy score, production quality score, SEO optimization score, engagement benchmark, hook/CTA effectiveness score, and 3 actionable recommendations."
- `--json`: true

### 7. Export Report
- Compile findings into PDF via `tools/export_pdf.py`
- Also save structured JSON for cross-referencing with growth strategy workflow

## Edge Cases
- **URL not accessible**: If scraping fails, ask user to paste top 5 post titles/topics manually
- **No clear niche**: If competitor covers multiple niches, identify the dominant one by post volume
- **YouTube transcript unavailable**: Fall back to metadata-only analysis; note the transcript gap
- **Instagram rate limiting**: Instagram scraping may be unreliable; supplement with manual input from the user

## Tools Used
- `tools/discover_creators.py`
- `tools/analyze_video.py`
- `tools/scrape_url.py`
- `tools/web_search.py`
- `tools/claude_generate.py`
- `tools/export_pdf.py`

## Output
- Structured JSON saved for downstream use (growth strategy generation)
- PDF report via `tools/export_pdf.py`
- Saved to `content_outputs` table with type "competitor_intel"

## Cross-References
- `.claude/skills/competitor-research/SKILL.md` — Full competitor research skill with detailed analysis templates
- `workflows/growth_strategy.md` — Feed competitor insights into growth strategy generation
