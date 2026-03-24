# Unified B2C API & domain strategy

**Companion:** [Mobile app vs producer web — alignment](./Mobile_App_vs_Producer_Web_Alignment.md) (gap analysis and file references).

This document captures the **product/architecture verdict**, **single source of truth** decisions, **public API contract** (`/api/v1/...`), **DTOs**, and **migration plan** so the Flutter consumer app and the Next.js producer portal stop drifting.

---

## 1. Verdict: conceptual vs technical alignment

| Layer | Aligned? | Notes |
|-------|----------|--------|
| **Product / business logic** | Yes | Activities/experiences, booking shapes, lifecycle, pricing/deposit thinking, operator vs traveler roles. |
| **Technical / integration** | No | No shared REST contract; mobile mocks vs real multi-tenant DB; `bookingMode` vs `ActivityKind` + `BookingStatus`; slug vs CUID. |

**Diagnosis:** Two halves of one system — **supply** (producer web) and **demand** (mobile) — currently living in **parallel realities**: mobile in a mock marketplace, producer on real `organizationId`-scoped data.

**Strategic framing:** A **two-sided marketplace platform** (operator tools + traveler client), not two unrelated products.

---

## 2. Canonical domain naming

| Context | Name | Rule |
|---------|------|------|
| **Database / Prisma / producer portal** | `Activity` | Keep internal model as-is. |
| **Public API / mobile / marketing** | **Experience** (DTO) | Traveler-facing vocabulary. |

**Bridge:** One server-side mapper: `Activity (+ Organization + media …) → ExperienceDTO`.

This resolves the “experience vs activity” boundary without renaming all producer code immediately.

---

## 3. Canonical enums (API is source of truth)

### 3.1 Activity kind

Replace the mobile-only `bookingMode: INSTANT | REQUEST` as a **behavior source**. The API exposes:

```ts
type ActivityKind =
  | "FIXED_SLOT"
  | "FLEXIBLE"
  | "MULTI_DAY"
  | "RESOURCE_BASED";
```

**Server** derives initial booking behavior from `ActivityKind` + existing rules (e.g. `initialStatusForActivityKind` in `booking-rules.ts`). **Mobile** maps kind + status to CTA copy (“Book now”, “Request booking”, “Awaiting confirmation”, …).

### 3.2 Booking status

**Database today (Prisma):** `NEW` | `PENDING` | `CONFIRMED` | `CANCELLED` (no `COMPLETED` column).

**API / Trips UX:** You may still expose **`COMPLETED`** for **past trips** by:

- **Option A (recommended short-term):** derive in the API — e.g. `CONFIRMED` + `startAt` (and optionally `endAt`) in the past → `COMPLETED` in `TripDTO` only; or  
- **Option B:** add `COMPLETED` to Prisma + migration when you formalize post-trip lifecycle.

```ts
type BookingStatusApi =
  | "NEW"
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"; // API-facing; may be computed until DB supports it
```

### 3.3 Payment status

```ts
type PaymentStatus = "UNPAID" | "DEPOSIT" | "PAID";
```

### 3.4 Consumer display mapping (single place on mobile)

Example: `CONFIRMED` → “Confirmed”; `PENDING` → “Pending”; `NEW` → “Awaiting confirmation”; `DEPOSIT` → “Deposit paid”; `PAID` → “Paid”; `UNPAID` → “Unpaid”.  
`COMPLETED` → “Completed” (when derived or stored).

---

## 4. ID strategy

- **`id`:** stable public identifier for API (CUID today).
- **`slug`:** optional human-readable path (for shareable URLs / deep links).
- **`organizationId`:** on DTOs when useful; mobile is **not** responsible for tenancy rules — backend filters/enforces.

**Booking creation** must use **`experienceId` = activity `id`** (not legacy mock slugs). Slugs can resolve via `GET /api/v1/experiences/slug/:slug`.

---

## 5. API surface (versioned)

Prefix: **`/api/v1/`** (base path may already include `/api` in env — keep one consistent convention in code).

### Consumer (traveler)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/v1/experiences` | Home + Explore list |
| `GET` | `/v1/experiences/:id` | Detail |
| `GET` | `/v1/experiences/slug/:slug` | Deep link |
| `POST` | `/v1/bookings` | Create booking |
| `GET` | `/v1/trips` | Trips list |
| `GET` | `/v1/trips/:bookingId` | Trip detail |

