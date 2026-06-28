# Per-App Module Differentiation + DB Fix

## Objective
1. Fix database connection so server actions work
2. Give each app (YouTube, Instagram, TikTok, LinkedIn) uniquely named modules with app-aware behavior
3. Preserve CRT/terminal cyberpunk UI

## Approach
Option A: Unified page files with app-aware runtime branching (read `?app=` param). One file per module, different output per app.

## Module Map

| App | Modules |
|-----|---------|
| **YouTube** | Script Lab, Idea Vault, Edit Blueprint, Thumbnail Lab, Channel Setup, Competitor Intel, Growth Engine |
| **Instagram** | Reel Scripts, Carousel Studio, Moodboard, Bio Optimizer, Competitor Intel, Growth Engine |
| **TikTok** | Viral Scripts, Trend Scanner, Sound Sync, Profile Setup, Competitor Intel, Growth Engine |
| **LinkedIn** | Post Studio, Authority Ideas, Carousel Studio, Profile Setup, Competitor Intel, Growth Engine |

## Files Changed
- `.env` — uncomment `SUPABASE_DATABASE_URL`
- `lib/constants.ts` — restructure into `APP_MODULES` map
- `app/dashboard/app/[appId]/page.tsx` — per-app module grid
- `app/dashboard/app/[appId]/[moduleId]/page.tsx` — pass app context
- Each module page — app-aware system prompts, labels, output
- `app/dashboard/page.tsx` — app-aware module CTAs

## Excluded
- Carousel Maker, Thumbnail Maker, Payments/Billing
