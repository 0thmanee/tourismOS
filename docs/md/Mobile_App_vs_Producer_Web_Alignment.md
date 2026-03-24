# Mobile app vs producer web — alignment report

This document compares the **Flutter consumer app** (`mobile_app/`) with the **Next.js operator (producer) portal** (`project/`) and the **shared Prisma domain**, so you can see overlaps, gaps, and naming conflicts.

**Next step (contract & migration):** see **[Unified B2C API & domain strategy](./Unified_B2C_API_and_Domain_Strategy.md)** for the agreed verdict, `/api/v1` surface, DTOs, enums, mapping layers, auth MVP, and phased rollout.

---

## 1. What each product is today

| Surface | Role | Primary users |
|--------|------|----------------|
| **Mobile app** | B2C discovery, shortlist, mock booking flow, local “trips” | Travelers |
| **Producer web** (`/producer/*`) | Inbox, calendar, bookings, customers, staff, payments (UI), settings | Operators / partners |
| **Marketing web** (`/`) | Landing, auth entry, onboarding links | Prospects / partners |
| **Admin web** (`/admin/*`) | Partner approvals, partner management | Internal |

There is **no public B2C marketplace website** in `project/` today; the traveler journey is represented by the **mobile app** and static marketing pages only.

---

## 2. What the mobile app implements (current)

- **Navigation:** Splash → Onboarding → Auth (guest / email stubs) → tab shell (Home, Explore, Trips, Profile).
- **Catalog:** Centralized mocks in `AppMockData` (experiences with string ids like `agafay-quad`, hero, categories, curated rows, detail payloads).
- **Explore:** Search, filters, sort, favorites (`Set<String>` in memory).
- **Experience detail & booking:** Driven by mock maps; UI concepts include `activityType` (`FIXED_SLOT`, `RESOURCE_BASED`, `MULTI_DAY`) and **`bookingMode`** (`INSTANT` vs `REQUEST`), plus deposit/payment **copy** (not real payments).
- **Trips:** In-memory list seeded from mocks; booking ids like `BK-…`; statuses shown as human strings (`Confirmed`, `Pending`, `Completed`, payment labels like `Deposit paid`).
- **Networking:** `Dio` + `API_BASE_URL`; **`ExperiencesApi`** calls **`GET /experiences?featured=1&…`** and expects `{ items: [...] }`. **Home UI does not consume this yet** (still mock-first).
- **Auth:** Local/session flags via `SharedPreferences`; no shared Better Auth session with the web app.

---

## 3. What the producer web implements (current)

- **Server-side domain:** Prisma models `Organization`, **`Activity`** (catalog per tenant), **`Customer`**, **`Booking`**, `StaffMember`, `BookingAssignment`, `BookingMessage`, `OrganizationSettings`.
- **Activity kinds (canonical):** `FIXED_SLOT`, **`FLEXIBLE`**, `MULTI_DAY`, `RESOURCE_BASED` (`activity.schema.ts` / Prisma `ActivityKind`).
- **Bookings:** Created/updated via **server actions** (`app/api/bookings/actions.ts` etc.), not a public REST API under `app/api/*/route.ts` for listings.
- **Booking lifecycle:** `status`: **`NEW` | `PENDING` | `CONFIRMED` | `CANCELLED`**; `paymentStatus`: **`UNPAID` | `DEPOSIT` | `PAID`**; amounts stored as **`priceCents`** / `depositCents`.
- **Initial status rules** (`booking-rules.ts`): e.g. `FIXED_SLOT` → `CONFIRMED`; `FLEXIBLE` / `MULTI_DAY` → `PENDING`; `RESOURCE_BASED` → `NEW`.
- **Booking meta:** JSON `meta` with optional `slotTime`, `resourceUnits`, `durationDays` — aligned in spirit with mobile’s slot/units/duration UI, but **not the same field names** as all mobile mock keys.
- **Producer UI:** Dashboard/inbox, calendar, bookings table & detail, customers, staff, payments placeholder, settings, media upload (`/api/media/upload`), certificate generation, Better Auth.

---

## 4. Conflicts and mismatches (high signal)

### 4.1 Vocabulary: “Experience” (mobile) vs “Activity” (web DB)

- Mobile mocks and routes use **`experienceId`** and marketing-style **slugs** (`agafay-quad`).
- Backend catalog is **`Activity`** with **CUID `id`**, scoped to **`organizationId`**.
- **Conflict:** Mobile ids are not stable or tenant-scoped until you map slug ↔ `activity.id` (and likely `organization` / operator).

### 4.2 Activity / booking “kind” enums

