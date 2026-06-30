# Design System: ContentOS

> Category: Productivity & SaaS
> AI content operating system for creators. Cyberpunk terminal aesthetic — near-black canvas, violet/teal neon accents, CRT monitor framing, precision monospace typography. Inspired by field-station terminals and cyberdeck interfaces.

## 1. Visual Theme & Atmosphere

ContentOS is a **CRT field station** — a dark, terminal-inspired interface where content feels like it's running on a hardened cyberdeck. The canvas is `#050508` (near-black with subtle blue-violet tint), creating a deep foundation that makes neon accents glow.

The interface reads like a professional broadcast terminal: clean fixed-pitch typography, corner-bracketed panels, scanline overlays, and a dual-accent system of violet (`#8b5cf6`) for primary actions and teal (`#22d3ee`) for system indicators. Each social platform gets its own neon accent on hover.

**Key Characteristics:**
- Near-black canvas: `#050508`, surface ladder from `#0a0a12` to `#242450`
- Hanken Grotesk for UI headings, JetBrains Mono for body text, nav, and all terminal UI
- Dual accent: violet `#8b5cf6` (primary) + teal `#22d3ee` (system status)
- Corner brackets `+` at panel corners for terminal framing
- CRT effects: scanlines, grain overlay, vignette, sweep animation
- Glow effects on interactive elements (`box-shadow` neon pulse)
- Glass panels with `backdrop-filter: blur()` for depth
- Platform-specific accent colors on hover (YouTube red, Instagram pink, TikTok teal, LinkedIn blue)
- Boot sequence: CRT loading gate with staggered animation and progress bar
- All navigation and labels: uppercase with letter-spacing

## 2. Color Palette & Roles

### Background Surfaces
| Surface | Value | Usage |
|---------|-------|-------|
| **Void** | `#050508` | Deepest canvas — page backgrounds |
| **Base** | `#0a0a12` | Secondary surfaces, section backgrounds |
| **Raised** | `#0f0f1e` | Cards, panels, containers |
| **Float** | `#15152a` | Featured cards, elevated surfaces |
| **Overlay** | `#1c1c38` | Modals, dropdowns, deeper panels |
| **Hover** | `#242450` | Hovered surface states |

### Foreground Text
| Token | Value | Usage |
|-------|-------|-------|
| **Text 1** | `#f0eeff` | Headings, navigation labels, primary content |
| **Text 2** | `#c8c6e8` | Body text, secondary descriptions |
| **Text 3** | `#9896b8` | Metadata, labels, subtle text |
| **Text 4** | `#686690` | Timestamps, placeholders, disabled states |

### Violet Accent System (Primary)
| Token | Value | Usage |
|-------|-------|-------|
| **vi-300** | `#a78bfa` | Hover text, secondary accent |
| **vi-400** | `#8b5cf6` | Primary accent — CTAs, brand mark, focus rings |
| **vi-500** | `#7c3aed` | Button backgrounds, active states |
| **vi-600** | `#6d28d9` | Pressed states |

### Teal Accent System (System Status)
| Token | Value | Usage |
|-------|-------|-------|
| **te-300** | `#5eead4` | Success text |
| **te-400** | `#22d3ee` | Terminal cursors, boot arrows, progress bars, scanlines |
| **te-500** | `#06b6d4` | Hover borders |
| **te-600** | `#0891b2` | Active borders |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| **ok (green)** | `#22c55e` | Completed operations, status pills, boot OK |
| **warn (amber)** | `#eab308` | Warnings |
| **err (red)** | `#ef4444` | Errors, YouTube accent |
| **info (sky)** | `#38bdf8` | Info badges, LinkedIn accent |

### Border System
| Token | Value | Usage |
|-------|-------|-------|
| **bd-1** | `rgba(255,255,255,0.03)` | Default card borders |
| **bd-2** | `rgba(255,255,255,0.06)` | Stronger borders |
| **bd-3** | `rgba(255,255,255,0.10)` | High-contrast borders |
| **bd-v** | `rgba(139,92,246,0.30)` | Violet accent borders |
| **bd-t** | `rgba(34,211,238,0.20)` | Teal accent borders |

### Platform Accent Colors
| Platform | Color | Value | Usage |
|----------|-------|-------|-------|
| **YouTube** | Red | `#ef4444` | Card border/glow on hover |
| **Instagram** | Pink | `#ec4899` | Card border/glow on hover |
| **TikTok** | Teal | `#22d3ee` | Card border/glow on hover |
| **LinkedIn** | Blue | `#60a5fa` | Card border/glow on hover |

