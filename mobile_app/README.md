# Morocco Experiences Mobile App

Flutter B2C app scaffolded from the mobile product specification.

## Current foundation

- **Entry flow:** Splash → Onboarding (3 value slides + optional personalization) → Auth (guest / email stubs) → main tabs
- Feature-first folders (`splash`, `onboarding`, `auth`, `home`, `explore`, `experiences`, `trips`, `profile`)
- `Riverpod` + `LaunchController` (`shared_preferences`) for bootstrap state
- `GoRouter` with **4-tab** shell (`/app/home`, `/app/explore`, `/app/trips`, `/app/profile`)
- `Dio` API client → Next.js `/api`
- **Home** tab: greeting, search → Explore, featured carousel, categories, cities, curated rows (mock + API fallback)

See `docs/ENTRY_SCREENS.md` for routing keys and guard rules.

## Run

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

Use `10.0.2.2` on Android emulator to reach the host machine’s Next.js dev server.

### UI only uses half the emulator screen?

- **Split-screen / multi-window:** Android gives the app only part of the width — exit split view or make the app full-screen.
- **Emulator:** Close the emulator side panel / zoom so you’re not mistaking the window chrome for the phone display.

If it still looks wrong after a **hot restart** (`R` in the `flutter run` terminal), file an issue with a screenshot.

## Next implementation slice

1. Next.js route handlers for mobile:
   - `GET /api/experiences`
   - `GET /api/experiences/:id`
   - `POST /api/bookings`
   - `GET /api/my-bookings`
2. **Explore** list + search/filters (full spec).
3. **Experience detail** + activity-type booking entry.
4. **Booking flow** (fixed / flexible / multi-day / resource).
# morocco_experiences_mobile

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
