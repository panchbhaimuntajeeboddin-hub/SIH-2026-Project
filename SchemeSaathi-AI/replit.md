# SchemeSaathi AI

SchemeSaathi AI helps Indian entrepreneurs discover, understand, and prepare for government schemes using explainable profile-based matching.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/scheme-saathi/src/App.tsx` — routed application shell and page composition
- `artifacts/scheme-saathi/src/pages/pages.tsx` — dashboard, profile, recommendations, scheme detail, comparison, documents, assistant, and admin screens
- `artifacts/scheme-saathi/src/components/ui-kit.tsx` — shared visual primitives
- `artifacts/api-server/src/routes/scheme-saathi.ts` — in-memory MVP scheme catalog, matching engine, document readiness, and assistant endpoints
- `lib/api-spec/openapi.yaml` — source of truth for the generated client and validation contracts
- `lib/api-client-react/src/generated/` — generated React Query client hooks
- `lib/api-zod/src/generated/` — generated request/response schemas and types

## Architecture decisions

- Eligibility is deterministic and transparent; the assistant explains or summarizes results but does not decide eligibility.
- The first build uses a curated catalog with `lastVerified` and `source` metadata so recommendations are presented as preliminary, not guaranteed.
- The API is contract-first through OpenAPI and generated React Query hooks.
- The MVP keeps state in the API process so the full demo works without making sensitive identity-document data persistent.

## Product

The app provides a profile questionnaire, ranked scheme recommendations, explainable match reasons, scheme details and source verification, side-by-side comparison, document readiness tracking, a grounded assistant, and an admin verification overview.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Re-run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml`.
- The API's current demo state is process-local and resets when the API workflow restarts.
- Government scheme eligibility and benefits change; keep source and verification dates visible and treat output as a preliminary assessment.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