## 3. Typography Rules

### Font Family
- **Display (UI headings)**: `Hanken Grotesk`, with fallbacks: `ui-sans-serif, system-ui, sans-serif`
- **Mono (body, nav, all UI chrome)**: `JetBrains Mono`, with fallbacks: `ui-monospace, SF Mono, Menlo, Monaco, Consolas, monospace`
- **Usage**: Mono IS the default UI font — navigation, labels, buttons, body text, cards. Hanken Grotesk is reserved for headings, hero text, and display typography.

### Hierarchy
| Role | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|------|--------|-------------|----------------|-------|
| Hero Display | Hanken Grotesk | clamp(44px, 7vw, 80px) | 700 | 1.0 | -0.04em | Landing hero titles |
| Section Title | Hanken Grotesk | 24px | 700 | 1.15 | -0.02em | Section openers |
| Card Title | Hanken Grotesk | 16px | 600 | 1.2 | — | Module names |
| Nav Link | JetBrains Mono | 11px | 400 | 1.0 | 0.08-0.12em | Sidebar, top navigation |
| Body | JetBrains Mono | 12-13px | 400 | 1.4-1.7 | — | Description, content |
| Button | JetBrains Mono | 12px | 400 | 1.0 | 0.12em | All button labels |
| Tag/Badge | JetBrains Mono | 9-10px | 400 | 1.0 | 0.08-0.12em | Status badges, labels |
| Boot Sequence | JetBrains Mono | 10px | 400 | — | 0.02em | Terminal boot lines |
| Micro Labels | JetBrains Mono | 7-9px | 400 | 1.0 | 0.15-0.24em | CRT corner indicators, status |

### Principles
- All UI chrome (nav, buttons, labels, cards, badges) uses JetBrains Mono
- Hanken Grotesk only for headings and hero display text
- ALL nav text is uppercase with letter-spacing
- Negative tracking on display text (up to -0.04em at hero sizes)
- Section eyebrow labels: 11px mono, uppercase, 0.18em tracking

## 4. Component Stylings

### Buttons

**Primary Action Button (`.btn-terminal-primary`)**
- Font: 12px JetBrains Mono, uppercase, 0.12em letter-spacing
- Background: `rgba(139,92,246,0.06)`
- Border: `1px solid rgba(139,92,246,0.2)`
- Text: `#a78bfa` (vi-300)
- Border-radius: 2px
- Padding: 0 20px
- Min-height: 44px
- Hover: text `#ffffff`, background `rgba(139,92,246,0.2)`, border `rgba(139,92,246,0.5)`

**Default Terminal Button (`.btn-terminal`)**
- Font: 12px JetBrains Mono, uppercase, 0.12em letter-spacing
- Background: transparent
- Border: `1px solid rgba(255,255,255,0.06)`
- Text: `#c8c6e8`
- Border-radius: 2px
- Padding: 0 20px
- Hover: text `#f0eeff`, background `rgba(255,255,255,0.03)`, border `rgba(255,255,255,0.10)`

### Cards & Containers

**Glass Card (`.glass-card`)**
- Background: `rgba(15, 15, 30, 0.6)`
- Backdrop-filter: `blur(12px)`
- Border: `1px solid rgba(255,255,255,0.04)`
- No border-radius (sharp terminal corners)

**Module Card (`.module-card-2a`)**
- Background: `rgba(0, 0, 0, 0.25)`
- Border: `1px solid rgba(255,255,255,0.04)`
- Border-radius: 2px
- Padding: 20px
- Corner brackets: `+` pseudo-elements at top-left and bottom-right
- Hover: background `rgba(255,255,255,0.04)`
- Platform hover: colored border/glow per platform (red/pink/teal/blue)

**Terminal Frame (`.terminal-frame`)**
- Border: `1px solid rgba(34, 211, 238, 0.06)`
- Border-radius: 2px
- Background: `rgba(0,0,0,0.2)`
- Top glow line: `linear-gradient(90deg, transparent, rgba(34,211,238,0.08), transparent)`

**ASCII Box (`.ascii-box`)**
- Border: `1px solid rgba(255,255,255,0.06)`
- Background: `rgba(0,0,0,0.2)`
- Corner brackets: `+` characters at corners

### Sidebar Navigation

