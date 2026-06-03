# ContentOS AI — Atomic Task List

## Phase 0: Foundation & Setup

### Environment & Repo
- [x] Initialize Next.js 15 project with TypeScript + Tailwind CSS v4
- [x] Set up project structure: `app/`, `components/`, `lib/`, `tools/`, `workflows/`, `.tmp/`
- [x] Configure ESLint
- [x] Set up Drizzle ORM schema + migrations (tables pushed to Supabase)
- [x] Configure Supabase project (db, storage, RLS policies)
- [x] Set up Clerk authentication (login, signup)
- [ ] Configure Razorpay + Stripe webhooks and billing (deferred)
- [x] Deploy to Vercel (production + preview)
- [x] Set up Sentry error tracking
- [x] Set up PostHog analytics + feature flags
- [x] Set up Resend + React Email for transactional emails
- [x] Configure Trigger.dev for background jobs
- [x] Add Supabase Storage for file exports (replaces Cloudflare R2)

### Design System
- [x] Create CSS tokens (`:root` variables for colors, fonts, spacing, radius, motion)
- [x] Add custom fonts: Clash Display, Satoshi, Geist Mono
- [x] Build base layout: sidebar (208px), top bar (52px), content area
- [x] Build responsive breakpoints (sidebar collapses to off-canvas on <768px)
- [x] Build base layout: sidebar (208px), top bar (52px), content area
- [x] Create component: Navigation items (sidebar nav with icons, active state, badge)
- [x] Create component: Toast notifications (success, error, info)
- [x] Create component: Loading states (progress bar shimmer, skeleton, scan-line animation)
- [x] Create component: Module cards (icon, name, description, hover elevation)
- [x] Create component: Hook selection cards (numbered, selectable)
- [x] Create component: Scan loader (AI scanning animation with status lines)
- [x] Create component: Modal/Drawer for settings and exports
- [x] Implement grain texture overlay
- [x] Implement ambient glow orbs (orb-1, orb-2, orb-3)
- [x] Add reveal animation utility (opacity 0→1, translateY 18px→0, staggered delays)
- [x] Define and document motion tokens (ease, easing, durations t1/t2/t3/t4)
- [x] Build scrollbar styling (thin, dark)
- [x] CRT Field Station UI overhaul: scanlines, vignette, sweep, grain, brackets, micro status bars
- [x] CRT monitor component system (`.crt-monitor`, `.crt-brackets`, `.crt-scanlines`, `.crt-vignette`, `.crt-sweep`, `.crt-grain`)
- [x] Terminal form elements (`.term-field`, `.term-label`, `.spectrum-grid`, `.boot-option`, `.diag-badge`)

### Stitch Design System Alignment
- [x] Full CRT terminal monitor frames on Brand Kit, Settings, and Onboarding pages
- [x] Scanline overlay (`.crt-scanlines`), vignette (`.crt-vignette`), CRT sweep line (`.crt-sweep`)
- [x] Grain texture overlay (`.crt-grain`) and bracket corners (`.crt-brackets`)
- [x] Micro status bars top/bottom (`.crt-micro-tl/tr/bl/br`) matching loading gate
- [x] Boot-step selectors for tone & platform (`.boot-option` with `>>`/`▶` arrows)
- [x] Spectrum grid for color picker (`.spectrum-grid`, `.spectrum-swatch`)
- [x] Diagnostic badges (`.diag-ok`, `.diag-info`, `.diag-idle`)
- [x] Terminal loading sequence (`.boot-loader` with staggered fade-in)
- [x] Consistent typography: Hanken Grotesk + JetBrains Mono, 7px-8px micro labels
- [x] Consistent colors: `#050508` void, `#8B5CF6` purple, `#22D3EE` cyan accents

