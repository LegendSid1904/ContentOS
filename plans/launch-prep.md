# Launch Prep — Module Gaps & Polish

Priority: Polish before launch (fix gaps and UI before monetizing)

> **Verified against codebase — Jun 2026**

---

## ✅ Completed (verified)

- `app/dashboard/app/[appId]/[moduleId]/page.tsx` — app-aware module routes exist
- `middleware.ts` — `/dashboard/(.*)` is public
- `components/auth/sign-in-modal.tsx` — accepts `context` prop with dynamic messages
- `lib/use-auth-gate.ts` — infrastructure built (sessionStorage counter, gate, preview state restore)
- Sign-in & Sign-up pages — full CRT styling matching (cyber grid, monitor frame, micro labels)
- `lib/constants.ts` — APPS array, TikTok in PLATFORMS, MODULES defined
- All 10 module pages exist (`/dashboard/*`)

---

## Week 1: Module Gaps

### 1.1 ~~App-specific module routes~~ ✅ DONE

### 1.2 Unlock Preview Mode — **CRITICAL GAP**
- ~~Update middleware~~ ✅
- ~~Update SignInModal~~ ✅
- **Wire `useAuthGate` into module pages** ❌ — currently imported in **zero** module pages (script-writer, growth-strategy, competitor-intel, carousel-maker all confirmed missing)
- Modules to wire (×10): script-writer, content-ideas, carousel-maker, competitor-intel, video-brief, thumbnail-maker, page-setup, growth-strategy, brand-kit, dashboard

### 1.3 Growth Strategy PDF export
- Basic `window.print()` exists
- Improve to proper server-side or client-side download

---

## Week 2: UI Polish

### 2.1 Typography bump
| Current | New | Elements |
|---------|-----|----------|
| 6px | 9px | CRT micro labels |
| 7px | 9px | badges, sidebar counts, diag-badges |
| 8px | 10px | tag-terminal, footer, section headers |
| 9px | 11px | sidebar links, breadcrumbs, nav |
| 10px | 12px | button text, status bars |
| 11px | 13px | body text, module names |
> **Status**: Needs verification — check CSS tokens

### 2.2 Font mix
- Swap `font-mono` → `font-display` for body, descriptions, paragraphs
- Keep `font-mono` for labels, status, metadata, badges, data values

### 2.3 Sidebar mode system (`components/sidebar-nav.tsx`)
- Currently no "mode" prop (root/app/system) detected
- Add: root mode (4 apps), app mode (scoped modules + back-link), system mode
- `app/dashboard/shell.tsx` — determine sidebar mode from pathname

### 2.4 Dashboard hub rebuild (`app/dashboard/page.tsx`)
- Stats row (3-4 terminal-style stat cards)
- Recent activity list (last 10 projects in terminal format)
- Platform selector (4 apps as terminal links)
- Add new DB queries: `getRecentProjects(limit: 10)`, `getDashboardStats()`

### 2.5 Card + button polish
- Platform-specific hover glows (YouTube red, Instagram pink, TikTok cyan, LinkedIn blue)
- Enhanced violet CTA glow (`box-shadow: 0 0 40px rgba(139,92,246,0.25)`)
- CRT accent color ties to active app

### 2.6 Cyberpunk card conversion
- Convert `bg-[#0f1011] border border-[#23252a] rounded-r2 p-4` to terminal bracket style
- Dashboard home app cards, module cards, usage cards
- Header bar gets CRT top-border glow + micro labels

---

## Week 3: Testing & Hardening

### 3.1 Error boundaries on all module pages
### 3.2 Set up Vitest + critical path tests
### 3.3 Fix bugs uncovered during polish

---

## File Change Log

| # | File | Change | Phase |
|---|------|--------|-------|
| 1 | Module page files (×8) | Wire useAuthGate | 1.2 |
| 2 | Global CSS / tokens | Typography size bumps | 2.1 |
| 3 | Component files | Font mix swaps | 2.2 |
| 4 | `components/sidebar-nav.tsx` | Sidebar mode system (root/app/system) | 2.3 |
| 5 | `app/dashboard/shell.tsx` | Sidebar mode from pathname | 2.3 |
| 6 | `lib/actions.ts` | Add getRecentProjects, getDashboardStats | 2.4 |
| 7 | `app/dashboard/page.tsx` | Dashboard hub rebuild | 2.4 |
| 8 | `components/ui/module-card.tsx` | Platform glows | 2.5 |
| 9 | Module page files (×8) | Error boundaries | 3.1 |
| 10 | Module CSS | Card conversion to terminal bracket style | 2.6 |
