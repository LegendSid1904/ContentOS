# Growth Strategy Engine — Workflow

## Objective
Generate a personalized 90-day growth plan with platform-specific tactics, content strategy, and monetization roadmap.

## Inputs
- **Niche** (required): Content niche
- **Current Followers** (required): Approximate audience size
- **Primary Platform** (required): YouTube / Instagram / LinkedIn / Twitter/X
- **Goals** (required): Brand awareness / Monetization / Community building / Authority
- **Additional Platforms** (optional): Secondary platforms to include
- **Competitor Intel Data** (optional): JSON output from competitor_intel workflow — includes analyzed hooks, CTAs, thumbnails, content gaps, and virality patterns from top competitors

## Steps

### 0. Integrate Competitor Intel (Optional)
If `Competitor Intel Data` is provided, first synthesize competitor findings into the strategy context:
```
python tools/claude_generate.py --system-prompt "You are a growth strategist integrating competitive research into a personalized growth plan. Extract the most actionable insights from the competitor data: winning hook archetypes, CTA patterns, thumbnail formulas, content format preferences, and content gaps. Return as JSON with: recommended_hooks, recommended_ctas, thumbnail_template, format_recommendations, gap_opportunities." --prompt "Competitor intel: {competitor_data}. Creator niche: {niche}. Platform: {platform}." --json
```

This output feeds directly into Steps 1-3 as contextual data, ensuring the growth plan is grounded in real competitive benchmarks rather than generic advice.

### 1. Growth Audit
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a content growth strategist. Analyze the creator's current position and identify growth levers. Consider: content quality, posting consistency, SEO, engagement rate, platform algorithm. Return as JSON with scores and analysis."
- `--prompt`: "Niche: {niche}. Followers: {followers}. Platform: {platform}. Goals: {goals}."
- `--json`: true

**Output:** Audit with strength/weakness analysis and growth levers.

### 2. Generate 90-Day Plan
Call `tools/claude_generate.py` with:
- `--system-prompt`: "Create a week-by-week 90-day growth plan. Each week must have: week_number, theme, content_focus (3-5 post ideas), growth_tactic, milestone. Return as JSON array."
- `--prompt`: "Audit: {audit_output}. Niche: {niche}. Platform: {platform}. Goals: {goals}."
- `--json`: true

**Output:** 12-week plan with weekly themes, content focus, and milestones.

### 3. Monetization Roadmap
Call `tools/claude_generate.py` with:
- `--system-prompt`: "Create a 3-phase monetization roadmap. Phase 1 (0-30 days): foundation. Phase 2 (30-60 days): first revenue. Phase 3 (60-90 days): scaling. Include specific tactics for each phase. Return as JSON."
- `--prompt`: "Niche: {niche}. Followers: {followers}. Platform: {platform}."
- `--json`: true

### 4. Algorithm Optimization Guide
Generate platform-specific algorithm tips based on the creator's niche and goals. Include: best posting times, content formats that perform best, SEO tactics, and engagement strategies.

### 5. Export Strategy
- Compile full strategy as PDF via `tools/export_pdf.py`

## Edge Cases
- **Very small audience (<1000)**: Focus strategy on discovery tactics (SEO, hashtags, collaborations)
- **Multiple platforms**: Generate primary platform plan first, then adaptation notes for secondary platforms
- **Unrealistic goals**: If goals don't match follower count (e.g., 100 followers → monetization in 30 days), flag and suggest intermediate milestones
- **No competitor data available**: Generate strategy using platform best practices and general niche benchmarks instead
- **Competitor data is outdated**: If competitor intel is >90 days old, flag that social media trends may have shifted; treat patterns as directional, not definitive

## Tools Used
- `tools/claude_generate.py`
- `tools/export_pdf.py`

## Output
- Structured JSON with full growth plan, hook/CTA playbook, and content matrix
- PDF report via `tools/export_pdf.py`
- Saved to `content_outputs` table with type "growth_strategy"

## Cross-References
- `.claude/skills/competitor-research/SKILL.md` — Full competitor research skill with video-level analysis protocol
- `workflows/competitor_intel.md` — Generate the competitor intel data that feeds into this workflow