### WAT Framework — Tool Scripts
- [x] Create `tools/claude_generate.py` — Groq-based AI generator with structured JSON output
- [x] Create `tools/claude_stream.py` — streaming AI response handler
- [x] Create `tools/web_search.py` — search via Tavily API
- [x] Create `tools/scrape_url.py` — extract content from a URL (for competitor analysis)
- [x] Create `tools/export_pdf.py` — convert text/content to PDF
- [x] Create `tools/export_docx.py` — convert text to DOCX
- [x] Create `tools/canva_export.py` — push design brief to Canva API
- [x] Create `tools/brand_kit_validator.py` — validate brand kit completeness
- [x] Create `tools/file_upload.py` — handle file uploads to Supabase Storage / R2

### WAT Framework — Workflows
- [x] Create `workflows/script_writing.md` — SOP for Module 1
- [x] Create `workflows/video_editing_brief.md` — SOP for Module 2
- [x] Create `workflows/carousel_maker.md` — SOP for Module 3
- [x] Create `workflows/content_ideas.md` — SOP for Module 4
- [x] Create `workflows/competitor_intel.md` — SOP for Module 5
- [x] Create `workflows/page_setup.md` — SOP for Module 6
- [x] Create `workflows/thumbnail_maker.md` — SOP for Module 7
- [x] Create `workflows/growth_strategy.md` — SOP for Module 8
- [x] Create `workflows/onboarding.md` — SOP for new user setup flow

---

## Phase 1: Auth & Onboarding (MVP)

### User Authentication
- [x] Set up Clerk provider in root layout
- [x] Create sign-in page (email, Google)
- [x] Create sign-up page (email, Google)
- [x] Create user profile / account settings page
- [x] Set up Clerk webhooks → sync user to Supabase
- [x] Implement session management (middleware route protection + redirects)
- [x] Create onboarding flow: Step 1 → Set Niche
- [x] Create Brand Kit page (colors, fonts, tone, platforms)
- [x] Create onboarding flow: Step 3 → Choose Primary Platform
- [x] Create onboarding flow: Step 4 → First Script (quick win)
- [x] Create Brand Kit model in Drizzle schema
- [x] Create Brand Kit CRUD operations (save, get, delete)
- [x] Build Brand Kit UI (edit, preview, save)

### Dashboard
- [x] Build main dashboard layout (sidebar + top bar + content)
- [x] Dashboard sidebar: 8 module navigation items
- [x] Dashboard top bar: breadcrumb, avatar, plan badge
- [x] Dashboard homepage: module grid with cards
- [x] Dashboard responsive: off-canvas sidebar (≤768px) with hamburger toggle

---

## Phase 2: Core Modules (MVP)

### Module 1 — Script Writing Engine
- [x] Create tRPC router for script generation
- [x] Build Script Writer page UI (input form: topic, audience, platform, tone)
- [x] Implement hook generator (5 hooks using PAS / AIDA / Open Loop frameworks)
- [x] Build hook selection UI (selectable cards)
- [x] Implement full script generation with streaming (Vercel AI SDK `useChat`)
- [x] Build script output display (AI Output Block with Geist Mono, timestamps, B-roll cues, CTA)
- [x] Add tone control selector (Educational, Entertaining, Motivational, Controversial, Storytelling)
- [x] Add platform presets (YouTube 8-15 min, Shorts/Reels 30-90 sec, LinkedIn 60-90 sec)
- [x] Implement script-to-hook repurposing (generate 5 short-form hooks from long script)
- [ ] Add Hinglish / regional language support toggle
- [ ] Implement script version history + A/B variant generation
- [x] Build export feature: Copy to clipboard
- [ ] Build export feature: Download PDF
- [ ] Build export feature: Teleprompter view
- [x] Save script to project history in Supabase

### Module 2 — Content Idea Engine
- [x] Create tRPC router for idea generation
- [x] Build Content Ideas page UI (niche + audience input)
- [x] Implement niche-specific idea generator (30 ideas)
- [x] Implement trend-surfing mode (web search → trending topics → ideas)
- [x] Build content pillars framework (organize ideas under 4-5 pillars)
- [x] Implement viral angle finder (10 unique angles per topic)
- [x] Build 30-day content calendar generator
- [x] Implement idea rating system (Shareability, SEO value, Effort scores)
- [ ] Build repurposing map (for any idea, show 6 formats)
- [x] Save ideas to project / export as PDF

