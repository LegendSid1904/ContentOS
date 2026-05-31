# Tactical Preview Mode

> ChatGPT-style "one free prompt" pattern for ContentOS modules.

## Core Idea

Let anonymous users see module pages, interact with forms, and get **one free AI generation** before asking them to sign in. Preserve their work through the auth flow. Convert through soft escalation.

---

## The Flow

```
Landing page → clicks module → sees full UI, fills form
  → clicks GENERATE → real AI output! ✅ (1st action = free)
  → tries any action (regenerate, save, copy, export)
  → SIGN-IN MODAL 🔒
  → signs in → work is preserved, now authenticated → full access
```

---

## Phase 1: Core Infrastructure (P0)

### 1. Rewrite `lib/use-auth-gate.ts`

- `useRef` counter tracking free actions used
- First `gate(action)` call: runs action, increments counter
- Subsequent calls: sets `showModal = true`
- Accept optional `context` string for targeted modal messages
- Persist counter in `sessionStorage` (page refresh doesn't reset)

```ts
const { showModal, gate, closeModal, freeActionsLeft } = useAuthGate(context?: string);
```

### 2. Upgrade `components/auth/sign-in-modal.tsx`

- Accept optional `context` prop for dynamic messaging
- Messages adapt to trigger:

| Trigger | Modal says |
|---------|-----------|
| Generate | "authentication required to generate AI content" |
| Save | "authentication required to save this script" |
| Regenerate | "authentication required to regenerate hooks" |

### 3. Remove server-side auth on generation actions

**Files:**
- `lib/actions-script.ts` — remove `!userId` throw from `generateHooks`, `generateScript`
- `lib/actions-content-ideas.ts` — remove `!userId` throw from `generateIdeas`, `generateAngles`, `generateCalendar`

**Keep auth on:** `saveScript`, `saveIdeas` (DB writes require real user)

### 4. Add gate to Brand Kit (`app/dashboard/brand-kit/page.tsx`)

- Import `useAuthGate` + `SignInModal`
- Wrap `handleSave` with `gate("save your brand kit")`
- Wrap `deleteBrandKit` with `gate("delete your brand kit")`
- Show demo preview data when not signed in
- Banner: *"PREVIEW — sign in to save your brand kit"*

---

## Phase 2: Work Preservation (P1) 🔥

### 5. Save/restore preview state across auth redirect

The sign-in modal triggers a Clerk redirect that loses React state.

- Before gate fires, serialize page state to `sessionStorage`
- On page load after sign-in, check `sessionStorage` for preview data
- Restore output, then clear from `sessionStorage`

```ts
// Before redirect:
sessionStorage.setItem("preview_script", JSON.stringify({ hooks, script, step }));

// On mount (after sign-in):
const saved = sessionStorage.getItem("preview_script");
if (saved) { restore state; sessionStorage.removeItem("preview_script"); }
```

Same pattern for Script Writer and Content Ideas.

---

## Phase 3: Visual Indicators (P2)

### 6. Micro status: `"id: active"` → `"id: preview"`

Replace hardcoded status in module monitor headers:

| File | Line |
|------|------|
| `app/dashboard/script-writer/page.tsx` | 188 |
| `app/dashboard/content-ideas/page.tsx` | 294 |
| `app/dashboard/brand-kit/page.tsx` | 112 |

```tsx
const { isSignedIn } = useAuth();
// <span>...{isSignedIn ? "active" : "preview"}</span>
```

### 7. Free-generation countdown in monitor footer

- Before use: *"FREE: 1 generation"*
- After use: *"FREE: 0 — [SIGN IN]"*
- Driven by `freeActionsLeft` from `useAuthGate`

### 8. Post-generation "value callout"

Inline terminal line after successful free generation:

```
* [PREVIEW] generation ready — sign in to save & unlock unlimited use
```

Auto-dismisses after 8 seconds or on next action.

### 9. Dashboard preview welcome (`app/dashboard/page.tsx`)

| Signed in | Preview (anonymous) |
|-----------|-------------------|
| `SESSION :: {name}` | `SESSION :: PREVIEW` |
| `Welcome back, {name}` | `Status: preview mode` |
| `8 modules available` | `8 modules — 1 free generation each` |
| Cursor blinking | `Sign in to save & unlock` |

### 10. Sidebar preview indicator (`app/dashboard/shell.tsx:63-78`)

Replace sign-in link with status block:

```
STATUS: PREVIEW
[1 free gen remaining]  →  [>> SIGN IN]
```

### 11. Middleware comment (`middleware.ts`)

```ts
// /dashboard/* is intentionally public — anonymous users get
// one free AI generation per module before being prompted to sign in.
// Server-side auth still protects DB writes (save/export).
```

---

## Phase 4: Soft Escalation (P3)

### 12. Three-step escalation in `useAuthGate`

| Action # | Behavior |
|----------|----------|
| 1st | Free — runs immediately ✅ |
| 2nd | **Nudge** — runs action + shows small banner: *"like that? [sign in] to save & keep going"* |
| 3rd+ | **Gate** — shows sign-in modal 🔒 |

Configurable (can be set to 2-step hard gate per module).

---

## File Change Summary

| # | File | Change | Phase |
|---|------|--------|-------|
| 1 | `lib/use-auth-gate.ts` | Rewrite (counter + context + sessionStorage) | P0 |
| 2 | `components/auth/sign-in-modal.tsx` | Accept `context` prop, dynamic messages | P0 |
| 3 | `lib/actions-script.ts` | Remove `!userId` check on generate | P0 |
| 4 | `lib/actions-content-ideas.ts` | Remove `!userId` check on generate | P0 |
| 5 | `app/dashboard/brand-kit/page.tsx` | Add gate + demo data | P0 |
| 6 | `app/dashboard/script-writer/page.tsx` | Adapt to new hook API + work preservation | P0/P1 |
| 7 | `app/dashboard/content-ideas/page.tsx` | Adapt to new hook API + work preservation | P0/P1 |
| 8 | All 3 module pages | `"id: preview"` status + free-gen countdown | P2 |
| 9 | `app/dashboard/page.tsx` | Preview welcome message | P2 |
| 10 | `app/dashboard/shell.tsx` | Sidebar preview indicator | P2 |
| 11 | `middleware.ts` | Add intentional comment | P2 |

---

## What's NOT Changing

- Landing page (`app/page.tsx`)
- Settings page (`app/dashboard/settings/page.tsx`) — hard redirect stays
- Onboarding page (`app/onboarding/page.tsx`) — fully protected
- DB schema — no new tables or columns
- Any existing styling or theme
- Module card grid on dashboard — no badges

---

## Built Modules (Can Preview)

| Module | Route | Status |
|--------|-------|--------|
| Script Writer | `/dashboard/script-writer` | ✅ Built + gated |
| Content Ideas | `/dashboard/content-ideas` | ✅ Built + gated |
| Brand Kit | `/dashboard/brand-kit` | ✅ Built (needs gate) |
| Settings | `/dashboard/settings` | ✅ Built (hard redirect) |
| Carousel Maker | `/dashboard/carousel-maker` | ❌ Not built |
| Competitor Intel | `/dashboard/competitor-intel` | ❌ Not built |
| Video Brief | `/dashboard/video-brief` | ❌ Not built |
| Thumbnail Maker | `/dashboard/thumbnail-maker` | ❌ Not built |
| Page Setup | `/dashboard/page-setup` | ❌ Not built |
| Growth Strategy | `/dashboard/growth-strategy` | ❌ Not built |
