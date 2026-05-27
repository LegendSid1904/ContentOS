# Onboarding Flow — SOP

## Objective
Guide new users through initial setup in 3 steps so they reach the dashboard with a configured Brand Kit and understand the value proposition.

## Steps

### Step 1: Set Niche (`/onboarding?step=1`)
- User enters their content niche (text input)
- User selects a brand voice/tone from 5 preset options
- User picks brand colors from 6 preset swatches
- **Action:** `saveBrandKit()` creates the Brand Kit record in `brand_kits` table
- **Action:** `completeOnboardingStep(3)` updates `users.onboardingStep = 3`
- Redirects to Step 3 on success

### Step 3: Choose Primary Platform (`/onboarding?step=3`)
- User selects one platform from: YouTube, Instagram Reels, LinkedIn, YouTube Shorts
- Radio-button style selection with visual highlight
- **Action:** `saveBrandKit()` updates existing Brand Kit with platform
- **Action:** `completeOnboardingStep(4)` updates `users.onboardingStep = 4`
- Redirects to Step 4 on success

### Step 4: First Script — Quick Win (`/onboarding?step=4`)
- Summary screen showing completion status
- No inputs required — purely transitional
- **Action:** `finishOnboarding()` sets `users.onboardingComplete = true`, clears `onboardingStep`
- Redirects to `/dashboard` on completion

## Redirect Logic

- **Middleware:** All routes except `/`, `/sign-in`, `/sign-up` require auth
- **Dashboard Layout** (`app/dashboard/layout.tsx`): If `users.onboardingComplete === false`, redirect to `/onboarding?step={users.onboardingStep || 1}`
- Edges: Clerk webhook creates user record with `onboardingComplete: false`

## Database Schema

See `db/schema.ts`:
- `users.onboardingComplete` (boolean, default false)
- `users.onboardingStep` (integer, default 1)

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User refreshes mid-onboarding | Step is read from DB; user resumes at same step |
| User clicks away from onboarding | Dashboard layout re-checks and redirects back |
| User deletes account + re-registers | Fresh record with `onboardingComplete: false` |
| Clerk user.created webhook fails | Manual: set `onboardingComplete = false` in DB |

## Files Involved

- `app/onboarding/page.tsx` — Multi-step client component
- `app/dashboard/layout.tsx` — Onboarding gate check
- `lib/actions.ts` — Server actions for brand kit CRUD + onboarding state
- `db/schema.ts` — Users table with onboarding columns
- `middleware.ts` — Auth protection