**Favorites (optional later)**

| Method | Path |
|--------|------|
| `GET` | `/v1/me/favorites` |
| `POST` | `/v1/me/favorites/:experienceId` |
| `DELETE` | `/v1/me/favorites/:experienceId` |

### Producer (later / consistency)

Producer can keep server actions for now; for long-term parity, REST or RPC can mirror:

- `GET/PATCH /v1/producer/activities`, `GET/PATCH /v1/producer/bookings`, etc.

---

## 6. Core DTOs (TypeScript shapes)

### 6.1 `ExperienceDTO`

What Home / Explore / Detail consume (consumer-safe, not raw Prisma).

```ts
type ExperienceDTO = {
  id: string;
  slug: string;
  organizationId: string;
  operatorName: string;

  title: string;
  summary: string;
  city: string;
  category: string;

  kind: ActivityKind;

  price: {
    currency: "MAD";
    fromMad: number;
    depositRequired: boolean;
    depositMad: number | null;
    pricingLabel: string;
  };

  rating: {
    average: number | null;
    reviewsCount: number | null;
  };

  media: {
    heroImage: string;
    gallery: string[];
  };

  logistics: {
    durationLabel: string;
    groupSizeLabel: string | null;
    languages: string[];
    meetingPoint: string;
    meetingNote: string | null;
  };

  trust: {
    verifiedOperator: boolean;
    responseTimeLabel: string | null;
    cancellationLabel: string | null;
    confirmationLabel: string | null;
    popularityLabel: string | null;
  };

  bookingConfig: {
    availableSlots: string[] | null;
    durationOptionsDays: number[] | null;
    resourceCapacity: number | null;
  };

  content: {
    highlights: string[];
    includes: string[];
  };
};
```

### 6.2 `BookingCreateRequest`

Maps to producer `createBookingSchema` in spirit (`activityId`, `startAtISO`, `peopleCount`, `priceMad`, `meta`, customer fields).

```ts
type BookingCreateRequest = {
  experienceId: string;
  /** Total MAD for this booking as confirmed on the Review step; server may reject/re-quote. */
  priceMad: number;

  customer: {
    name: string;
    phone: string;
    email?: string | null;
  };

  booking: {
    startAtISO: string;
    peopleCount: number;
    meta?: {
      slotTime?: string | null;
      resourceUnits?: number | null;
      durationDays?: number | null;
      notes?: string | null;
    };
  };

  paymentIntent: {
    mode: "PAY_LATER" | "PAY_DEPOSIT" | "PAY_FULL";
  };
};
```

### 6.3 `TripDTO`

Aligns with mobile Trips / Trip Detail screens; hydrates from `Booking` + `Activity` + org.

```ts
type TripDTO = {
  bookingId: string;
  experienceId: string;
  title: string;
  city: string;
  heroImage: string;

  operatorName: string;
  meetingPoint: string;
  meetingNote: string | null;

  startAtISO: string;
  travelers: number;

  status: BookingStatusApi;
  paymentStatus: PaymentStatus;

  bookingType: ActivityKind;

  summary: {
    totalMad: number;
    depositMad: number | null;
    dueNowMad: number | null;
  };

  documents?: {
    voucherUrl?: string | null;
    receiptUrl?: string | null;
  };
};
```

### 6.4 `BookingCreateResponse`

```ts
type BookingCreateResponse = {
  bookingId: string;
  status: BookingStatusApi;
  paymentStatus: PaymentStatus;
  trip: TripDTO;
  nextStep: {
    headline: string;
    message: string;
  };
};
```

---

## 7. Endpoint contracts

### `GET /v1/experiences`

**Query:** `city`, `category`, `kind`, `featured`, `priceMin`, `priceMax`, `sort` (`recommended` | `price_asc` | `rating_desc`), `page`, `pageSize`.

**Response:**

```ts
type ListExperiencesResponse = {
  items: ExperienceDTO[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    availableCities: string[];
    availableCategories: string[];
  };
};
```

Aligns with mobile expectation of `{ items: [...] }` (today `ExperiencesApi` uses `/experiences` without `v1` — update client when routes land).

### `GET /v1/experiences/:id`

```ts
type GetExperienceResponse = { item: ExperienceDTO };
```

### `POST /v1/bookings`