**Sidebar Panel (`.sidebar-glass`)**
- Background: `rgba(5, 5, 8, 0.85)`
- Backdrop-filter: `blur(16px)`
- Border-right: `1px solid rgba(255,255,255,0.03)`
- Width: 240px

**Sidebar Link (`.sidebar-link`)**
- Font: 11px JetBrains Mono, uppercase, 0.08em letter-spacing
- Color: `#9896b8` (tx-3)
- Min-height: 40px
- Padding: 0 12px
- Border-radius: 2px
- Border: `1px solid transparent`
- Hover: color `#f0eeff`, background `rgba(139,92,246,0.06)`, border `rgba(139,92,246,0.08)`
- Active: color `#f0eeff`, background `rgba(139,92,246,0.08)`, border `rgba(139,92,246,0.12)`, teal left border indicator

### Inputs & Forms

**Terminal Input (`.term-field`)**
- Background: `rgba(0,0,0,0.35)`
- Border: `1px solid rgba(255,255,255,0.04)`
- Border-radius: 2px
- Padding: 8px 12px
- Font: 12px JetBrains Mono
- Color: `#f0eeff`
- Caret: `#22d3ee` (teal)
- Focus: border `rgba(139,92,246,0.18)`, box-shadow `0 0 12px rgba(139,92,246,0.04)`
- Placeholder: `#686690`

**Field Label (`.field-label`)**
- Font: 11px JetBrains Mono, uppercase, 0.2em letter-spacing
- Color: `#9896b8`

### CRT Loading Gate

The loading gate is a full-screen terminal boot sequence shown on first visit.

**Frame:**
- Background: `rgba(5,5,10,0.88)`
- Backdrop-filter: `blur(12px)`
- Violet glow: `0 0 40px rgba(139,92,246,0.06)`
- Corner brackets: teal `rgba(0,219,231,0.25)`, 32px brackets

**CRT Effects:**
- Scanlines: `repeating-linear-gradient` at 15% opacity
- Vignette: `radial-gradient(ellipse at center, transparent 40%, rgba(5,5,10,0.8) 100%)`
- CRT sweep: `1px` line animating top-to-bottom over 8s
- Grain overlay: SVG noise texture at 20% opacity

**Boot Sequence:**
- Logo: gradient violet/teal with drop-shadow glow
- Progress bar: teal-to-violet gradient with 200% shimmer
- Lines: staggered fade-in with `> arrow` prefix in teal
- Prompt: `[PRESS ENTER TO ACTIVATE]` with breathePulse animation

**Glitch Transition:**
- `hue-rotate` + brightness flash sequence
- Noise overlay during transition

### Status Badges
**Tag (`.tag-terminal`)**
- Font: 10px JetBrains Mono, uppercase, 0.08em letter-spacing
- Background: `rgba(0,0,0,0.15)`
- Border: `1px solid rgba(255,255,255,0.04)`
- Text: `#9896b8`
- Border-radius: 2px
- Height: 22px, padding: 0 10px

**Diagnostic Badges (`.diag-badge`)**
- Font: 9px JetBrains Mono, uppercase, 0.12em letter-spacing
- Border-radius: 1px
- `.diag-ok`: green `#22c55e`, border `rgba(34,197,94,0.2)`, bg `rgba(34,197,94,0.06)`
- `.diag-info`: teal `#22d3ee`, border `rgba(34,211,238,0.15)`, bg `rgba(34,211,238,0.05)`
- `.diag-idle`: muted, border `rgba(255,255,255,0.04)`

## 5. Layout Principles

### Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
- Section spacing: 32px on dashboard, 96px on landing

### Grid & Container
- Max content width: 1024px (wrapper)
- Dashboard: fluid with 240px sidebar
- Landing page: centered, terminal-frame-led
- Module grid: `repeat(auto-fill, minmax(200px, 1fr))`
- Usage grid: `repeat(auto-fill, minmax(170px, 1fr))`

### Depth & Elevation

| Level | Treatment | Usage |
|-------|-----------|-------|
| Void (0) | `#050508` | Page background |
| Base (1) | `#0a0a12` | Section backgrounds |
| Raised (2) | `#0f0f1e` + glass | Default cards |
| Float (3) | `#15152a` + glass + border | Featured, hovered |
| Overlay (4) | `#1c1c38` + glass | Modals, deeper panels |
| Overlay+ (5) | `#242450` | Hovered overlays |