### Module 3 — Carousel Maker
- [x] Create tRPC router for carousel generation
- [x] Build Carousel Maker page UI
- [x] Implement carousel outline generator (5-10 slide narrative)
- [x] Implement slide copy writer (1-3 lines per slide, engagement-optimized)
- [ ] Create 10+ Canva-compatible design templates with brand color injection
- [x] Build cover slide headline optimizer (5 headline variants)
- [ ] Build call-to-action slide builder (slide 2 + final slide CTA)
- [ ] Integrate Canva API for template export
- [ ] Build fallback export: PNG/JPG image assets
- [x] Save carousel to project history

### Module 4 — Video Editing Brief
- [x] Create tRPC router for editing brief generation
- [x] Build Video Editing Brief page UI (upload transcript / video)
- [x] Implement transcript analysis (upload transcript, get timestamped edit points)
- [x] Generate editing brief (detailed editing instruction doc)
- [x] Implement B-roll keyword list generation (Pexels/Pixabay API)
- [x] Build caption style generator (3 styles: bold, minimal, viral, with timing data)
- [x] Implement clip sequence suggester (best clip order for retention)
- [x] Implement hook clip identifier (pinpoint 0-3 second hook moment)
- [ ] Export to editing brief (PDF / Notion / Google Docs)

### Module 5 — Competitor Intelligence
- [x] Create tRPC router for competitor analysis
- [x] Build Competitor Intel page UI (paste URL, select depth)
- [x] Implement competitor profile analysis (AI breakdown from YouTube/Instagram URL)
- [x] Implement top content audit (top 10 performing posts + why they worked)
- [x] Build content gap finder (topics competitor covers vs you don't)
- [x] Implement posting frequency & format analysis
- [x] Build hook & thumbnail pattern analysis
- [ ] Generate opportunity report as PDF
- [x] Build swipe file saver (save competitor patterns)

### Module 6 — Content Page Setup Assistant
- [x] Create tRPC router for page setup
- [x] Build Page Setup page UI
- [x] Implement platform-specific bio writer (Instagram, YouTube, LinkedIn, Twitter/X)
- [x] Implement channel/page keyword optimizer
- [x] Build highlight cover naming & strategy tool
- [x] Build link-in-bio page copy writer (headline, sub-headline, CTA)
- [x] Implement YouTube channel description writer with keyword integration
- [x] Build pinned post / featured content strategy recommendation
- [x] Implement profile audit report (grade + improvement suggestions)

### Module 7 — Thumbnail Maker (Brief + Concept)
- [x] Create tRPC router for thumbnail brief generation
- [x] Build Thumbnail Maker page UI
- [x] Implement thumbnail concept generator (5 concepts per video/post)
- [x] Implement headline text optimizer (2-5 words, CTR-optimized)
- [x] Build visual direction brief (color palette, facial expression, background, props)
- [ ] Implement Canva prompt generator (ready-to-paste design prompts)
- [ ] Build A/B thumbnail test planner framework
- [ ] Create thumbnail swipe file saver
- [x] Add platform size presets (YouTube 1280×720, Instagram 1:1/4:5, LinkedIn)
- [ ] Export brief as PDF

### Module 8 — Content Growth Strategy Engine
- [x] Create tRPC router for growth strategy
- [x] Build Growth Strategy page UI
- [x] Implement growth audit (analyze current content performance, identify levers)
- [x] Build 90-day growth plan generator (week-by-week with milestones)
- [x] Implement platform-specific strategy (different plans for YouTube, Instagram, LinkedIn)
- [x] Build monetization roadmap (brand deals → courses → services)
- [x] Implement algorithm optimization guide (platform-specific tips)
- [ ] Build audience persona builder (detailed ideal audience profile)
- [ ] Create engagement prompt library (DM scripts, comment templates, CTA frameworks)
- [ ] Export strategy as PDF

### Brand Kit Integration
- [x] Wire Brand Kit into Script Writer (auto-fill niche, tone, platform)
- [x] Wire Brand Kit into Idea Engine (niche for ideas)
- [x] Wire Brand Kit into Carousel Maker (auto-fill platform)
- [ ] Wire Brand Kit into Thumbnail Maker (brand colors for visual direction)

### Billing (MVP)
- [ ] Create Razorpay subscription plan for Creator (₹1999/mo)
- [ ] Implement plan gating on module usage (5 scripts/mo free, unlimited paid)
- [ ] Build plan upgrade/downgrade flow
- [ ] Create billing portal UI (current plan, usage, invoices)
- [ ] Set up Razorpay webhook handler (payment.captured, subscription events)
- [ ] Sync subscription status to Supabase user record
- [ ] Implement usage tracking (credits used vs allowed)

### Agency Features
- [ ] Implement multi-client workspaces via Clerk Organizations
- [ ] Build team member management (invite, roles, permissions)
- [ ] Create client switching UI in sidebar
- [ ] Implement per-client brand kits (up to 10 for Agency plan)
- [ ] Build agency dashboard (aggregated view across clients)
- [ ] Implement Agency billing plan (₹5999/mo) via Razorpay
- [ ] Add API access for Agency plan

---

## Phase 5: Platform & Refinement

### API & Integrations
- [ ] Build public API for Agency plan (REST endpoints for module outputs)
- [ ] Create API key management UI
- [ ] Implement API rate limiting + usage tracking
- [ ] Build webhook system (trigger actions on content generation complete)

### Mobile (React Native)
- [ ] Initialize React Native project
- [ ] Build bottom tab navigation (matching web module structure)
- [ ] Implement Script Writer mobile UI
- [ ] Implement Content Ideas mobile UI
- [ ] Implement dashboard mobile UI
- [ ] Push notification setup (content reminders, daily ideas)

### Performance & Polish
- [ ] Implement output caching for common prompts (Redis via Upstash)
- [ ] Add streaming progress indicators across all modules
- [ ] Optimize AI response times (edge functions, prompt caching)
- [ ] Build module usage analytics dashboard for users
- [ ] Add referral program tracking
- [ ] Implement onboarding email sequence (Resend + React Email)
- [ ] Add D7 / D30 retention email automation
- [ ] Build NPS survey + feedback collection
- [ ] Implement error boundaries across all module pages
- [ ] Add keyboard shortcuts (⌘K search, ⌘S save, etc.)

### Testing
- [ ] Set up Vitest for unit tests
- [ ] Set up Playwright for E2E tests
- [ ] Write tests for Script Writing Engine
- [ ] Write tests for Content Idea Engine
- [ ] Write tests for billing flows
- [ ] Write tests for authentication flows
- [ ] Write tests for export functionality

---

## Infrastructure & Operations

- [ ] Set up CI/CD (GitHub Actions: lint, typecheck, test on PR)
- [ ] Configure Vercel preview deployments for each PR
- [ ] Set up staging environment
- [ ] Configure automated DB backups (Supabase point-in-time)
- [ ] Set up uptime monitoring (Better Uptime / Checkly)
- [ ] Create error escalation alerts (Sentry → Slack/Email)
- [ ] Set up usage dashboard (active users, module usage, revenue)
- [ ] Document deployment runbook
- [ ] Create incident response workflow

---

## Marketing & Growth

- [ ] Build marketing landing page (hero, features, pricing, FAQ)
- [ ] Create changelog / product updates page
- [ ] Set up blog for SEO content
- [ ] Build affiliate/referral tracking
- [ ] Create help center / knowledge base
- [ ] Build in-app announcements (PostHog)

---

> **Legend:** `[ ]` = Not started, `[x]` = Done
> **Dependencies:** Phase 1 must be done before Phase 2, Phase 2 before 3, etc.
> **Parallel work:** Design system + tool scripts + workflows can be built concurrently with auth & onboarding.
