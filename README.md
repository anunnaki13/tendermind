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
2. Start infrastructure:
   - `docker compose -f infrastructure/docker-compose.yml up -d`
3. Run backend:
   - `cd apps/api && uvicorn app.main:app --reload`
4. Run frontend:
   - `cd apps/web && pnpm dev`

## Status

Current implementation: foundation scaffold only. Tender crawling, drafting, and workflow automation are planned next.

