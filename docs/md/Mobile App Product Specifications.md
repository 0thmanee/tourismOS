# Mobile App Product Specification

**Product:** Morocco Experiences Mobile App
**Type:** B2C tourism mobile app
**Platform:** Flutter
**Region:** Morocco
**Version:** MVP / V1
**Date:** March 2026

---

## 1. Product Overview

The Morocco Experiences Mobile App is a consumer-facing platform that helps travelers discover, understand, and book authentic Moroccan experiences through a structured, modern, mobile-first interface.

The product is designed to solve three main tourist problems:

* discovering quality local experiences is fragmented
* trust is low when booking unknown operators
* booking and trip management are often unclear and manual

The app connects travelers with experience providers through a clean booking flow, structured activity pages, and a personal trip space.

This mobile app is part of a larger platform:

* **B2C mobile app** for tourists
* **B2B operator dashboard/app** for providers
* **shared backend** for activities, bookings, payments, customers, and availability

---

## 2. Product Vision

Build the best mobile experience for discovering and booking authentic Moroccan activities, while structuring local tourism supply into a trusted and modern digital product.

The app should feel:

* inspiring like a travel product
* simple like a consumer marketplace
* trustworthy like a booking platform
* smooth like a premium mobile app

---

## 3. Business Goal

The mobile app exists to:

* generate bookings from tourists
* increase visibility of local operators
* create a trusted tourism brand
* structure demand around experiences
* become the consumer entry point into the tourism platform

Long term, the app can expand into:

* AI recommendations
* full trip planning
* itinerary building
* in-trip assistance
* dynamic packaging of activities

---

## 4. Target Users

### Primary Users

International and domestic travelers in Morocco who want to:

* find authentic experiences
* browse by city and category
* book activities easily
* avoid unreliable providers
* manage their bookings in one place

### Secondary Users

Digital nomads, short-stay travelers, couples, groups, and tourists planning trips to:

* Marrakech
* Agadir / Taghazout
* Fes
* Essaouira
* Merzouga / desert zones
* Tangier
* Chefchaouen

---

## 5. Core User Problems

### Discovery Problem

Travelers do not know where to find the best authentic activities in one place.

### Trust Problem

Travelers hesitate because they do not know if an operator is real, reliable, or worth the price.

### Booking Problem

Booking flows are often unstructured, manual, or require messaging.

### Trip Management Problem

After booking, users often lose track of what they booked, where to go, and when.

---

## 6. Product Scope

### In Scope for MVP

* onboarding
* home/discover experience browsing
* city/category exploration
* experience detail pages
* activity-type-based booking flows
* booking confirmation
* my trips / booking management
* profile and account basics
* favorites
* basic trust indicators

### Out of Scope for MVP

* full AI trip planner
* in-app live chat
* map-heavy exploration
* social/community features
* advanced loyalty/referral system
* multi-country expansion
* complex package builder
* operator-side advanced analytics

---

## 7. Product Principles

### Mobile-first

Everything should be optimized for phone usage.

### High trust

The app must reduce hesitation before booking.

### Fast booking

The user should move from discovery to booking with minimal friction.

### Structured flexibility

Different activities must have different booking behavior without making the app feel inconsistent.

### Premium simplicity

The UI should look polished and modern, but interactions should stay obvious.

---

## 8. Information Architecture

### Main Navigation

Bottom navigation with 4 tabs:

* Home
* Explore
* Trips
* Profile

Favorites can live inside Explore or Profile in MVP.

---

## 9. Feature Modules

### 9.1 Onboarding

Purpose: set language, preferences, and first context.

#### MVP Features

* welcome screens
* choose language
* optionally choose interests
* optionally choose destination city
* sign in later option

#### Goal

Get the user into discovery quickly.

---

### 9.2 Home

Purpose: inspire discovery and surface relevant experiences.

#### MVP Features

* featured experiences
* popular cities
* categories
* seasonal recommendations
* trending activities
* curated blocks such as:

  * desert experiences
  * cultural workshops
  * surf & sea
  * food experiences

#### Goal

Give users a strong first impression and encourage exploration.

---

### 9.3 Explore

Purpose: structured browsing and filtering.

#### MVP Features

* search
* city filters
* category filters
* list of experiences
* sorting
* quick cards

#### Filters

* city
* category
* price range
* duration
* rating later
* availability later

#### Goal

Help users narrow down options quickly.

---

### 9.4 Experience Detail Page

Purpose: convert curiosity into booking.

#### MVP Content

* image gallery
* title
* city/location
* short summary
* price starting from
* duration
* category
* operator identity
* trust badges
* what’s included
* what’s not included
* meeting point / logistics summary
* cancellation policy
* reviews placeholder or real reviews if available
* sticky booking CTA

#### Trust Indicators

* verified operator
* response time
* secure booking
* deposit or payment clarity
* clear booking status type

#### Goal

Make the user feel informed and confident enough to book.

---

### 9.5 Booking Flow

Purpose: let users reserve an experience smoothly.

The booking flow must adapt depending on the activity type.

#### Shared Flow Structure

* choose date/time
* configure activity-specific options
* enter traveler details
* review summary
* payment or deposit
* confirmation

---

### 9.6 Trips

Purpose: provide one place for all bookings.

#### MVP Features

* upcoming bookings
* completed bookings
* pending bookings
* booking details
* contact/support action
* status labels

#### Goal

Reduce confusion after booking.

---

### 9.7 Favorites

Purpose: let users save experiences for later.

#### MVP Features

* save experience
* remove saved experience
* open saved list

#### Goal

Support decision-making without forcing immediate conversion.

---

### 9.8 Profile

Purpose: manage account basics.

#### MVP Features

* account information
* language
* saved preferences
* bookings access
* logout
* help/support
* app info

