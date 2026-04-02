# Roadmap: Smart-Gaushala-App

## Overview

Milestone 2: Connect the premium Flutter frontend to the production backend. Every screen transitions from mock data to real API calls with reactive state management, professional loading states, instant UI updates, and graceful error handling.

## Phases

- [x] **Phase 1: UI Foundation & Design System** - Define the entire visual language. *(Milestone 1)*
- [x] **Phase 2: Core Auth & Dashboard UI** - Auth flows and dashboard screens with mock data. *(Milestone 1)*
- [x] **Phase 3: Domain Features UI** - Health, Breeding, Production screens with mock data. *(Milestone 1)*
- [ ] **Phase 4: Core Infrastructure** - API client, Dart models, Riverpod setup, secure storage.
- [ ] **Phase 5: Auth Integration** - Real login/register/OTP connected to Auth-service.
- [ ] **Phase 6: Animal Management** - Cow/Bull CRUD screens connected to Animal-service.
- [ ] **Phase 7: Health Integration** - Medical, Vaccination, Deworming, Lab, Timeline connected to Health-service.
- [ ] **Phase 8: Breeding Integration** - Heat records, Conception Journeys, Parity, Dry-off connected to Breeding-service.
- [ ] **Phase 9: Production Integration** - Milk recording, yield reports, analytics connected to Production-service.
- [ ] **Phase 10: Dashboard, Alerts & Media** - Real-time dashboard stats, 8 Alert categories, Media gallery with S3.

## Phase Details

### Phase 4: Core Infrastructure
**Goal**: Build the foundational API layer, data models, and state management that all subsequent phases depend on.
**Depends on**: Phase 3 (UI must exist)
**Requirements**: INFRA-01
**Success Criteria** (what must be TRUE):
  1. Dio-based `ApiService` singleton with JWT interceptor and gaushala header injection.
  2. Secure token storage using `flutter_secure_storage`.
  3. Complete Dart model classes for ALL backend entities (Animal, Health, Breeding, Production, Alert, Media).
  4. Riverpod `ProviderScope` wrapping the app. Core providers (auth, api) initialized.
  5. Reusable UI widgets: shimmer/skeleton loader, error widget, empty state widget.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Dio ApiService + SecureStorage + .env configuration.
- [ ] 04-02: Complete Dart data models and enums for all 8 services.
- [ ] 04-03: Riverpod setup + reusable loader/error/empty widgets.

### Phase 5: Auth Integration
**Goal**: Replace mock auth with real login/register/OTP flow. Store JWT, handle gaushala selection.
**Depends on**: Phase 4
**Requirements**: AUTH-01
**Success Criteria** (what must be TRUE):
  1. Login calls `POST /api/auth/login`, stores JWT, navigates to dashboard.
  2. Register calls `POST /api/auth/register` with full payload.
  3. Forgot password OTP flow works end-to-end.
  4. Gaushala selector appears when user has multiple gaushalas.
  5. Unauthorized (401) auto-redirects to login.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Auth repository + Riverpod provider + login/register API integration.
- [ ] 05-02: Gaushala selector screen + auto-redirect on 401.

### Phase 6: Animal Management
**Goal**: Build complete Cow/Bull management screens connected to Animal-service.
**Depends on**: Phase 5
**Requirements**: ANIMAL-01
**Success Criteria** (what must be TRUE):
  1. Cow list with pagination, filters (lactating/heifer/pregnant/etc.), and search.
  2. Bull list with pagination, filters, and bull type filter (GAUSHALA/AI).
  3. Animal detail screen showing all 50+ fields with presigned photo.
  4. Animal registration multi-step form.
  5. Disposal recording (sell/death/donation).
**Plans**: 3 plans

Plans:
- [ ] 06-01: Animal repository + providers + Cow/Bull list screens.
- [ ] 06-02: Animal detail screen + registration multi-step form.
- [ ] 06-03: Disposal recording screens (sell/death/donation).

### Phase 7: Health Integration
**Goal**: Connect all Health screens to real API data.
**Depends on**: Phase 6 (needs animal context)
**Requirements**: HEALTH-01
**Success Criteria** (what must be TRUE):
  1. Health records list fetches real medical/vaccination/deworming data.
  2. Record new medical visit, vaccination, deworming forms work.
  3. Unified health timeline per animal shows real data.
  4. Master list dropdowns (diseases, vaccines) populated from API.
  5. Lab test records connected.
**Plans**: 2 plans

Plans:
- [ ] 07-01: Health repository + providers + medical/vaccination/deworming list.
- [ ] 07-02: Record forms (medical, vaccination, deworming) + timeline + lab tests.

### Phase 8: Breeding Integration
**Goal**: Connect Breeding screens to real API with full journey lifecycle.
**Depends on**: Phase 6 (needs animal context)
**Requirements**: BREED-01
**Success Criteria** (what must be TRUE):
  1. Heat records list with real data, eligible cow list.
  2. Conception journey list with real stage data.
  3. Journey initiation form with eligible cow/bull dropdowns.
  4. Journey progression: confirm pregnancy → dry-off → delivery.
  5. Parity records per animal.
**Plans**: 2 plans

Plans:
- [ ] 08-01: Breeding repository + providers + heat/journey list screens.
- [ ] 08-02: Journey initiation form + stage progression actions + parity records.

### Phase 9: Production Integration
**Goal**: Connect Production screens to real milk data, analytics, and inventory.
**Depends on**: Phase 6 (needs animal context)
**Requirements**: PROD-01
**Success Criteria** (what must be TRUE):
  1. Daily yields display from real API with morning/evening split.
  2. Bulk yield entry form submits to API (with feed inventory validation).
  3. Feed inventory status displayed.
  4. Analytics charts use real monthly/daily report data.
  5. Distribution recording connected.
**Plans**: 2 plans

Plans:
- [ ] 09-01: Production repository + providers + yield list + bulk entry.
- [ ] 09-02: Analytics charts with real data + distribution + inventory.

### Phase 10: Dashboard, Alerts & Media
**Goal**: Wire the main dashboard to live data, build alerts screen, connect media gallery.
**Depends on**: Phases 5-9 (all services must be integrated)
**Requirements**: DASH-01, ALERT-01, MEDIA-01
**Success Criteria** (what must be TRUE):
  1. Dashboard stat cards show real animal counts and production totals.
  2. Alerts section aggregates counts from all 8 alert endpoints.
  3. Full alerts screen with tabbed view for each alert category.
  4. Photo/Video gallery connected to Media-service with presigned URLs.
  5. Profile/Settings screen connected.
**Plans**: 3 plans

Plans:
- [ ] 10-01: Dashboard live data (animal counts, production stats, alert counts).
- [ ] 10-02: Alerts screen with all 8 categories.
- [ ] 10-03: Media gallery + profile/settings screens.

## Progress

**Execution Order:**
Phases 1-3 (Milestone 1, complete) → 4 → 5 → 6 → 7/8/9 (parallel-eligible) → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. UI Foundation & Design System | 1/1 | Complete | 2026-04-01 |
| 2. Core Auth & Dashboards | 2/2 | Complete | 2026-04-01 |
| 3. Domain Features | 3/3 | Complete | 2026-04-01 |
| 4. Core Infrastructure | 0/3 | Not started | - |
| 5. Auth Integration | 0/2 | Not started | - |
| 6. Animal Management | 0/3 | Not started | - |
| 7. Health Integration | 0/2 | Not started | - |
| 8. Breeding Integration | 0/2 | Not started | - |
| 9. Production Integration | 0/2 | Not started | - |
| 10. Dashboard, Alerts & Media | 0/3 | Not started | - |