**Depth via glass + glow.** Background surfaces are flat. Depth comes from backdrop-filter blur, border opacity stepping, and violet/teal glow `box-shadow`. No drop shadows in the traditional sense — neon glow rings replace them.

### CRT Framing
- Corner brackets (`+` characters at panel corners) are a signature element
- Terminal frames have a subtle teal upper glow line
- All panels should feel like CRT monitor viewports

## 6. Motion Principles

### Transitions
- All interactive elements: `150ms cubic-bezier(0.16, 1, 0.3, 1)` (ease-default)
- Hover: border-color + background tint
- Transform/opacity only for layout-safe animations

### CRT Animations
- **cursorBlink**: 1.1s step-end infinite — terminal cursors
- **barShimmer**: 2s linear infinite — progress bar gradient sweep
- **scanDown**: 2.2s ease-in-out infinite — CRT scan overlay
- **glowPulse**: 3s ease-in-out infinite — neon glow breathing
- **crtSweep**: 8s linear infinite — horizontal CRT line sweep
- **gridScroll**: 20s linear infinite — cyber grid background

### Boot Sequence Animations
- **logoFadeIn**: 0.4s ease — logo opacity reveal
- **bootFadeIn**: 0.3s ease — staggered boot line reveal
- **breathePulse**: 2.4s ease-in-out infinite — CTA prompt pulse
- **revealUp**: 0.35s ease — element slide-up entrance

### Glitch Transition
- **glitchOut**: 0.6s ease — hue-rotate sequence + brightness flash
- Noise overlay at 0.12s steps(2) infinite during transition

### Entry Animations
- Loading gate boot sequence with staggered line reveals
- Module cards: appear on scroll, no static load
- Use IntersectionObserver for scroll-triggered reveals when applicable

## 7. Design Principles

### Do
- Use `#050508` as the anchor surface
- Use JetBrains Mono for ALL UI chrome: nav, labels, buttons, badges, body text
- Use Hanken Grotesk for headings and hero display text ONLY
- Use violet (`#8b5cf6`) as the primary accent — CTAs, brand mark, focus rings
- Use teal (`#22d3ee`) for system indicators — cursors, boot arrows, progress, scanlines
- Use uppercase with letter-spacing for all navigation labels
- Use glass surfaces (`backdrop-filter: blur`) for card depth
- Use corner brackets `+` at panel corners
- Use CRT effects (scanlines, grain, glow) for the terminal aesthetic
- Use platform-specific accent colors on module card hover
- Keep 2px border-radius for terminal components, 4px for usage cards

### Don't
- Don't use pure black (`#000000`) as canvas
- Don't use traditional drop shadows — use neon glow instead
- Don't use rounded rectangles for terminal elements — use 2px radius
- Don't use sans-serif for body text or navigation — JetBrains Mono is the UI default
- Don't use Inter, Roboto, Arial, or Helvetica
- Don't use single accent color — violet + teal dual-accent is required
- Don't show content without CRT framing where appropriate
- Don't use pill-round buttons
- Don't animate layout properties (use transform + opacity only)
- Don't skip the loading gate boot sequence on the first visit

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Phone | <640px | Single column, off-canvas nav |
| Tablet | 640-1024px | 2-column grids, collapsed sidebar |
| Desktop | 1024-1280px | Full layout |
| Large | >1280px | Expanded margins |

### Collapsing Strategy
- Navigation: sidebar → off-canvas at <768px
- Hero: clamp to smaller sizes
- Module grid: 3-column → 2-column → single
- Section spacing: 96px → 48px → 32px

## 9. Agent Prompt Guide

### Quick Color Reference
- Void: `#050508`
- Base: `#0a0a12`
- Raised: `#0f0f1e`
- Float: `#15152a`
- Overlay: `#1c1c38`
- Hover: `#242450`
- Text 1: `#f0eeff`
- Text 2: `#c8c6e8`
- Text 3: `#9896b8`
- Text 4: `#686690`
- Primary Accent (Violet): `#8b5cf6`
- System Accent (Teal): `#22d3ee`
- Success: `#22c55e`
- Warning: `#eab308`
- Error: `#ef4444`
- Border Light: `rgba(255,255,255,0.03)`
- Border Medium: `rgba(255,255,255,0.06)`
- Border Violet: `rgba(139,92,246,0.30)`
- Border Teal: `rgba(34,211,238,0.20)`

### Quick Font Reference
- Display/Headings: Hanken Grotesk (weights 300-700)
- UI/Body/Code: JetBrains Mono (weights 400-700)
