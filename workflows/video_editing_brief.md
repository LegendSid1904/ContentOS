# Video Editing Brief — Workflow

## Objective
Generate a detailed video editing brief from a transcript or script, including timestamped edit points, B-roll suggestions, and caption styling.

## Inputs
- **Transcript / Script** (required): Full text of the video content
- **Video Length** (required): Short-form (<90s) or Long-form (>8min)
- **Style** (optional): Fast-cut, Storytelling, Educational, Cinematic

## Steps

### 1. Analyze Transcript
Call `tools/claude_generate.py` with:
- `--system-prompt`: "You are a video editor. Analyze the transcript and identify: hook moment (0-3s), key edit points, retention markers, and natural section breaks. Return as JSON."
- `--prompt`: "Transcript: {transcript}. Style: {style}."
- `--json`: true

**Output:** Analysis with timestamps, edit points, and pacing suggestions.

### 2. Generate B-Roll Keywords
Call `tools/claude_generate.py` with:
- `--system-prompt`: "For each section of the transcript, suggest 3-5 B-roll keywords that can be used with stock footage APIs (Pexels, Pixabay). Return as JSON array with section_timestamp and keywords."
- `--prompt`: "Transcript with timestamps: {analysis_output}."
- `--json`: true

### 3. Build Editing Brief
Compile the analysis, B-roll list, and caption style into a structured editing brief document.

### 4. Export
- Export as PDF via `tools/export_pdf.py`
- Copy to clipboard

## Edge Cases
- **No timestamps in transcript**: Ask Claude to estimate section durations based on content volume
- **Very short script (<30s)**: Skip multi-section analysis, treat as single take with overlay suggestions

## Tools Used
- `tools/claude_generate.py`
- `tools/export_pdf.py`

## Output
Saved to `content_outputs` table with type "editing_brief".
