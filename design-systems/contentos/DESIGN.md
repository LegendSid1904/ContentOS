# Design System: ContentOS

> Category: Productivity & SaaS
> AI content operating system for creators. Near-black canvas, lavender-blue accent, precision typography — inspired by Linear.

## 1. Visual Theme & Atmosphere

ContentOS has evolved into a **near-black precision canvas** — a dark, developer-crafted interface where depth comes from surface stepping and hairline borders, not shadows. The canvas is `#010102` (near-pure black with a faint blue tint), creating a deep foundation that makes content pop.

The interface reads like a professional creative tool: clean surfaces, precise typography, and a single lavender-blue accent (`#5e6ad2`) used with extreme restraint — only on the brand mark, primary CTAs, and focus rings. Every other element uses the surface/hairline/ink token system.

**Key Characteristics:**
- Near-black canvas: `#010102`, surface-1 `#0f1011`, surface-2 `#141516`, surface-3 `#18191a`
- Inter for all text (display + body), JetBrains Mono for code only
- Single accent: lavender-blue `#5e6ad2` — one color, scarce usage
- Hairline borders (`1px solid #23252a`) instead of luminance stepping
- Zero shadows — depth through surface ladder + hairline borders
- Generous section spacing (96px vertical rhythm)
- Negative letter-spacing on display typography
- Product UI screenshots as primary visual elements
- All-caps labels with letter-spacing where hierarchical contrast is needed

## 2. Color Palette & Roles

### Background Surfaces
| Surface | Value | Usage |
|---------|-------|-------|
| **Canvas** | `#010102` | Deepest canvas — page backgrounds |
| **Surface 1** | `#0f1011` | Cards, panels, containers |
| **Surface 2** | `#141516` | Featured cards, hovered surfaces |
| **Surface 3** | `#18191a` | Sub-nav, deeper panels |
| **Surface 4** | `#191a1b` | Deepest lifted surface |

### Foreground Text
| Token | Value | Usage |
|-------|-------|-------|
| **Ink** | `#f7f8f8` | Headings, navigation, primary content |
| **Ink Muted** | `#d0d6e0` | Body text, secondary descriptions |
| **Ink Subtle** | `#8a8f98` | Metadata, captions, placeholders |
| **Ink Tertiary** | `#62666d` | Timestamps, disabled states |

### Accent System (Single)
| Token | Value | Usage |
|-------|-------|-------|
| **Lavender Blue** | `#5e6ad2` | Primary accent — CTAs, brand mark, focus rings |
| **Lavender Hover** | `#828fff` | Hover states for accent elements |
| **Lavender Focus** | `#5e69d1` | Focus ring tint |

### Hairline Borders
| Token | Value | Usage |
|-------|-------|-------|
| **Hairline** | `#23252a` | Standard card borders, dividers |
| **Hairline Strong** | `#34343a` | Stronger borders, input focus |
| **Hairline Tertiary** | `#3e3e44` | Nested surface borders |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| **Success** | `#27a644` | Completed operations, status pills |
| **Warning** | `#eab308` | Warnings |

## 3. Typography Rules

### Font Family
- **Display/Body**: `Inter`, with fallbacks: `SF Pro Display, -apple-system, system-ui, sans-serif`
- **Mono**: `JetBrains Mono`, with fallbacks: `ui-monospace, SF Mono, Menlo, Monaco, Consolas, monospace`
- **Usage**: Mono reserved exclusively for code blocks and data display. All UI chrome uses Inter.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|------|--------|-------------|----------------|-------|
| Hero Display XL | Inter | 80px (5.00rem) | 600 | 1.05 | -3.0px | Landing hero |
| Hero Display LG | Inter | 56px (3.50rem) | 600 | 1.10 | -1.8px | Section openers |
| Hero Display MD | Inter | 40px (2.50rem) | 600 | 1.15 | -1.0px | Sub-section headlines |
| Heading 1 | Inter | 28px (1.75rem) | 600 | 1.20 | -0.6px | Page titles |
| Heading 2 | Inter | 22px (1.38rem) | 500 | 1.25 | -0.4px | Card titles |
| Body Large | Inter | 18px (1.13rem) | 400 | 1.50 | -0.1px | Lead paragraphs |
| Body | Inter | 16px (1.00rem) | 400 | 1.50 | -0.05px | Paragraph text |
| Body Small | Inter | 14px (0.88rem) | 400 | 1.50 | normal | Secondary text |
| Label | Inter | 12px (0.75rem) | 500 | 1.30 | 0.4px | Eyebrow, labels |
| Micro | Inter | 11px (0.69rem) | 500 | 1.00 | 0.06em | Metadata |
| Button | Inter | 14px (0.88rem) | 500 | 1.20 | normal | All button labels |

### Principles
- Negative tracking on display (up to -3.0px at 80px)
- Single voice from display to body — same family, narrower weights
- Eyebrow/label uses positive tracking (+0.4px) for hierarchical contrast
- Mono only in code contexts — never on UI chrome

## 4. Component Stylings

### Buttons

