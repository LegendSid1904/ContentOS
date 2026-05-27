# ContentOS AI — Atomic Task List

## Phase 0: Foundation & Setup

### Environment & Repo
- [x] Initialize Next.js 15 project with TypeScript + Tailwind CSS v4
- [x] Set up project structure: `app/`, `components/`, `lib/`, `tools/`, `workflows/`, `.tmp/`
- [x] Configure ESLint
- [x] Set up Drizzle ORM schema + migrations (tables pushed to Supabase)
- [x] Configure Supabase project (db, storage, RLS policies)
- [x] Set up Clerk authentication (login, signup)
- [ ] Configure Razorpay + Stripe webhooks and billing
- [ ] Deploy to Vercel (production + preview)
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
- [ ] Create component: Hook selection cards (numbered, selectable)
- [x] Create component: Scan loader (AI scanning animation with status lines)
- [x] Create component: Modal/Drawer for settings and exports
- [x] Implement grain texture overlay
- [x] Implement ambient glow orbs (orb-1, orb-2, orb-3)
- [x] Add reveal animation utility (opacity 0→1, translateY 18px→0, staggered delays)
- [x] Define and document motion tokens (ease, easing, durations t1/t2/t3/t4)
- [x] Build scrollbar styling (thin, dark)

### WAT Framework — Tool Scripts
- [x] Create `tools/claude_generate.py` — Groq-based AI generator with structured JSON output
- [ ] Create `tools/claude_stream.py` — streaming AI response handler
- [x] Create `tools/web_search.py` — search via Tavily API
- [ ] Create `tools/scrape_url.py` — extract content from a URL (for competitor analysis)
- [x] Create `tools/export_pdf.py` — convert text/content to PDF
- [ ] Create `tools/export_docx.py` — convert text to DOCX
- [ ] Create `tools/canva_export.py` — push design brief to Canva API
- [ ] Create `tools/brand_kit_validator.py` — validate brand kit completeness
- [ ] Create `tools/file_upload.py` — handle file uploads to Supabase Storage / R2

### WAT Framework — Workflows
- [x] Create `workflows/script_writing.md` — SOP for Module 1
- [ ] Create `workflows/video_editing_brief.md` — SOP for Module 2
- [ ] Create `workflows/carousel_maker.md` — SOP for Module 3
- [x] Create `workflows/content_ideas.md` — SOP for Module 4
- [ ] Create `workflows/competitor_intel.md` — SOP for Module 5
- [ ] Create `workflows/page_setup.md` — SOP for Module 6
- [x] Create `workflows/thumbnail_maker.md` — SOP for Module 7
- [ ] Create `workflows/growth_strategy.md` — SOP for Module 8
- [ ] Create `workflows/onboarding.md` — SOP for new user setup flow

---

## Phase 1: Auth & Onboarding (MVP)

### User Authentication
- [x] Set up Clerk provider in root layout
- [x] Create sign-in page (email, Google)
- [x] Create sign-up page (email, Google)
- [ ] Create user profile / account settings page
- [x] Set up Clerk webhooks → sync user to Supabase
- [x] Implement session management (middleware route protection + redirects)
- [ ] Create onboarding flow: Step 1 → Set Niche
- [x] Create Brand Kit page (colors, fonts, tone, platforms)
- [ ] Create onboarding flow: Step 3 → Choose Primary Platform
- [ ] Create onboarding flow: Step 4 → First Script (quick win)
- [x] Create Brand Kit model in Drizzle schema
- [ ] Create Brand Kit CRUD operations
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
- [ ] Create tRPC router for script generation
- [ ] Build Script Writer page UI (input form: topic, audience, platform, tone)
- [ ] Implement hook generator (5 hooks using PAS / AIDA / Open Loop frameworks)
- [ ] Build hook selection UI (selectable cards)
- [ ] Implement full script generation with streaming (Vercel AI SDK `useChat`)
- [ ] Build script output display (AI Output Block with Geist Mono, timestamps, B-roll cues, CTA)
- [ ] Add tone control selector (Educational, Entertaining, Motivational, Controversial, Storytelling)
- [ ] Add platform presets (YouTube 8-15 min, Shorts/Reels 30-90 sec, LinkedIn 60-90 sec)
- [ ] Implement script-to-hook repurposing (generate 5 short-form hooks from long script)
- [ ] Add Hinglish / regional language support toggle
- [ ] Implement script version history + A/B variant generation
- [ ] Build export feature: Copy to clipboard
- [ ] Build export feature: Download PDF
- [ ] Build export feature: Teleprompter view
- [ ] Save script to project history in Supabase

### Module 4 — Content Idea Engine
- [ ] Create tRPC router for idea generation
- [ ] Build Content Ideas page UI (niche + audience input)
- [ ] Implement niche-specific idea generator (30 ideas)
- [ ] Implement trend-surfing mode (web search → trending topics → ideas)
- [ ] Build content pillars framework (organize ideas under 4-5 pillars)
- [ ] Implement viral angle finder (10 unique angles per topic)
- [ ] Build 30-day content calendar generator
- [ ] Implement idea rating system (Shareability, SEO value, Effort scores)
- [ ] Build repurposing map (for any idea, show 6 formats)
- [ ] Save ideas to project / export as PDF

