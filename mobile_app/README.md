# Morocco Experiences Mobile App

A Flutter mobile app for discovering, shortlisting, booking, and managing Moroccan travel experiences.

This README documents the app as it exists right now: architecture, routes, states, feature behavior, data contracts, and current implementation notes.

## 1) Tech stack and foundations

- Flutter (Material 3)
- State: Riverpod (`flutter_riverpod`)
- Navigation: `go_router` with `StatefulShellRoute.indexedStack`
- HTTP client: `dio`
- Local bootstrap persistence: `shared_preferences`
- Connectivity checks: `connectivity_plus`
- Theme fonts: `Cinzel` (display/headlines), `Manrope` (UI/body)

Key files:

- App entry: `lib/main.dart`
- Router: `lib/core/routing/app_router.dart`
- Theme tokens: `lib/core/theme/app_tokens.dart`
- Theme config: `lib/core/theme/app_theme.dart`
- Launch/bootstrap state: `lib/core/state/launch_controller.dart`
- API client base: `lib/core/network/api_client.dart`
- Env config: `lib/core/config/app_env.dart`

## 2) Run and environment

### Run locally

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

Use `10.0.2.2` when running Android emulator and backend on host machine.

### Environment variable

- `API_BASE_URL` comes from `String.fromEnvironment`
- Default fallback: `http://localhost:3000/api`

See: `lib/core/config/app_env.dart`.

## 3) App architecture overview

The app is feature-first under `lib/features/*`:

- `splash`
- `onboarding`
- `auth`
- `home`
- `explore`
- `experience_detail`
- `booking_flow`
- `trips`
- `favorites`
- `profile`
- `experiences` (API integration layer)

Cross-cutting core modules are in `lib/core/*`.

### Data strategy (current)

- Catalog-like mock content is centralized in `lib/core/data/app_mock_data.dart`
- Feature wrappers reuse the centralized catalog:
  - `home_feed_mock.dart`
  - `experience_detail_mock.dart`
  - `trips_store.dart` seeds
- Mutable user/session state remains separate by design:
  - Favorites set (`favorites_store.dart`)
  - Launch/session flags (`LaunchController`)
  - In-progress booking form state (in `BookingFlowScreen` state object)

## 4) Navigation and route map

Router: `createAppRouter()` in `lib/core/routing/app_router.dart`.

### Entry routes

- `/splash`
- `/onboarding`
- `/auth`
- `/auth/email`
- `/auth/signup`

### Tab shell routes (`/app/*`)

Indexed shell with 4 tabs:

- `/app/home`
  - `/app/home/experience/:id`
    - `/app/home/experience/:id/book`
- `/app/explore`
  - `/app/explore/favorites`
- `/app/trips`
  - `/app/trips/detail/:bookingId`
- `/app/profile`
  - `/app/profile/settings`
  - `/app/profile/support`

### Route guard behavior

In router `redirect`:

- Accessing `/app/*` requires:
  - `onboardingCompleted == true`
  - `sessionReady == true`
- Accessing `/auth*`:
  - redirects to onboarding if onboarding not done
  - redirects to `/app/home` if session already ready

## 5) Launch/bootstrap state model

`LaunchController` persists bootstrap and personalization state in `SharedPreferences`.

### Stored keys

- `me_onboarding_completed`
- `me_session_ready`
- `me_is_guest`
- `me_interests_json`
- `me_preferred_city`
- `me_preferred_language`

### Public model

- `onboardingCompleted` (bool)
- `sessionReady` (bool)
- `isGuest` (bool)
- `interests` (List<String>)
- `preferredCity` (String?)
- `preferredLanguage` (String, default `en`)

### Actions

- `load()`
- `setOnboardingCompleted()`
- `setSessionReady(value, guest)`
- `savePersonalization(interests, cityCode, languageCode)`
- `debugResetEntryFlow()` (dev/QA helper)

## 6) Feature-by-feature behavior

### 6.1 Splash (`features/splash`)

Screen: `SplashScreen`

What it does:

- Loads launch prefs in background (`launch.load()`)
- Checks connectivity and shows non-blocking offline notice
- Displays brand hero and Continue CTA

Current implementation notes:

- There is a temporary dev reset behavior:
  - `debugResetEntryFlow()` is invoked once per splash mount
- Continue currently forces onboarding directly (`context.go('/onboarding')`)

This means first-run flow is intentionally forced in current dev mode.

### 6.2 Onboarding (`features/onboarding`)

Screen: `OnboardingScreen`

Flow:

- 4-page `PageView`
  - Page 1: discover value proposition
  - Page 2: booking confidence
  - Page 3: trip management
  - Page 4: optional personalization