**Primary Button**
- Background: `#5e6ad2` (lavender-blue accent)
- Text: `#ffffff`
- Font: 14px Inter, weight 500
- Border-radius: 8px
- Padding: 8px 14px
- Border: none
- Hover: background `#828fff`
- Pressed: background `#5e69d1`, scale(0.98)

**Secondary Button**
- Background: `#0f1011` (surface-1)
- Border: `1px solid #23252a`
- Text: `#f7f8f8`
- Font: 14px Inter, weight 500
- Hover: background `#141516`, border `#34343a`

**Ghost Button**
- Background: transparent
- Text: `#8a8f98`
- Hover: background `rgba(255,255,255,0.03)`, text `#f7f8f8`
- Radius: 6px

### Cards & Containers

**Standard Card**
- Background: `#0f1011` (surface-1)
- Border: `1px solid #23252a`
- Border-radius: 12px
- Padding: 24px
- No box-shadow

**Product Screenshot Card**
- Background: `#0f1011`
- Border: `1px solid #23252a`
- Border-radius: 16px
- Padding: 24px
- Frames high-fidelity UI screenshots

**Testimonial Card**
- Same as standard card
- Padding: 32px
- Font: 18px body-large

### Inputs & Forms

**Text Input**
- Background: `#0f1011`
- Border: `1px solid #23252a`
- Border-radius: 8px
- Padding: 8px 12px
- Font: 16px Inter, color `#f7f8f8`
- Focus: `1px solid #34343a` + lavender focus ring
- Placeholder: `#62666d`

**Field Label**
- Font: 14px Inter, weight 500
- Color: `#8a8f98`

### Navigation

**Top Nav**
- Background: `#010102` (canvas)
- Text: `#f7f8f8`
- Height: 56px
- Sticky, backdrop-blur

**Status Badge**
- Background: `#141516` (surface-2)
- Text: `#d0d6e0`
- Font: 12px, weight 400
- Border-radius: 9999px (pill)
- Padding: 2px 8px

## 5. Layout Principles

### Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 96
- Section spacing: 96px on desktop

### Grid & Container
- Max content width: 1280px
- Dashboard: fluid with 240px sidebar
- Landing page: centered, product-screenshot-led

### Depth & Elevation

| Level | Treatment | Usage |
|-------|-----------|-------|
| Canvas (0) | `#010102` | Page background |
| Surface 1 (1) | `#0f1011` + 1px hairline | Default cards |
| Surface 2 (2) | `#141516` + 1px strong hairline | Featured, hovered |
| Surface 3 (3) | `#18191a` + 1px hairline | Sub-nav, deeper |
| Surface 4 (4) | `#191a1b` | Deepest |

**No drop shadows.** Depth is carried entirely by surface ladder + hairline borders.

## 6. Motion Principles

### Transitions
- All interactive elements: 200ms ease
- Hover lift: translateY(-1px) on buttons and cards
- Press: scale(0.98)

### Entry Animations
- Elements never appear statically on load
- Staggered fade-up: translateY(12px) → translateY(0) with opacity
- Delays: 50ms increments
- Use IntersectionObserver for scroll-triggered reveals

## 7. Do's and Don'ts

### Do
- Use `#010102` as the anchor surface — the faint blue tint is intentional
- Use Inter for all UI text — nav, labels, content
- Reserve JetBrains Mono for code blocks and data display only
- Use lavender-blue accent sparingly — brand mark, primary CTA, focus
- Use surface ladder + hairline borders for depth — no shadows
- Apply negative letter-spacing on display text
- Use uppercase labels only for hierarchical contrast (section eyebrows)
- Keep 8px border-radius on buttons, 12px on cards, 16px on panels

### Don't
- Don't use drop shadows
- Don't use multiple accent colors
- Don't use pure black (`#000000`) as canvas
- Don't use lavender as a section background or card fill
- Don't use pill-round CTAs (use 8px)
- Don't use Inter 700+ on display — 600 max
- Don't use CRT effects, scanlines, grain overlays, or corner brackets
- Don't use Outfit, Roboto, Arial, or Helvetica
- Don't animate layout properties (use transform + opacity only)

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Phone | <640px | Single column, off-canvas nav |
| Tablet | 640-1024px | 2-column grids, collapsed sidebar |
| Desktop | 1024-1280px | Full layout |
| Large | >1280px | Expanded margins |

### Collapsing Strategy
- Navigation: sidebar → hamburger at <768px
- Hero: 80px → 56px → 40px text
- Cards: 3-column → 2-column → single
- Section spacing: 96px → 48px → 32px

## 9. Agent Prompt Guide

### Quick Color Reference
- Canvas: `#010102`
- Surface 1: `#0f1011`
- Surface 2: `#141516`
- Surface 3: `#18191a`
- Ink: `#f7f8f8`
- Ink Muted: `#d0d6e0`
- Ink Subtle: `#8a8f98`
- Ink Tertiary: `#62666d`
- Accent: Lavender Blue `#5e6ad2`
- Accent Hover: `#828fff`
- Hairline: `#23252a`
- Hairline Strong: `#34343a`
- Success: `#27a644`
