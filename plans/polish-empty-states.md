# Polish: Empty States, Loading, Edge Fixes

## Scope
Fix gaps in depth, empty states, loading polish, and edge fixes.
Excludes: carousel-maker, thumbnail-maker, payments/billing.

## 1. Dashboard Hub
- Add CTA-driven empty state when 0 projects
- Add degraded stats fallback instead of hiding section

## 2. All 6 Module Pages
- Add first-run/welcome terminal messages for new users
- Loading transition preserves CRT monitor dimensions (no layout jump)

## 3. Brand Kit
- Clearer signed-out preview state messaging

## 4. Settings
- New-user empty state message
- Persistent "last saved" timestamp indicator

## 5. useAuthGate
- Cache auth state in sessionStorage so returning users skip full loading gate on repeat navigations

## 6. Growth Strategy
- Add visual loading indicators for Persona and Engagement secondary actions
- Wire Persona/Engagement buttons through useAuthGate

## 7. Error Boundary
- Retry button resets a key prop to force re-mount children (triggers fresh data fetch)

## 8. PDF Export
- Standardize all pages to blob URL approach

## 9. Dashboard Shell
- Mobile sidebar: add slide-in transition animation
- Breadcrumb: add fallback labels for unknown paths

## 10. Font Size Standardization
- Unify micro label sizes across all CRT monitor pages (target: 9px micro, 11-13px body)
