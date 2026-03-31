# Roadmap: Smart-Gaushala-App

## Overview

This roadmap focuses on securing data integrity in backend cattle management logic, adding robust universal stability features for the API, and finally building out the unified reporting and export formats that are critical for shelter administration.

## Phases

- [ ] **Phase 1: Data Integrity** - Resolve parity validation for resident vs. AI bulls.
- [ ] **Phase 2: API Stability** - Implement universal service pagination and fallback limits.
- [ ] **Phase 3: Reporting & Exports** - Consolidate reporting structures and export capabilities to CSV/Excel.

## Phase Details

### Phase 1: Data Integrity
**Goal**: Correct parity tracking and boolean mappings for AI Bulls across all lifecycle domains.
**Depends on**: Nothing (first phase)
**Requirements**: DINTG-01, DINTG-02
**Success Criteria** (what must be TRUE):
  1. Parity validation rejects illogical cattle pairings.
  2. Resident Bulls and AI Bulls are correctly segregated for heat cycle mapping.
**Plans**: 1 plan

Plans:
- [ ] 01-01: Update schemas and application logic to enforce AI bull distinction and parity age boundaries.

### Phase 2: API Stability
**Goal**: Protect the application database from excessive fetching and standardize response limits.
**Depends on**: Phase 1
**Requirements**: STABL-01, STABL-02, STABL-03
**Success Criteria** (what must be TRUE):
  1. All main list/report endpoints accept `page` and `limit` securely.
  2. Non-paginated endpoints cap off automatically (e.g., at top 1000).
  3. API payload explicitly contains pagination metadata formats.
**Plans**: 1 plan

Plans:
- [ ] 02-01: Universal middleware and controller adjustments for pagination metadata standardization.

### Phase 3: Reporting & Exports
**Goal**: Provide users with cross-service downloadable reports.
**Depends on**: Phase 2
**Requirements**: REPRT-01, REPRT-02
**Success Criteria** (what must be TRUE):
  1. All services that contain lists/reports (like production, breeding, and health) offer identical reporting API conventions.
  2. Administrators can successfully view Excel/CSV exports for any listing.
**Plans**: 1 plan

Plans:
- [ ] 03-01: Integrate a standardized fast Excel/CSV export service across all reporting layers.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Integrity | 0/1 | Not started | - |
| 2. API Stability | 0/1 | Not started | - |
| 3. Reporting & Exports | 0/1 | Not started | - |
