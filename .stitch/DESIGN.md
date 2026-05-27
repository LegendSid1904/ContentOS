# ContentOS Design System

## Brand
- Name: ContentOS
- Tagline: "field station 01"
- Vibe: Cyberpunk terminal / CRT monitor / 2Advanced Kesey Signal

## Colors

### Dark Void (Base)
- `#050505` — primary background
- `#030308` — loading gate background
- `rgba(5,5,10,0.9)` — terminal overlay

### Purple (Primary Accent)
- `#8B5CF6` — primary (vi-500)
- `#A78BFA` — light (vi-400)
- `#7C3AED` — dark (vi-600)
- Usage: ASCII logo glow, borders, shadows

### Cyan (Secondary Accent)
- `#22D3EE` — secondary (te-400)
- `#06B6D4` — dark (te-500)
- Usage: boot arrows, progress bar, prompt cursor, status indicators

### Green (Status OK)
- `#22C55E` — OK/checkmark
- Usage: boot step completion, success states

### Text
- `rgb(240,238,255)` — primary text (tx-1)
- `rgba(240,238,255,0.7)` — secondary text (tx-2)
- `rgba(240,238,255,0.4)` — tertiary text (tx-3)
- `rgba(240,238,255,0.2)` — muted text (tx-4)

## Typography
- Primary: Hanken Grotesk (sans-serif, headers and body)
- Mono: JetBrains Mono (monospace, terminal UI, code, data)
- Font sizes: 8px (labels), 9px (progress, small UI), 10-11px (boot lines, prompts)

## Components

### Loading Gate (CRT Terminal)
- Fixed fullscreen overlay with `#030308` background
- Terminal frame with 1px purple border (`rgba(139,92,246,0.12)`)
- Subtle box shadow glow
- Top/bottom status bars with uppercase labels (8px, letter-spaced)
- ASCII logo: Unicode block characters with purple glow
- Boot sequence: 6 steps with arrow indicators, animated fade-in
- Progress bar: 3px track with purple-to-cyan gradient
- Prompt section: `[click to activate]` with blinking cursor
- Glitch transition: noise overlay, white flash, horizontal slice shift

### Scanlines Overlay
- Repeating linear gradient, 4px cycle
- Black opacity: 0.06 (very subtle, avoids text distortion)
- Pointer events: none

### Page Layout
- Max-width: 740px centered
- Glass card backgrounds with backdrop-blur
- Terminal-style NAVIGATE block with `>>` prefixes
- Hero section uses `<angle brackets>` format
- Module cards have `[module N]` badges with ASCII corner markers
- Footer: `>end of transmission` / `>session archived ............ ok`

## Component Rules
1. All terminal-style UI uses JetBrains Mono
2. Headers and body text use Hanken Grotesk
3. Glow effects use box-shadow with color opacity
4. Transitions use ease timing, 0.3-0.6s duration
5. No emojis anywhere
6. CRT scanlines stay under 0.1 opacity to avoid text distortion
7. ASCII art uses `█╗╔╚╝║═╗║╚╝╔╗` characters
