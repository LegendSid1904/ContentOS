# Script Writing Engine — Workflow

## Objective
Generate platform-optimized, audience-aligned video scripts from a single prompt.

## Inputs
- **Topic** (required): What the script is about
- **Target Audience** (required): Who this is for
- **Platform** (required): YouTube / Instagram Reels / LinkedIn / YouTube Shorts
- **Tone** (required): Educational / Entertaining / Motivational / Controversial / Storytelling
- **Additional Context** (optional): Brand angle, specific points to cover

## Steps

### 1. Generate Hook Options
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a hook specialist for content creators. Generate 5 high-impact hooks using PAS, AIDA, and Open Loop frameworks. Return as JSON array with fields: id, hook_text, framework."
- `--prompt`: "Topic: {topic}. Audience: {audience}. Platform: {platform}. Tone: {tone}."
- `--json`: true

**Output:** Array of 5 hook objects.

### 2. User Selects Hook
Present hooks to user. User picks one (or requests regeneration).

### 3. Generate Full Script
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a professional script writer. Write a {platform}-optimized script with timestamps, B-roll cues, and CTA placement. Use the selected hook as the opening."
- `--prompt`: "Topic: {topic}. Audience: {audience}. Platform: {platform}. Tone: {tone}. Selected hook: {selected_hook}."
- `--json`: true

**Output:** Script object with sections, timestamps, B-roll notes.

### 4. Post-Generation
- Allow inline edits and section regeneration
- Option to generate short-form hooks from the script (repurposing)
- Export: Copy / PDF / Teleprompter view
- Save to project history

## Edge Cases
- **Empty topic**: Prompt user to provide a topic before proceeding
- **Off-topic generation**: If script doesn't match topic/tone, trigger regeneration with stronger system prompt
- **API timeout**: Retry once; if still fails, show error with "Try again" button

## Tools Used
- `tools/claude_generate.py`
- `tools/export_pdf.py`

## Output
Saved to `content_outputs` table with type "script" and version number.