---

## 10. Activity Type System

The app must support different activity behaviors through structured activity types.

### Type 1: Fixed Slot Activity

Examples:

* cooking class
* surf lesson
* guided medina tour

#### Booking Behavior

* user selects date
* user selects one of available slots
* chooses guest count
* system checks slot capacity
* booking can be auto-confirmed

---

### Type 2: Flexible Request Activity

Examples:

* private guide
* custom visit
* some premium or personalized tours

#### Booking Behavior

* user selects preferred date
* user selects preferred time
* enters details
* booking becomes pending
* operator confirms later

---

### Type 3: Multi-Day Experience

Examples:

* desert trip
* mountain trip
* multi-day adventure

#### Booking Behavior

* user selects start date
* chooses duration/package
* selects guest count
* booking is usually pending or conditional confirmation

---

### Type 4: Resource-Based Activity

Examples:

* quad biking
* buggy ride
* bike rental
* equipment-dependent activity

#### Booking Behavior

* user selects date/time
* selects quantity/duration
* system checks resource availability
* booking proceeds only if available

---

## 11. Screen List

### Core Screens

* splash
* onboarding
* login / signup / guest continue
* home
* explore
* search results
* city listing
* category listing
* experience detail
* booking step 1
* booking step 2
* booking summary
* payment/deposit
* booking confirmation
* trips list
* trip detail
* favorites
* profile
* settings
* support/help

---

## 12. User Flows

### Flow 1: Browse and Book

* user opens app
* sees home recommendations
* taps an experience
* reads details
* taps book now
* completes booking flow
* sees confirmation in Trips

### Flow 2: Search by City

* user opens Explore
* filters by Marrakech
* filters by category
* selects activity
* books

### Flow 3: Request-Based Booking

* user opens private guide activity
* selects preferred date/time
* submits request
* sees booking status as Pending

### Flow 4: Manage Upcoming Trip

* user opens Trips
* sees upcoming booking
* opens booking detail
* sees location, time, operator, status, payment state

---

## 13. Booking Statuses

The app should support clear booking states:

* Draft
* Pending
* Confirmed
* Cancelled
* Completed

Tourist-facing MVP can use:

* Pending
* Confirmed
* Cancelled
* Completed

These should always be visually obvious.

---

## 14. Payment Statuses

MVP payment states:

* Unpaid
* Deposit Paid
* Paid

The user should always understand:

* how much is due
* how much is paid
* whether the booking is secured

---

## 15. Notifications

### MVP Notifications

* booking request received
* booking confirmed
* booking cancelled
* payment confirmed
* reminder before activity

Push notifications can be phase 2 if needed; MVP can start with in-app state plus email if available.

---

## 16. Content Requirements

Each experience must include structured data:

* title
* category
* city
* short description
* detailed description
* duration
* price model
* images
* included items
* excluded items
* activity type
* booking rules
* operator details
* policies
* trust status

This is critical because the app UI depends on well-structured content.

---

## 17. Technical Architecture

### Frontend

* Flutter
* feature-first structure
* Riverpod for state management
* GoRouter for navigation
* Dio for API calls
* Freezed for models if adopted

### Backend

Shared backend through the existing Next.js app API.

The mobile app consumes API endpoints for:

* auth
* experiences
* categories
* cities
* bookings
* trips
* favorites
* profile

### Database

Shared database with the web/operator side.

---

## 18. Suggested Flutter Folder Structure

```text
lib/
  core/
    constants/
    theme/
    routing/
    network/
    widgets/
    utils/

  features/
    auth/
    onboarding/
    home/
    explore/
    experiences/
    booking/
    trips/
    favorites/
    profile/

  shared/
    models/
    services/
    state/
```

---

## 19. Non-Functional Requirements

### Performance

* fast first load after splash
* image loading optimized
* smooth scrolling
* low-friction booking

### Usability

* intuitive navigation
* clear CTAs
* consistent interaction patterns
* accessible typography and spacing

### Trust

* clear policies
* visible verification
* transparent pricing
* no hidden booking ambiguity

### Scalability

* activity-type system must support future expansion
* architecture must support future AI and itinerary layers

---

## 20. MVP Success Metrics

### Product Metrics

* app installs
* onboarding completion rate
* experience detail view rate
* booking conversion rate
* booking completion rate
* favorites save rate
* trips revisit rate

### Business Metrics

* number of bookings
* gross booking value
* confirmed booking rate
* repeat booking rate
* city/category performance

---

## 21. Risks

### Supply Quality Risk

If experiences are poorly structured, the app will feel weak even with good UI.

### Trust Risk

If operator quality is inconsistent, tourist trust may drop.

### Complexity Risk

If too many activity variations are added too early, UX will become confusing.

### Conversion Risk

If booking or payment is unclear, users will drop off.

---

## 22. Phased Roadmap

### MVP

* discovery
* experience details
* activity-type booking
* trips
* profile
* favorites

### Phase 2

* reviews
* richer notifications
* support center
* better payment flows
* request/approval enhancements

### Phase 3

* AI recommendations
* trip planning assistant
* itinerary timeline
* bundles and packages
* location-aware discovery

---

## 23. Summary

The Morocco Experiences Mobile App MVP is a Flutter-based consumer app that enables travelers to discover and book Moroccan experiences through a modern, structured, and trustworthy interface.

Its core strength is not just discovery. It is:

* structured booking by activity type
* strong trust communication
* simple trip management
* direct connection to a larger operator platform

This app should be built as a **beautiful but disciplined MVP**, focused on booking clarity, not feature excess.

The best next document is the **Mobile App Screen Architecture**, where we define the exact screen tree, bottom navigation behavior, and screen-by-screen responsibilities.
