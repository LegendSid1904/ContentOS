# Content Page Setup — Workflow

## Objective
Generate platform-optimized profile bios, keywords, and content strategy for social media pages.

## Inputs
- **Platform** (required): YouTube / Instagram / LinkedIn / Twitter/X
- **Niche** (required): Content niche
- **Current Bio/Description** (optional): Existing profile text to improve

## Steps

### 1. Generate Platform Bio
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a profile optimization expert. Write 3 bio variants for {platform} optimized for discoverability and conversions. Each bio must include keywords relevant to {niche}. Return as JSON array with variant, bio_text, keyword_usage, character_count."
- `--prompt`: "Niche: {niche}. Current bio: {current_bio}. Platform: {platform}."
- `--json`: true

**Output:** 3 bio variants with keyword analysis and character counts.

### 2. Generate Keywords & Hashtags
Call `tools/claude_generate.py` with:
- `--system-prompt`: "Generate 15 high-impact keywords and 20 hashtags for {niche} on {platform}. Prioritize search volume potential. Return as JSON with keywords array and hashtags array."
- `--prompt`: "Niche: {niche}. Platform: {platform}."
- `--json`: true

### 3. Generate Highlight/Featured Strategy
Call `tools/claude_generate.py` with:
- `--system-prompt`: "Recommend 5-8 Instagram highlight cover categories or YouTube featured sections for a {niche} creator. Each needs: name, description, content_to_include. Return as JSON array."
- `--prompt`: "Niche: {niche}. Bio: {selected_bio}."
- `--json`: true

### 4. Profile Audit
Score the profile on: keyword optimization, bio clarity, brand consistency, and CTAs. Return as JSON with scores (1-10) and improvement suggestions.

## Edge Cases
- **Character limit exceeded**: Auto-truncate bios to platform limits (YouTube: 1000, Instagram: 150, LinkedIn: 2600, Twitter: 160)
- **Multiple platforms**: Run workflow independently for each platform

## Tools Used
- `tools/claude_generate.py`

## Output
Saved to `content_outputs` table with type "page_setup".
