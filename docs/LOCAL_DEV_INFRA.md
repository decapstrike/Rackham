# Local Development Infrastructure

LearningForge should remain easy to run locally while the AWS path is being prepared. Local infrastructure is intentionally small: Node workspaces plus a Docker-managed Postgres database.

## Prerequisites

- Node.js and npm.
- Docker Desktop or a compatible Docker engine.
- A local `.env` copied from `.env.example`.

## Quick Start

```sh
cp .env.example .env
docker compose up -d postgres
npm install
npm run build
npm run test
npm run dev:api
```

In a second terminal:

```sh
npm run dev:mobile
```

## Local Services

| Service | URL | Purpose |
| --- | --- | --- |
| API | `http://localhost:4000` | Express API for profile, quest, activity/problem, rewards, and parent summary flows. |
| Postgres | `localhost:5432` | Local database target for Prisma-backed persistence. |
| Mobile | Expo dev server | Child-facing app prototype. |

## Environment Variables

`DATABASE_URL` in `.env.example` matches the Docker Compose Postgres service:

```text
postgresql://learningforge:learningforge@localhost:5432/learningforge
```

`OPENAI_API_KEY` may stay empty. The app must continue to use deterministic fallback wording when AI is not configured.

`EXPO_PUBLIC_API_BASE_URL` is public mobile configuration and must never contain secrets.

## Docker Commands

Start the database:

```sh
docker compose up -d postgres
```

View logs:

```sh
docker compose logs -f postgres
```

Stop local infrastructure:

```sh
docker compose down
```

Stop and delete the local database volume:

```sh
docker compose down -v
```

Use the volume delete command only when you intentionally want to lose local data.

## Prisma Notes

The Prisma schema uses Postgres through `DATABASE_URL`. App-owned work should decide the exact migration and seed commands. Infrastructure support should only provide the database target and document the expected environment shape.

## Local-to-AWS Parity

Keep these aligned between local and AWS alpha:

- Postgres major version.
- Required API environment variables.
- Server-side secret ownership.
- Deterministic fallback behavior when AI is disabled.
- API contract behavior from `docs/API_CONTRACTS.md`.

Do not add local-only behavior that changes content correctness, rewards, or quest lifecycle outcomes.
