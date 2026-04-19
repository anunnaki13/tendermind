# TenderMind

Internal tender discovery and company operations platform for CV Panda Global Teknologi.

## Scope

This repository starts with the Phase 1 foundation from the product blueprint:

- monorepo structure
- FastAPI backend skeleton
- Next.js web skeleton
- shared package placeholders
- Docker Compose infrastructure baseline

The full product definition lives in [docs/BLUEPRINT.md](docs/BLUEPRINT.md).

## Monorepo Layout

- `apps/api`: FastAPI backend
- `apps/web`: Next.js frontend
- `packages/types`: shared TypeScript types placeholder
- `packages/configs`: shared config placeholder
- `infrastructure`: local Docker Compose stack

## Quick Start

1. Copy env examples:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
2. Install backend dependencies:
   - `cd apps/api && python3 -m venv .venv && . .venv/bin/activate && pip install -e .`
3. Install frontend dependencies:
   - `cd apps/web && npm install`
4. Run backend on this VPS default port:
   - `cd apps/api && . .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8011`
5. Build and run frontend on this VPS default port:
   - `cd apps/web && npm run build`
   - `cd apps/web && PORT=3010 npm run start -- --hostname 0.0.0.0 --port 3010`

## VPS Ports

This repository is configured for this VPS with:

- `3010` for the Next.js web app
- `8011` for the FastAPI backend

These were chosen because `3000`, `3001`, `3002`, and `8001` are already in use on the server as of `2026-04-19`.

## Host-Run Deployment

If Docker is not installed, use the provided systemd templates in `infrastructure/systemd/` and helper scripts in
`infrastructure/scripts/`.

Main commands:

- backend: `bash infrastructure/scripts/start-api.sh`
- frontend: `bash infrastructure/scripts/start-web.sh`

## Docker Notes

`infrastructure/docker-compose.yml` keeps internal services on the Docker network and avoids binding database ports on
the host by default. That prevents clashes with services already running on this VPS.

## Status

Current implementation: foundation scaffold only. Tender crawling, drafting, and workflow automation are planned next.