**Request body:** `BookingCreateRequest` (§6.2).  
**Response:** `BookingCreateResponse` (§6.4).

**Server rules:** Initial `BookingStatus` from `ActivityKind` via existing producer rules (`initialStatusForActivityKind` / booking pipeline) — **no duplicate lifecycle logic on the client**.

### `GET /v1/trips`

Query:

- **`phone`** (required): must match the **customer phone** on the booking record (MVP lookup key).
- **`status`**: optional `all` (default) \| `upcoming` \| `pending` \| `past` (server-side bucket filter).

**MVP caveat — `phone` is temporary:** listing trips (and trip detail below) by raw phone number is a **short-term** integration shortcut for demos and early mobile wiring. It is **not** a durable authentication or authorization model and is **not** appropriate as a long-term security boundary. Replace with traveler auth, opaque session tokens, magic links, or secure booking-reference flows before production.

```ts
type ListTripsResponse = { items: TripDTO[] };
```

### `GET /v1/trips/:bookingId`

Query: **`phone`** (required; must match the booking’s customer phone). Same temporary `phone` lookup caveat as list — see above.

```ts
type GetTripResponse = { item: TripDTO };
```

---

## 8. Mapping layers (server)

### 8.1 Phase 3 — Booking submission boundary (mandatory)

**Goal:** the mobile booking wizard must never `POST` ad-hoc JSON shaped by screen state. One canonical consumer contract is the wire format; the UI is a view over a **draft** that gets compiled into that contract.

| Layer | Responsibility |
|--------|----------------|
| **Mobile UI** | Collects dates, slots, party size, traveler contact, payment *choice* (presentation). |
| **Mobile mapper (single place)** | Builds `BookingCreateRequest` (§6.2): ISO datetimes, `experienceId`, `peopleCount`, `priceMad` agreed for the quote, `meta` slots/duration/resources, `paymentIntent.mode`. |
| **`POST /v1/bookings`** | Validates body against the API schema, maps through **`toCreateBookingInput`** into producer `createBookingSchema` + org scoping, runs existing booking creation rules. |
| **Response** | Returns `BookingCreateResponse` with embedded **`TripDTO`** so the client can update Trips from one payload. |

**Rules**

1. **Forbidden:** constructing the HTTP body from raw wizard controllers / step indices / widget keys (e.g. spreading a `_BookingFlowScreenState` map into JSON).
2. **Required:** one function (e.g. `bookingCreateRequestFromDraft`) in the mobile codebase that accepts an explicit **draft** type (or primitive parameters) and returns a `BookingCreateRequest`-shaped object for JSON encoding.
3. **IDs:** `experienceId` in the request is the **public activity id** (same as catalog `Experience.id`). Slugs are for deep links only, not for booking writes.
4. **Honest pricing:** `priceMad` is the **quoted total (or line total) the server will persist** for this request; the server may still reject or re-quote. The client must not send a different number than what the user confirmed on the Review step.
5. **`paymentIntent`:** interpreted **only on the server** to set initial `PaymentStatus` / deposit expectations; producer `createBookingSchema` may need a small extension or parallel internal field — see §8.3.
6. **ID consistency:** `experienceId` must be the same stable id returned by `GET /v1/experiences` (CUID today). Mock-only ids and API ids must not be mixed in the same persisted favorite/booking flows once `USE_REMOTE_CATALOG` is on for real users; product-side migration is to re-save or remap legacy mock ids.

### 8.2 Core mappers

1. **`toExperienceDTO(activity, org, …): ExperienceDTO`** — pricing in MAD, trust labels, media URLs, `kind`, operator display name.
2. **`toCreateBookingInput(req: BookingCreateRequest)`** — maps into `createBookingSchema`-compatible input + `Customer` creation/linking rules (see §8.3).
3. **`toTripDTO(booking, activity, org): TripDTO`** — status/payment normalization, optional `COMPLETED` derivation, totals in MAD for mobile.

### 8.3 `BookingCreateRequest` → producer `createBookingSchema`

Canonical mapping for Phase 3 (extend Prisma/actions only where noted):

