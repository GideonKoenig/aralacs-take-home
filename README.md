# Banking Processes Demo Monorepo

A small monorepo demonstrating nightly processing over a banking dataset using a split persistence model:
- Transactions in PostgreSQL
- People, bank accounts, and friendships in a Gremlin graph

It exposes a NestJS backend with OpenAPI docs and a minimal Next.js demo frontend for driving the data flows.

Relevant notes and build logs can be found in `META.md` and the `ai-chat-histories/` directory.

## Tech stack
- NestJS (Fastify) + Swagger/OpenAPI
- Next.js 15 (App Router) + tRPC (demo frontend)
- TypeORM + PostgreSQL
- Gremlin Server (Apache TinkerPop)
- Yarn 4 workspaces (monorepo)
- ESLint, Prettier, TypeScript, Vitest

## Repository layout
- `apps/backend` NestJS API; generates `openapi.json`
- `apps/webapp` Next.js demo with a BFF that talks to the backend and the DBs
- `packages/db` DB connectors, entities, migration CLI, and local infra scripts (Docker)
- `packages/shared` Shared utilities (daily transaction generator, process logging)

## Prerequisites
- Docker (+Docker Desktop for Windows)
- Node.js 20+
- Yarn 4 (enabled via `corepack enable`)
- For Windows: WSL installed (the DB startup script uses WSL to run a bash script)

## Getting started
1) Install dependencies
```
yarn install
```

2) Create `.env` files for every workspace. For local development, copy each `.env.example` and rename the copy to `.env`.

3) Start databases (Postgres + Gremlin via Docker)
```
yarn db:start
```

4) Push database migrations (prepare Postgres)
```
yarn db:push
```

5) Seed Gremlin with sample data
```
yarn db:seed
```

6) Prepare the dev
```
yarn predev
```

7) Run the apps
```
yarn dev
```
- Backend: `http://localhost:4000`
- Docs: `http://localhost:4000/docs`
- Webapp: `http://localhost:3000`

The webapp exposes simple buttons to generate transactions and trigger processes 1–3 to mimic a new “day”.

## API overview
All routes under the backend base URL; see Swagger for full schemas.

- Process trigger
  - POST `/process` body `{ "processId": "1" | "2" | "3" }`
    - Step 1: aggregate Postgres transactions into Gremlin account balances
    - Step 2: compute and store `netWorthCents` per person
    - Step 3: compute and store `maxBorrowableCents` per person

- People
  - GET `/people`
  - GET `/people/{id}`
  - GET `/people/{id}/friends`

- Accounts
  - GET `/accounts`
  - GET `/accounts/person/{id}`
  - GET `/accounts/iban/{iban}`

- Transactions
  - GET `/transactions?iban=...&from=YYYY-MM-DD&to=YYYY-MM-DD`
  - GET `/transactions/{id}`

- Metrics
  - GET `/metrics/people/{id}/net-worth`
  - GET `/metrics/people/{id}/borrowable`  ← “borrow endpoint”

## Commands
Root
- `yarn predev` build `@scalara/shared` and `@scalara/db` once
- `yarn dev` run shared, db (tsc -w), backend, and webapp concurrently
- `yarn lint` run eslint in all workspaces
- `yarn format` run prettier in all workspaces
- `yarn db:start` start Postgres and Gremlin in Docker
- `yarn db:seed` seed Gremlin graph
  (use `--help` for options)
- `yarn db:generate` generate TypeORM migration
- `yarn db:push` run migrations

apps/backend
- `yarn start` start API
- `yarn start:dev` dev mode
- `yarn openapi:gen` emit `openapi.json`
- `yarn test` run vitest; `yarn test:ui` for UI runner

apps/webapp
- `yarn dev` generate OpenAPI types and run Next dev
- `yarn openapi:types` one-off OpenAPI type generation
- `yarn openapi:watch` watch backend `openapi.json` and regenerate types

packages/db
- `yarn start` run the DB startup script (Docker)
- `yarn seed` seed Gremlin graph (same as `yarn db:seed`)
  (use `--help` for options)
- `yarn generate` generate migration
- `yarn push` run migrations


## Environment variables
Goal: each workspace declares the env it needs and enforces it at startup, while making those requirements reusable.

One example (backend using db env)
1) `packages/db` defines and exports a schema (`envDb`) for DB URLs. Any consumer that extends it inherits those requirements.
```ts
export const envDb = createEnv({
    server: {
        POSTGRES_DATABASE_URL: z.url(),
        GREMLIN_DATABASE_URL: z.url(),
        NODE_ENV: z.enum(["development", "production"]),
    }
});
```
2) `apps/backend` composes schemas and adds its own needs (like `PORT`).
```ts
export const env = createEnv({
    extends: [envDb],
    server: {
        SITE_URL: z.string().url(),
        PORT: z.coerce.number(),
        NODE_ENV: z.enum(["development", "production"]),
    }
});
```
3) Use it: import `env` and call a DB function
```ts
import { env } from "@/env.js";
import { initializePostgres } from "@scalara/db";

const pg = await initializePostgres(env);
```

## OpenAPI and type-gen
- Backend emits `apps/backend/openapi.json` in dev and via `yarn openapi:gen`
- Webapp generates types into `apps/webapp/src/server/backend-integration/openapi-types.ts` via `yarn openapi:types` or `yarn dev`

## Testing
The Test setup for this project is extremly minimal. There is a single unit test for the backend, implemented via vitest.
