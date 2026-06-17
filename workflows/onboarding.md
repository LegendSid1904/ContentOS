# Onboarding Flow — SOP

## Objective
Guide new users through comprehensive setup in 6 steps: niche selection, social links, career goals, content preferences, competitor research, and 30-day plan generation.

## Flow Overview
```
Login → Step 1 (Niche & Tone) → Step 2 (Social Links) → Step 3 (Career & Audience) →
Step 4 (Content Style & Platforms) → Step 5 (Competitor Research) →
[AI processes: competitor analysis + 30-day plan] → Step 6 (Plan Review) → Dashboard
```

## Steps

### Step 1: Your Niche (`/onboarding?step=1`)
- User enters their content niche (text input)
- User selects a brand voice/tone from 5 preset options (Educational, Entertaining, Motivational, Controversial, Storytelling)
- User picks brand colors from 6 preset swatches
- **Action:** `completeOnboardingStep(2)` updates `users.onboardingStep = 2`
- Redirects to Step 2 on success

### Step 2: Social Media Links (`/onboarding?step=2`)
- User provides profile URLs for social platforms: YouTube, Instagram, TikTok, LinkedIn, Twitter/X, Facebook, Snapchat, Pinterest, Threads
- All fields are optional; user can leave blank any they don't use
- **Action:** `completeOnboardingStep(3)` updates `users.onboardingStep = 3`
- Redirects to Step 3 on success

### Step 3: Career & Audience (`/onboarding?step=3`)
- User selects career goal from: Build a personal brand, Full-time content creator, Grow business through content, Side income/monetize, Establish thought leadership, Just exploring
- User enters target audience description
- User selects experience level: Beginner, Intermediate, Advanced
- **Action:** `completeOnboardingStep(4)` updates `users.onboardingStep = 4`
- Redirects to Step 4 on success

### Step 4: Content Style & Platforms (`/onboarding?step=4`)
- User selects which platforms to post on (multi-select): YouTube, Instagram Reels, LinkedIn, YouTube Shorts
- User selects posting frequency: Daily, 3-4x/week, Once a week, Twice a month, Once a month
- User selects content goals (multi-select): Grow followers, Increase engagement, Generate leads, Drive traffic, Build community, Monetize, Brand collabs, Sell products
- User selects preferred content formats (multi-select): Short-form video, Long-form video, Carousel, Text posts, Infographics, Podcast, Newsletter, Live streams
- User provides additional context (optional textarea)
- **Action:** `saveOnboardingData()` saves all data to `users.onboarding_data` JSONB + updates `brand_kits` and `profiles` tables
- **Action:** `completeOnboardingStep(5)` updates `users.onboardingStep = 5`
- Redirects to Step 5 on success

### Step 5: Competitor Research (`/onboarding?step=5`)
- User can click "Auto-discover competitors" to find top creators in their niche via web search + AI
- User can manually add competitor URLs (YouTube channels, Instagram profiles, etc.)
- **Action:** `discoverCompetitors()` uses Tavily search + AI to find relevant competitors
- **Action:** `generateThirtyDayPlan()` runs the full pipeline:
  1. `analyzeCompetitorsForOnboarding()` — AI extracts content gaps, patterns, opportunities
  2. `generateThirtyDayPlan()` — AI creates a 30-day content calendar with hooks and tips
  3. `saveOnboardingPlan()` — saves plan + competitor research to `projects` + `content_outputs` tables, then calls `finishOnboarding()`
- Transitions to Step 6 on completion

### Step 6: Your Plan (`/onboarding?step=6`)
- Shows strategy overview and content pillars
- Preview of 30-day calendar (first 10 days shown, rest scrollable)
- Summary checklist of what was set up
- **Action:** User clicks "Go to Dashboard" → redirects to `/dashboard`

## Redirect Logic

- **Middleware:** All routes except `/`, `/sign-in`, `/sign-up` require auth
- **Dashboard Layout** (`app/dashboard/layout.tsx`): Server-side check — if `users.onboardingComplete === false`, redirect to `/onboarding?step={users.onboardingStep || 1}`
- **Onboarding Page:** Client-side check on mount — if already onboarded, redirect to `/dashboard`

## Database Schema

- `users.onboardingComplete` (boolean, default false)
- `users.onboardingStep` (integer, default 1)
- `users.onboardingData` (JSONB — stores full onboarding questionnaire response)

### onboardingData JSON shape
```json
{
  "niche": "string",
  "tone": "string",
  "colors": ["string"],
  "socialLinks": { "platform": "url" },
  "selectedPlatforms": ["string"],
  "careerGoal": "string",
  "targetAudience": "string",
  "experienceLevel": "string",
  "postingFrequency": "string",
  "contentGoals": ["string"],
  "contentFormats": ["string"],
  "competitorUrls": ["string"],
  "additionalContext": "string"
}
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User refreshes mid-onboarding | Step is read from DB; user resumes at same step |
| User clicks away from onboarding | Dashboard layout re-checks and redirects back |
| User deletes account + re-registers | Fresh record with `onboardingComplete: false` |
| Clerk user.created webhook fails | Manual: set `onboardingComplete = false` in DB |
| Auto-discover returns no competitors | User can add URLs manually; empty competitor list still generates plan |
| AI plan generation fails | Error shown; user can retry |

## AI Prompts

### Competitor Discovery (`discoverCompetitors`)
Searches web for top creators in the niche across the user's selected platforms, then uses AI to extract structured competitor data.

### Competitor Analysis (`analyzeCompetitorsForOnboarding`)
AI identifies: content gaps, common patterns, opportunities, and per-competitor insights.

### 30-Day Plan Generation (`generateThirtyDayPlan`)
AI generates: strategy overview, 4-5 content pillars, and a 30-day calendar. Each day includes: title, format, platform, pillar, caption hook, and production tip.

## Files Involved

- `app/onboarding/page.tsx` — 6-step client component
- `app/dashboard/layout.tsx` — Server-side onboarding gate check + redirect
- `lib/actions-onboarding.ts` — Server actions for full onboarding pipeline
- `lib/actions.ts` — `completeOnboardingStep()`, `finishOnboarding()`, `getOnboardingStatus()`
- `lib/constants.ts` — Platforms, tones, career goals, content goals, etc.
- `db/schema.ts` — Users table with onboarding columns
- `middleware.ts` — Auth protection
