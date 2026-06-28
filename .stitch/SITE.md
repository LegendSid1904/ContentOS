# ContentOS Site

## Vision
ContentOS is a terminal-inspired AI content operations platform. The entire UX is themed as a "field station" — a command center for managing content workflows across platforms. The aesthetic is 2Advanced Kesey Signal meets retro CRT terminal.

## Pages

### Loading Gate (`/`)
- CRT terminal boot sequence with ASCII logo
- 6-step boot process: kernel init, filesystem mount, AI modules, session, field station, system ready
- Progress bar with purple-to-cyan gradient
- `[click to activate]` prompt → glitch transition → landing page

### Landing Page (`/`)
- NAVIGATE block with `>>` arrowed links
- `<angle bracket>` hero section
- Terminal-style CTA buttons
- Module showcase with ASCII-bordered cards
- `>end of transmission` footer

### Onboarding Flow (`/onboarding`)
- Multi-step onboarding wizard
- Role selection → content types → platform connections → AI preferences
- Progress indicator with completed steps

### Dashboard (`/dashboard`)
- Terminal welcome with `❯` prompt
- `[OK]`/`[INFO]` status badges
- App grid (YouTube, Instagram, TikTok, LinkedIn) — each card shows app name, description, module count
- Glass sidebar with `[Apps]`/`[System]` collapsible sections

### YouTube Workspace (`/dashboard/app/youtube`)
- App header with "app :: youtube" badge, angle-bracket title, and filtered module tags
- Module grid showing 7 YouTube-compatible tools (Script Writer, Content Ideas, Competitor Intel, Video Brief, Thumbnail Maker, Page Setup, Growth Strategy)
- Each module card links to `/dashboard/app/youtube/{moduleId}`
- Sidebar YouTube section auto-expanded, module links nested underneath

### Instagram Workspace (`/dashboard/app/instagram`)
- Same structure, 6 modules (Script Writer, Content Ideas, Carousel Maker, Competitor Intel, Page Setup, Growth Strategy)

### TikTok Workspace (`/dashboard/app/tiktok`)
- Same structure, 5 modules (Script Writer, Content Ideas, Competitor Intel, Page Setup, Growth Strategy)

### LinkedIn Workspace (`/dashboard/app/linkedin`)
- Same structure, 6 modules (Script Writer, Content Ideas, Carousel Maker, Competitor Intel, Page Setup, Growth Strategy)

### Brand Kit (`/dashboard/brand-kit`)
- Brand identity CRUD management
- Terminal-style form panels

### Settings (`/dashboard/settings`)
- Account settings panel
- Onboarding reset option

## Design Notes
- All UI is dark theme (#050505 void)
- Purple (#8B5CF6) and cyan (#22D3EE) accents
- Hanken Grotesk for headers/body, JetBrains Mono for terminal UI
- Scanlines and CRT effects used sparingly to avoid text distortion
- No emoji — all symbols are ASCII/Unicode terminal characters
