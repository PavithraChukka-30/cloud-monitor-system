# CloudOps Monitor

A cloud infrastructure monitoring and auto-scaling platform dashboard. Monitors Kubernetes clusters and AWS infrastructure in real-time — CPU, memory, disk, network, pod status, node health, alerts, scaling events, and deployment history.

## Run & Operate

- `pnpm --filter @workspace/cloudops-monitor run dev` — run the frontend dashboard (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Recharts + Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/db/src/schema/cloudops.ts` — DB schema (alerts, scaling_events, scaling_policies, deployments)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/api-server/src/lib/simulation.ts` — in-memory simulation for nodes, pods, metrics, logs
- `artifacts/cloudops-monitor/src/pages/` — frontend pages
- `artifacts/cloudops-monitor/src/components/layout.tsx` — persistent sidebar layout

## Architecture decisions

- **Simulation vs DB**: Mutable entities (alerts, scaling policies, scaling events, deployments) live in PostgreSQL. Ephemeral/real-time data (nodes, pods, metrics, logs) is generated in-memory by `simulation.ts` with realistic jitter for live-feel updates.
- **15s polling** on dashboard overview summary and current metrics for a live-feeling console without WebSockets.
- **Bounded query inputs**: `/metrics/history` caps `minutes` at 1–1440 to prevent CPU amplification. `/scaling/events` caps `limit` at 1–500.
- **Strict ID validation**: Alert mutation endpoints (`/acknowledge`, `/resolve`) use a digit-only regex check before Zod to reject inputs like `"123abc"`.

## Product

Dashboard with 7 pages: cluster overview with live charts, node inventory, pod explorer, alert center (with acknowledge/resolve actions), auto-scaling events + HPA policies, deployment history, and a real-time log viewer with auto-scroll.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run codegen then `pnpm run typecheck:libs` before checking artifact typechecks.
- The simulation layer uses `Date.now()` and `Math.sin()` for jitter — values change on every request, as expected.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