### Module 7 — Thumbnail Maker (Brief + Concept)
- [ ] Create tRPC router for thumbnail brief generation
- [ ] Build Thumbnail Maker page UI
- [ ] Implement thumbnail concept generator (5 concepts per video/post)
- [ ] Implement headline text optimizer (2-5 words, CTR-optimized)
- [ ] Build visual direction brief (color palette, facial expression, background, props)
- [ ] Implement Canva prompt generator (ready-to-paste design prompts)
- [ ] Build A/B thumbnail test planner framework
- [ ] Create thumbnail swipe file saver
- [ ] Add platform size presets (YouTube 1280×720, Instagram 1:1/4:5, LinkedIn)
- [ ] Export brief as PDF

### Brand Kit Integration
- [ ] Wire Brand Kit into Script Writer (auto-fill niche, tone, platform)
- [ ] Wire Brand Kit into Idea Engine (niche for ideas)
- [ ] Wire Brand Kit into Thumbnail Maker (brand colors for visual direction)

### Billing (MVP)
- [ ] Create Razorpay subscription plan for Creator (₹1999/mo)
- [ ] Implement plan gating on module usage (5 scripts/mo free, unlimited paid)
- [ ] Build plan upgrade/downgrade flow
- [ ] Create billing portal UI (current plan, usage, invoices)
- [ ] Set up Razorpay webhook handler (payment.captured, subscription events)
- [ ] Sync subscription status to Supabase user record
- [ ] Implement usage tracking (credits used vs allowed)

---

## Phase 3: Growth Modules

### Module 3 — Carousel & Graphic Maker
- [ ] Create tRPC router for carousel generation
- [ ] Build Carousel Maker page UI
- [ ] Implement carousel outline generator (5-10 slide narrative)
- [ ] Implement slide copy writer (1-3 lines per slide, engagement-optimized)
- [ ] Create 10+ Canva-compatible design templates with brand color injection
- [ ] Build cover slide headline optimizer (5 headline variants)
- [ ] Build call-to-action slide builder (slide 2 + final slide CTA)
- [ ] Integrate Canva API for template export
- [ ] Build fallback export: PNG/JPG image assets
- [ ] Save carousel to project history

### Module 6 — Content Page Setup Assistant
- [ ] Create tRPC router for page setup
- [ ] Build Page Setup page UI
- [ ] Implement platform-specific bio writer (Instagram, YouTube, LinkedIn, Twitter/X)
- [ ] Implement channel/page keyword optimizer
- [ ] Build highlight cover naming & strategy tool
- [ ] Build link-in-bio page copy writer (headline, sub-headline, CTA)
- [ ] Implement YouTube channel description writer with keyword integration
- [ ] Build pinned post / featured content strategy recommendation
- [ ] Implement profile audit report (grade + improvement suggestions)

### Module 5 — Competitor Intelligence (Basic)
- [ ] Create tRPC router for competitor analysis
- [ ] Build Competitor Intel page UI (paste URL, select depth)
- [ ] Implement competitor profile analysis (AI breakdown from YouTube/Instagram URL)
- [ ] Implement top content audit (top 10 performing posts + why they worked)
- [ ] Build content gap finder (topics competitor covers vs you don't)
- [ ] Implement posting frequency & format analysis
- [ ] Build hook & thumbnail pattern analysis
- [ ] Generate opportunity report as PDF
- [ ] Build swipe file saver (save competitor patterns)

### 30-Day Content Calendar
- [ ] Build calendar view UI from generated content ideas
- [ ] Implement drag-and-drop scheduling
- [ ] Add platform assignment per day
- [ ] Build calendar export (PDF / image)

---

## Phase 4: Scale Modules

### Module 2 — Video Editing with Claude Skills
- [ ] Create tRPC router for editing brief generation
- [ ] Build Video Editing Brief page UI (upload transcript / video)
- [ ] Implement transcript analysis (upload transcript, get timestamped edit points)
- [ ] Generate Claude editing brief (detailed editing instruction doc)
- [ ] Implement B-roll keyword list generation (Pexels/Pixabay API)
- [ ] Build caption style generator (3 styles: bold, minimal, viral, with timing data)
- [ ] Implement clip sequence suggester (best clip order for retention)
- [ ] Implement hook clip identifier (pinpoint 0-3 second hook moment)
- [ ] Export to editing brief (PDF / Notion / Google Docs)

### Module 5 — Competitor Intelligence (Deep)
- [ ] Implement deep scan mode (comprehensive competitor channel analysis)
- [ ] Add multi-competitor comparison view
- [ ] Build trend analysis over time
- [ ] Add exportable competitive landscape report

### Module 8 — Content Growth Strategy Engine
- [ ] Create tRPC router for growth strategy
- [ ] Build Growth Strategy page UI
- [ ] Implement growth audit (analyze current content performance, identify levers)
- [ ] Build 90-day growth plan generator (week-by-week with milestones)
- [ ] Implement platform-specific strategy (different plans for YouTube, Instagram, LinkedIn)
- [ ] Build monetization roadmap (brand deals → courses → services)
- [ ] Implement algorithm optimization guide (platform-specific tips)
- [ ] Build audience persona builder (detailed ideal audience profile)
- [ ] Create engagement prompt library (DM scripts, comment templates, CTA frameworks)
- [ ] Export strategy as PDF

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