| `BookingCreateRequest` | Producer / DB notes |
|------------------------|---------------------|
| `experienceId` | → `activityId` (required for catalog bookings). |
| `customer.name` | → `customerName`. |
| `customer.phone` | → `customerPhone`. |
| `customer.email` | **Gap today:** not on `createBookingSchema`. Options: (a) extend booking/customer path to persist email, or (b) accept in v1 body and store in `meta` until schema grows — document choice in the PR that adds `POST /v1/bookings`. |
| `booking.startAtISO` | → `startAtISO`. Wizard must output **RFC-3339** (same string rules as Zod `.datetime()`). |
| `booking.peopleCount` | → `peopleCount`. |
| `booking.meta.slotTime` | → `meta.slotTime` (FIXED_SLOT). |
| `booking.meta.resourceUnits` | → `meta.resourceUnits` (RESOURCE_BASED). |
| `booking.meta.durationDays` | → `meta.durationDays` (MULTI_DAY); may also drive `endAtISO` with existing `computeMultiDayEndAt`. |
| `booking.meta.notes` | → `initialNote` (or append to note field — align with producer inbox UX). |
| `priceMad` | → `priceMad` (producer schema). |
| *(derived)* `endAtISO` | Set server-side when activity kind requires explicit `endAt` (MULTI_DAY, etc.). |
| `paymentIntent.mode` | **Gap today:** map to initial `paymentStatus` / deposit flags per product rules (`PAY_LATER` → `UNPAID`, `PAY_DEPOSIT` → `DEPOSIT` when deposit recorded, etc.). |

**Mobile `BookingFlowScreen` today (mock):** uses string date labels (`Fri, Mar 27`) and separate slot strings — the **mapper** must convert these (or the draft must store ISO instants) before calling the API. That conversion is not an API concern.

---

## 9. Auth strategy (MVP recommendation)

**Today:** mobile uses local launch flags; web uses Better Auth — no shared traveler session.

**Mobile integration flags (`dart-define`):**

| Flag | Role |
|------|------|
| `USE_REMOTE_CATALOG` | Home / Explore / Detail use `GET /v1/experiences*`. The **booking wizard** loads the same experience as detail via `GET /v1/experiences/:id` (aligned ids). |
| `USE_REMOTE_BOOKING` | Enables `POST /v1/bookings` and server-backed confirmation/trip payload. Independent of catalog: if catalog is off but this is on, the wizard still loads the experience from the API. |
| `USE_REMOTE_TRIPS` | Trips list/detail use `GET /v1/trips*` (see `phone` caveat in §7). On load, replaces in-memory trips with the API response — mock-only rows do not persist. |

**E2E:** enable catalog + booking (+ trips for the full loop). **Fragile:** mock catalog ids with remote booking/trips unless those ids exist in the backend.

**MVP path (recommended):**

- Guest browsing.
- Guest booking allowed with **opaque session token** or **booking reference** for `GET /v1/trips` / detail (define security model explicitly).
- Optional later: traveler accounts + Bearer token for `/me/*`.

---

## 10. Marketplace tenancy

- **Producer:** everything scoped by `organizationId`.
- **Consumer API:** returns a **marketplace index** (multi-org or curated list — product decision: single operator vs true marketplace).
- Mobile is **aware** of `organizationId` on DTOs but does **not** implement tenant isolation — **backend** owns filtering and authorization.

---

## 11. Migration phases

| Phase | Deliver |
|-------|---------|
| **1** | `GET /v1/experiences`, `GET /v1/experiences/:id`, mappers + seed/slug strategy |
| **2** | Wire mobile Home + Explore + Detail to API (feature flag / fallback to mock ok) |
| **3** | `POST /v1/bookings` + customer + payment intent rules |
| **4** | `GET /v1/trips`, `GET /v1/trips/:id` — replace in-memory Trips store |
| **5** | Server-backed favorites + traveler auth if needed |

---

## 12. Product rule (non-negotiable for alignment)

> **The backend owns behavior.**  
> **The mobile app owns presentation.**

- Server decides lifecycle from `ActivityKind` and business rules.
- Client renders CTAs and copy from **DTOs + enums**, not parallel “instant/request” state machines.

---

## 13. Document maintenance

- When Prisma or `bookings.schema.ts` changes, update §3, §8, and `project/src/app/api/v1/_lib/booking-contract.types.ts` in the same PR.
- When mobile routes change from mock ids to API ids, update `mobile_app` README and retire slug-only booking creation.

---

*This strategy supersedes ad-hoc naming between “experience” in UI and “activity” in DB: one term internally, one DTO externally.*