| Concept | Mobile (mock UI) | Producer / Prisma |
|--------|------------------|-------------------|
| Slot-based | `FIXED_SLOT` | `FIXED_SLOT` ✓ |
| Equipment / units | `RESOURCE_BASED` | `RESOURCE_BASED` ✓ |
| Multi-day packages | `MULTI_DAY` | `MULTI_DAY` ✓ |
| Request / flexible | Often modeled as `bookingMode: REQUEST` + `INSTANT` | **`FLEXIBLE`** activity kind + **status `PENDING`** (no `INSTANT`/`REQUEST` on Activity) |

**Conflict:** `bookingMode` / `INSTANT` vs `REQUEST` **do not exist** on the server model; behavior is implied by **`ActivityKind`** + **`BookingStatus`** (`initialStatusForActivityKind`).

### 4.3 Status and payment labels

- Mobile trips use **display strings** (`Confirmed`, `Deposit paid`, `Completed`, …).
- Web uses **enumerated codes** (`CONFIRMED`, `DEPOSIT`, …) and **`NEW`** for some resource flows.

**Conflict:** You need an explicit **mapping layer** (API DTO → mobile UI strings) and a decision whether mobile should ever show **`NEW`** like operators do.

### 4.4 Pricing units

- Mobile: **`priceFromMad`**, deposit in **MAD**.
- Web booking row: **`priceCents`** (and `depositCents`); activities use **`defaultPriceMad`**.

**Conflict:** Mobile must convert or the API must expose a consistent currency unit (recommend **one canonical unit** in API responses for the consumer app).

### 4.5 Customer / traveler identity

- Web booking creation expects **`customerName`**, **`customerPhone`** (and optional activity link).
- Mobile collects name / phone / email in the booking wizard but **does not post** to the backend; there is **no “traveler account”** model tied to `Customer` yet.

**Conflict:** B2C identity (guest vs signed-in) is not aligned with **`Customer`** records per organization until you define linking rules.

### 4.6 Public API surface

- Mobile `ExperiencesApi` assumes **REST** `GET /api/experiences` (via `baseUrl` already including `/api`).
- **`project/src/app/api/`** currently exposes **very few `route.ts` handlers** (e.g. auth, media upload, certificate); **listings and bookings are server actions**, not documented REST for the app.

**Conflict:** The mobile client **cannot** integrate with producer features **as-is** without **new route handlers** (or a separate BFF) that enforce auth, tenancy, and DTO shaping.

### 4.7 Multi-tenancy

- All real catalog and bookings are **per `organizationId`**.
- Mobile mock catalog is **global** (single fictional marketplace).

**Conflict:** Consumer app must eventually choose **how travelers see activities** (one org, curated multi-org, or marketplace index).

---

## 5. What aligns well (reuse potential)

- **Slot / resource / duration** concepts map cleanly to **`fixedSlots`**, **`resourceCapacity`**, **`durationOptions`**, and booking **`meta`**.
- **Activity kind** names overlap for three of four kinds; only **FLEXIBLE vs “request mode”** needs a product decision and naming unification.
- **Producer** already models **messages**, **assignments**, and **calendar range** queries — future mobile “trip thread” could align with `BookingMessage` if scoped safely for travelers.

---

## 6. Suggested integration direction (reduces future conflict)

1. **Introduce a B2C API layer** (Next.js routes or tRPC) that returns **stable DTOs**: `experience` view models with `id`, `organizationId`, pricing, media URLs, and kind — **not** raw internal shapes.
2. **Replace mobile `experienceId` strings** with server **`activity.id`** (or a public slug resolved server-side).
3. **Map booking creation** from the mobile wizard to **`createBookingSchema`** fields (`startAtISO`, `peopleCount`, `priceMad`, `activityId`, `meta`, …) and map responses to mobile trip cards.
4. **Unify enums in the mobile app** with web: use **`FLEXIBLE`** where you today use “request”; map **`BookingStatus` / `PaymentStatus`** to UI copy in one place.
5. **Auth:** decide whether travelers use Better Auth (separate role) or stay anonymous until checkout; if shared cookies are not possible on mobile, use **token/API auth** for the same user table or a dedicated traveler profile.

---

## 7. Quick reference — file locations

| Area | Mobile | Producer web |
|------|--------|----------------|
| Catalog mock | `mobile_app/lib/core/data/app_mock_data.dart` | `project/prisma/schema.prisma` → `Activity` |
| Consumer API (intended) | `mobile_app/lib/features/experiences/data/experiences_api.dart` | *(not implemented as REST yet)* |
| Booking rules | Mock + `booking_flow_screen.dart` | `project/src/app/api/bookings/booking-rules.ts`, `schemas/bookings.schema.ts` |
| Booking UI | `mobile_app/lib/features/trips/*`, `booking_flow/*` | `project/src/features/producer/*`, `app/api/bookings/actions.ts` |

---

*Generated for internal planning; update as APIs and mobile integration land.*
