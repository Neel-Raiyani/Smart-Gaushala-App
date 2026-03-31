# Smart-Gaushala-App

## What This Is

Smart-Gaushala-App is a comprehensive Cattle Management System designed to streamline operations for gaushalas (cow shelters). It provides a full suite of tools to manage cattle lifecycles, health records, breeding cycles, and milk production analytics via a scalable microservices backend (Node.js/Express) and a cross-platform frontend interface (Flutter).

## Core Value

Ensuring robust, accurate, and scalable data management for cattle operations to improve herd health, production efficiency, and overall shelter management.

## Requirements

### Validated

- ✓ Core cattle management (registration, groups, lifecycle) — existing
- ✓ Health records, vaccinations, and deworming tracking — existing
- ✓ Breeding records (heat cycles, conception journeys, parity) — existing
- ✓ Milk production records and analytics — existing
- ✓ File uploads and media management (S3/MinIO integration) — existing
- ✓ User management, gaushala registration, and JWT authentication — existing
- ✓ System alerts and notifications — existing
- ✓ Centralized API Gateway routing — existing

### Active

- [ ] Unify reporting and add comprehensive export functionalities
- [ ] Further harden data integrity around parity-age validation
- [ ] Stabilize API response structures with universal pagination

### Out of Scope

- [ ] Direct sales or e-commerce integration — Not currently the focus of the management system.

## Context

- **Technical Environment**: Microservices architecture using Express.js, TypeScript, Prisma (MongoDB), handled by an API Gateway. The frontend is built on Flutter. Media files are stored in MinIO/S3.
- **Prior Work**: Substantial existing codebase covering Auth, Animal, Health, Breeding, Production, Media, and Alert services.
- **Known Issues/Focus**: Recent work involved adding system pagination and robust parity validation for AI bulls vs. resident bulls. Stable deployments need scalable media handling and reporting improvements.

## Constraints

- **Tech Stack**: Must adhere to existing Node.js/TypeScript backend services and Flutter frontend.
- **Database**: Must use Prisma with MongoDB. Direct MongoDB queries are restricted.
- **Storage**: Must continue utilizing S3/MinIO for media rather than local storage.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Microservices Architecture | Enables independent scaling and targeted development for specific domains (Health vs. Production). | ✓ Good |
| API Gateway | Simplifies client communication by providing a single entry point to all services. | ✓ Good |

---
*Last updated: 2026-03-31 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