Personalization controls:

- Interests multi-select chips
- Preferred language dropdown (`en`, `fr`, `ar`)
- Optional city choice chips

Completion behavior:

- Skip path can finish without personalization
- Continue on final page saves personalization and marks onboarding complete
- Navigates to `/auth`

### 6.3 Auth (`features/auth`)

#### Auth hub (`AuthScreen`)

Options:

- Google (stub, snackbar)
- Apple (stub, snackbar)
- Email flow entry
- Continue as Guest

Guest action:

- Calls `setSessionReady(guest: true)`
- Navigates to `/app/home`

#### Email sign in (`EmailAuthScreen`)

- Local form validation only
- Simulates delay (`600ms`)
- Marks session ready with `guest: false`
- Navigates to `/app/home`

#### Email signup (`EmailSignupScreen`)

- Local form validation only
- Simulates delay (`600ms`)
- Marks session ready with `guest: false`
- Navigates to `/app/home`

### 6.4 Home (`features/home`)

Screen: `HomeScreen`

Sections and behavior:

- Simulated initial skeleton loading (`~650ms`)
- Hero media card with 2 CTAs:
  - primary -> experience detail route
  - secondary -> trips
- Quick action cards (visual cards)
- Search prompt card (navigates to Explore)
- Featured horizontal cards
- Categories horizontal row
- Popular cities horizontal row
- Saved for later section (if favorites exist)
- Curated sections:
  - Best in Marrakech
  - Desert escapes
  - Authentic food

Data:

- Uses `HomeFeedMock` backed by `AppMockData`
- Normalizes card fields via `_normalizeExperience`
- Empty-state card with retry + Explore navigation if no featured content

### 6.5 Explore (`features/explore`)

Screen: `ExploreScreen`

Main capabilities:

- Search text filtering (title/city)
- Sticky compact filter bar (pinned `SliverPersistentHeader`)
- Filter dimensions:
  - City
  - Category (single-select from `AppMockData.exploreFilterCategories`)
  - Price range
- Sorting:
  - Recommended
  - Price low -> high
  - Top rated
- Active filter tags and clear actions
- Empty state with guided recovery buttons
- Results list cards with save/unsave action

Data build pipeline:

1. Collects all mock experiences from featured + curated sections
2. Deduplicates by `id`
3. Derives category from `AppMockData.exploreCategoryByExperienceId`
4. Applies filters and sort strategy

Favorite behavior:

- Uses `favoritesStoreProvider`
- Heart action toggles state and shows snackbar

### 6.6 Favorites (`features/favorites`)

Screen: `FavoritesScreen`

Behavior:

- Initial skeleton loading (`~550ms`)
- Builds saved list from deduped catalog items + favorites set
- Empty state with CTA to Explore and retry
- Saved cards navigate to experience detail and allow direct unsave

### 6.7 Experience Detail (`features/experience_detail`)

Screen: `ExperienceDetailScreen(experienceId)`

Data source:

- `ExperienceDetailMock.get(id)` backed by `AppMockData.experienceDetails`

Behavior:

- Validates core content (title + gallery)
- If invalid/missing -> unavailable state scaffold with Back to Explore
- Shows:
  - Hero image with dynamic gallery source
  - City/rating/reviews
  - Summary
  - Info pills (duration, group size, languages, cancellation)
  - Highlights and includes
  - Meeting point details
  - Trust/policy card
  - Interactive gallery with fullscreen viewer
- Bottom sheet:
  - Price from
  - CTA computed from activity type + booking mode
  - Routes to booking flow
- Favorite toggle in app bar

CTA logic (`_bookingCta`):

- `REQUEST + MULTI_DAY` -> `Check availability`
- `REQUEST + others` -> `Request booking`
- Instant fixed/resource -> `Book now`

### 6.8 Booking Flow (`features/booking_flow`)

Screen: `BookingFlowScreen(experienceId)`

Step model (6 steps):

1. When
2. Options
3. Traveler
4. Review
5. Payment
6. Confirm

State and defaults:

- Date/slot default from `AppMockData`
- Traveler demo defaults from `AppMockData`
- Local state for guests, duration, resource units, payment choice, notes

Adaptive behavior by product type:

- Activity type drives fields:
  - `MULTI_DAY` -> duration package selector
  - `RESOURCE_BASED` -> units selector
  - others -> standard options
- Booking mode drives payment UX:
  - `REQUEST` -> request-only info, no immediate payment
  - `INSTANT` -> pay deposit/now or pay later options

Confirmation step:

- Computes dynamic confirmation copy based on request/deposit/full payment
- Displays booking summary and next steps
- Shows mock documents:
  - voucher
  - receipt
  - trip brief
  - “download all documents” mock

Trips integration:

- On completion (`View in Trips`), saves one trip record into `tripsStoreProvider`
- Derives status/payment labels from booking mode + payment choice

Fallback behavior:

- If experience content invalid/missing title -> booking unavailable scaffold

### 6.9 Trips (`features/trips`)

#### Trips list (`TripsScreen`)

Capabilities:

- Initial skeleton loading (`~650ms`)
- Uses `tripsStoreProvider` state; if empty, displays demo seeded trips
- Filter tabs:
  - Upcoming
  - Pending
  - Past
- Next Trip hero card for quick access
- Sectioned trip lists + empty section messaging
- Trip cards show status/payment badges and link to detail

#### Trip detail (`TripDetailScreen`)

Capabilities:

- Looks up trip by `bookingId`
- If list empty or booking not found -> clear fallback scaffold + Back to Trips
- Shows:
  - hero image header
  - status/payment/traveler pills
  - “What’s next” contextual card
  - booking summary card
  - meeting/logistics card
  - mock document tiles (voucher/receipt)
  - support hint with booking id

Computed UX context:

- Friendly date labels (Today/Tomorrow/In N days/This weekend)
- Different next-step messaging for:
  - pending requests
  - deposit-paid bookings
  - fully confirmed bookings

### 6.10 Profile (`features/profile`)

#### Profile main (`ProfileScreen`)

Shows:

- Account status card (guest vs signed-in)
- Quick entries:
  - Saved experiences
  - Settings
  - Help & support
  - About
- Preferred language snapshot from launch state
- Dev-only action in debug mode:
  - reset entry flow and navigate to splash

#### Settings (`SettingsScreen`)

Static settings/Legal list UI:

- Language
- Notifications
- Privacy controls
- Terms of service
- Privacy policy
- Version footer from `AppMockData.settingsVersionLabel`

#### Support (`SupportScreen`)

Support options:

- Help center
- Contact support (placeholder)
- Email (from `AppMockData.supportEmail`)
- Phone placeholder (from `AppMockData.supportPhonePlaceholder`)
- Average response time info card

## 7) State management inventory

### Riverpod providers

- `launchControllerProvider` -> `LaunchController` (`ChangeNotifierProvider`)
- `favoritesStoreProvider` -> `Set<String>` (`StateNotifierProvider`)
- `tripsStoreProvider` -> `List<Map<String, dynamic>>` (`StateNotifierProvider`)
- `dioProvider` -> configured `Dio`
- `experiencesApiProvider` -> `ExperiencesApi`
- `featuredExperiencesProvider` -> async featured list fetch

### Stores

#### FavoritesStore

- In-memory `Set<String>` of experience IDs
- API:
  - `isSaved(id)`
  - `toggle(id)`

#### TripsStore

- In-memory trip list
- Starts with `AppMockData.seedTrips()`
- `addTrip(item)` prepends latest booking

## 8) Mock catalog and data contracts

Centralized file: `lib/core/data/app_mock_data.dart`

Contains:

- Brand/shell copy constants
- Explore filter/category mapping constants
- Booking demo defaults/constants
- Home hero, categories, cities, quick actions
- Featured experiences
- Curated sections and items
- Rich experience detail maps keyed by id
- Seed trip list generator

### Core experience detail shape (mock)

Typical keys:

- `id`, `title`, `city`, `summary`
- `priceFromMad`, `startingPriceType`
- `rating`, `reviewsCount`, `verified`
- `duration`, `groupSize`, `languages`
- `meetingPoint`, `meetingNote`
- `responseTime`, `cancellation`, `trustBadge`
- Product semantics:
  - `activityType` (`FIXED_SLOT`, `RESOURCE_BASED`, `MULTI_DAY`)
  - `bookingMode` (`INSTANT`, `REQUEST`)
  - `confirmationType`, `cancellationType`
  - `depositRequired`, `depositMad`
  - `availableSlots` or `durationOptionsDays`
- Media/content:
  - `heroImage`, `gallery`, `highlights`, `includes`

### Trip item shape used in Trips/Trip Detail

Typical keys:

- `bookingId`
- `experienceId`
- `title`
- `city`
- `heroImage`
- `status`
- `paymentStatus`
- `bookingType`
- `operatorName`
- `meetingPoint`
- `travelers`
- `startAt` (ISO string)
- Optional labels: `dateLabel`, `timeLabel`

## 9) API integration status

Current API-facing pieces:

- `ExperiencesApi.listFeatured()` calls `GET /experiences` with optional query:
  - `city`
  - `category`
  - `featured=1`

Current UI wiring status:

- UI currently relies primarily on centralized mocks for catalog and details
- API provider layer exists and is ready for incremental replacement of mock-driven sections

## 10) Theming and design system

### Tokens (`AppTokens`)

- Forest palette + cream base + gold/teal accents
- Semantic aliases for background/surface/border/text
- Radius system (`sm`, `md`, `lg`)

### Theme (`AppTheme.light`)

- Material 3 theme with custom color scheme
- Typography split:
  - Display/headings: `Cinzel`
  - Body/UI: `Manrope`
- Customized:
  - AppBar
  - Cards
  - Inputs
  - Buttons (filled/outlined/text)
  - Chips
  - Navigation bar selected-state visuals

## 11) Assets and media docs

Assets configured in `pubspec.yaml`:

- `assets/images/splash/`
- `assets/images/onboarding/`
- `assets/images/home/`

Media generation docs:

- `docs/AI_MEDIA_PROMPTS.md` (Splash + Onboarding)
- `docs/HOME_MEDIA_PROMPTS.md` (Home visuals)

These documents define realistic/cinematic style constraints and per-file prompt specs.

## 12) UX patterns and quality patterns used

Across screens, the app consistently applies:

- skeleton first-paint states
- explicit fallback/error states with actionable CTAs
- non-blocking empty states
- conservative copy for trust and booking clarity
- card-driven layout with scannable summaries
- bottom-sheet or fixed-bottom action areas where booking context is needed

## 13) Known implementation notes (important)

- Splash currently contains temporary dev behavior forcing onboarding each app start.
- Auth social buttons are placeholders (snackbar only).
- Email auth/signup are stub flows with local validation + simulated delay.
- Settings and Support are mostly static informational UI for now.
- Booking and Trip documents are mock previews/dialogs, not generated files.
- Favorites and Trips stores are in-memory state (not synced remotely).

## 14) Suggested next technical slices

If you want to move from MVP mock-first to production-ready behavior, recommended order:

1. Remove splash dev reset/forced onboarding behavior and restore true persisted entry logic.
2. Persist favorites and trips (local DB or backend sync).
3. Replace mock catalog/detail with API-backed repositories and domain models.
4. Add booking submission API integration and real request/payment status lifecycle.
5. Add auth backend integration (email/social) and secure session handling.
6. Add tests for:
   - route guards
   - booking step transitions
   - explore filtering/sorting
   - trip status derivation and fallback states

---

## File-level quick index

### Core

- `lib/main.dart`
- `lib/core/routing/app_router.dart`
- `lib/core/state/launch_controller.dart`
- `lib/core/state/launch_providers.dart`
- `lib/core/network/api_client.dart`
- `lib/core/config/app_env.dart`
- `lib/core/theme/app_tokens.dart`
- `lib/core/theme/app_theme.dart`
- `lib/core/data/app_mock_data.dart`

### Features

- Splash: `lib/features/splash/presentation/splash_screen.dart`
- Onboarding: `lib/features/onboarding/presentation/onboarding_screen.dart`
- Auth:
  - `lib/features/auth/presentation/auth_screen.dart`
  - `lib/features/auth/presentation/email_auth_screen.dart`
  - `lib/features/auth/presentation/email_signup_screen.dart`
- Home:
  - `lib/features/home/presentation/home_screen.dart`
  - `lib/features/home/presentation/widgets/experience_card.dart`
  - `lib/features/home/presentation/widgets/section_header.dart`
  - `lib/features/home/data/home_feed_mock.dart`
- Explore: `lib/features/explore/presentation/explore_screen.dart`
- Favorites:
  - `lib/features/favorites/presentation/favorites_screen.dart`
  - `lib/features/favorites/state/favorites_store.dart`
- Experience detail:
  - `lib/features/experience_detail/presentation/experience_detail_screen.dart`
  - `lib/features/experience_detail/data/experience_detail_mock.dart`
- Booking flow: `lib/features/booking_flow/presentation/booking_flow_screen.dart`
- Trips:
  - `lib/features/trips/presentation/trips_screen.dart`
  - `lib/features/trips/presentation/trip_detail_screen.dart`
  - `lib/features/trips/state/trips_store.dart`
- Profile:
  - `lib/features/profile/presentation/profile_screen.dart`
  - `lib/features/profile/presentation/settings_screen.dart`
  - `lib/features/profile/presentation/support_screen.dart`
- API surface:
  - `lib/features/experiences/data/experiences_api.dart`
  - `lib/features/experiences/state/experiences_providers.dart`
