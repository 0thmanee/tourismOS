# Tourist app — entry screens (MVP)

Screen order: **Splash → Onboarding → Auth → Home** (main shell).

## Shared state (`LaunchController`)

| Key | Meaning |
|-----|---------|
| `onboardingCompleted` | User finished intro + optional personalization |
| `sessionReady` | User chose guest or completed sign-in (stub) |
| `isGuest` | Guest mode (browse; stronger auth later at booking) |

## Routes

- `/splash` — brand, load prefs, connectivity check
- `/onboarding` — 3 value slides + optional personalization
- `/auth` — guest / email / social placeholders
- `/auth/email` — sign in (stub)
- `/auth/signup` — sign up (stub)
- `/app/*` — tab shell (Home, Explore, Trips, Profile)

## UX rules (enforced in widgets)

- Splash: short, no buttons, premium minimal motion
- Onboarding: one message per slide; Skip always available
- Auth: guest path visible; no forced account before browse
- Home: visual-first; skeletons while loading; inline retry on errors

---

## 1. Splash

| | |
|--|--|
| **Purpose** | Brand tone + hand off fast (not marketing). |
| **Content** | Logo, title, gradient, bottom loader or offline retry. |
| **States** | Checking network; loading prefs; offline (Retry). |
| **Actions** | **Continue** → onboarding (if first visit) / **auth** (if no session) / **home** (if signed in or guest). |
| **Rules** | Prefs load offline; network warning is non-blocking. |

## 2. Onboarding

| | |
|--|--|
| **Purpose** | Value in 3 beats + optional light personalization. |
| **Content** | Slides: Discover / Book with confidence / Manage trip; then interests + language + optional city. |
| **States** | Page index; interests selected / empty; skip personalization. |
| **Actions** | Continue; Skip (per slide — exits to Auth when skipping personalization). |
| **Rules** | One headline per slide; short body; pagination dots. |

## 3. Auth

| | |
|--|--|
| **Purpose** | Low-friction entry; guest must stay visible. |
| **Content** | Google / Apple (stubs), Email → sign-in screen, Guest → main app. |
| **States** | Loading; snackbars for “coming soon”; guest / signed-in stub. |
| **Actions** | Guest sets `session_ready` + `is_guest`; Email validates locally then sets session. |
| **Rules** | Terms line; no wall before browse. |

## 4. Home

| | |
|--|--|
| **Purpose** | Inspiration + clear entry to Explore; featured supply. |
| **Content** | Greeting (+ city hint from prefs), search → Explore, featured carousel, category chips, city cards, curated lists. |
| **States** | Skeleton featured row; API error + Retry + mock fallback; pull-to-refresh. |
| **Actions** | Tap search/categories/cities → Explore (stub); cards → detail (next). |
| **Rules** | Cards stay light; trust badge when `verified`. |
