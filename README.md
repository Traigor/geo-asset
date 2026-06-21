# Geo Asset Tracker

Local full-stack app for tracking physical assets on a map.

## Stack

- Backend: Node.js, Express, TypeScript, PostgreSQL, PostGIS, raw `pg`, Zod
- Frontend: React, TypeScript, Vite, React Leaflet
- Tests: Vitest, Supertest, React Testing Library
- Local services: Docker Compose

## Prerequisites

- Node.js 20+
- npm
- Docker

## Setup

```bash
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Backend: `http://localhost:4000`

Frontend: `http://localhost:5173`

The Docker Compose PostGIS databases use host ports `55432` and `55433` to avoid clashing with a local PostgreSQL on `5432`.

## Environment

Copy the examples if you want local overrides:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

The app also has defaults matching `docker-compose.yml`, so local `.env` files are optional.

## Scripts

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run db:up
npm run db:migrate
npm run db:seed
npm run test:backend
npm run test:frontend
npm test
npm run typecheck
```

## API Examples

```bash
curl "http://localhost:4000/api/health"
curl "http://localhost:4000/api/assets?page=1&pageSize=10"
curl "http://localhost:4000/api/assets?type=sensor&status=warning"
curl "http://localhost:4000/api/assets?nearLat=42.3601&nearLng=-71.0589&radiusMeters=5000"
```

Create payloads use snake_case date fields:

```json
{
  "name": "Sensor S-0001",
  "type": "sensor",
  "status": "ok",
  "lat": 42.3601,
  "lng": -71.0589,
  "installed_at": "2020-01-10",
  "last_inspected_at": null,
  "notes": ""
}
```

## Architecture

The backend uses lightweight DDD with ports/adapters inside `asset-inventory`:

- `domain`: `Asset`, `GeoPoint`, and domain validation rules
- `application`: command/query handlers and the `AssetRepository` port
- `infrastructure`: Postgres/PostGIS repository adapter
- `presentation`: Express controller, routes, schemas, and DTO mappers

The API uses raw SQL intentionally so the PostGIS query is visible and reviewable. Radius search uses `ST_DWithin` on a generated `geography(Point, 4326)` column with a GiST index.

The frontend is feature-oriented around `asset-inventory`, with API functions, types, hook state, and components kept separate.

## Testing

Backend tests include:

- Domain unit tests for entity/value-object rules
- Application handler tests with an in-memory repository
- Schema tests
- Repository and API integration tests against the Docker Compose PostGIS test database

Frontend tests include:

- API client contract tests for query serialization and snake_case payloads
- Hook tests for loading, filters, mutation reloads, and error state
- Component tests for list, filters, and form behavior

Browser E2E tests are intentionally skipped. For this assignment, backend integration tests plus focused React tests give better signal with less map automation overhead.

## Manual QA Checklist

- Filter by type.
- Filter by status.
- Apply radius search with latitude, longitude, and radius meters.
- Click a map marker and confirm the detail drawer opens.
- Create an asset using the map location picker.
- Edit an asset and move its location using the map picker.
- Delete an asset and confirm it disappears from the list/map.

## Technical decisions

* **PostgreSQL + PostGIS for storage and geospatial search.** I chose a real relational store instead of in-memory storage because asset location is central to the brief. Assets are stored with latitude/longitude plus a generated PostGIS `geography(Point, 4326)` column, indexed with GiST for efficient radius search.

* **Radius and map-bounds filtering.** The API supports type and status filters, plus two geographic filters: radius search for “near this point” workflows and bounds search for “search the current map area” workflows. Radius and bounds filters are intentionally mutually exclusive to keep query behavior predictable.

* **Raw SQL over an ORM.** I used the `pg` driver directly so the PostGIS query is visible, simple to review, and easy to reason about for a small assignment. SQL parameters are used throughout rather than string interpolation.

* **Lightweight DDD / ports-and-adapters backend.** The backend separates domain rules, application handlers, repository ports, Postgres adapters, and HTTP presentation. This keeps Express and database details out of the core asset rules while avoiding unnecessary framework complexity.

* **Zod validation at the API boundary.** Request params, query strings, and bodies are validated before reaching handlers. Domain validation still protects core invariants such as valid coordinates, valid dates, and inspection date ordering.

* **React feature-based frontend.** The frontend is organized around the `asset-inventory` feature, with API calls, model types, hook state, and UI components kept separate. The main page composes the list, filters, map, drawer, and create/edit form.

* **Leaflet / React Leaflet for the map.** Leaflet was chosen because it is lightweight, open-source, quick to set up locally, and sufficient for marker rendering, map-bound search, popups, and map-based location picking.

* **Focused tests over exhaustive coverage.** Backend tests cover domain rules, application behavior, schemas, repository/API integration, and seed behavior. Frontend tests focus on API serialization, hook behavior, and key components. Browser E2E tests were intentionally skipped to avoid spending disproportionate time automating map interactions for a small take-home.
