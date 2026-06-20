# MathForge AWS Infrastructure Plan

MathForge should move off local infrastructure in small steps, without turning the MVP into a production platform too early. The first AWS target is a private alpha backend that keeps the daily quest loop reliable, preserves deterministic math correctness, and avoids unnecessary child data.

## Goals

- Host the API behind a stable HTTPS endpoint.
- Persist child profiles, quest state, attempts, rewards, skill progress, and forge upgrades in Postgres.
- Keep OpenAI usage optional and server-side only.
- Preserve local development with Docker Postgres and deterministic fallbacks.
- Keep the infrastructure understandable enough for one engineer to operate.

## Non-Goals

- No classroom tenancy, marketplace, billing, chat, social graph, or push notification infrastructure.
- No production-scale Kubernetes platform.
- No child identity provider until the parent/auth model is explicit.
- No analytics warehouse until the MVP proves the habit loop needs deeper reporting.

## Service Map

| Need | AWS Service | MVP Use | Notes |
| --- | --- | --- | --- |
| API hosting | ECS Fargate behind Application Load Balancer | Run the Express API as a container | Prefer ECS over Lambda for the first move because the app is already a long-running Node server and may later add background jobs. |
| Container images | ECR | Store API images | One repository for `mathforge-api` is enough. |
| Database | RDS PostgreSQL | Replace local/in-memory persistence when the Prisma-backed store is ready | Start with one small instance in private subnets. Enable automated backups. |
| Secrets | Secrets Manager | `DATABASE_URL`, `OPENAI_API_KEY`, future JWT/session secrets | Do not put secrets in task env plaintext, repo files, or Expo public config. |
| Runtime config | SSM Parameter Store | Non-secret settings such as allowed origins, feature flags, app environment | Keep feature flags server-side unless mobile needs public read-only values. |
| Networking | VPC, public/private subnets, security groups | ALB public, ECS and RDS private | Restrict RDS ingress to ECS task security group and optional admin access path. |
| TLS and DNS | ACM and Route 53 | HTTPS API endpoint | Use an API subdomain such as `api.<domain>` when a domain is selected. |
| Logs | CloudWatch Logs | API stdout/stderr and task health | Add retention from day one; 14-30 days is enough for alpha. |
| Metrics/alarms | CloudWatch Alarms | API 5xx, ECS task restarts, RDS storage/CPU | Keep alerting minimal until usage exists. |
| Static/mobile delivery | Expo/EAS | Build and distribute the mobile app | AWS does not need to host the Expo app for MVP. Mobile points at the API base URL. |
| Backups | RDS automated backups, manual snapshots before migrations | Recovery from data mistakes | Test restore before trusting it for real users. |

## Environments

### Local

- API runs with `npm run dev:api`.
- Mobile runs with `npm run dev:mobile`.
- Postgres runs through `docker-compose.yml`.
- AI wording remains optional. Empty `OPENAI_API_KEY` must keep deterministic fallback behavior.

### AWS Alpha

- One AWS account/environment is enough for the first off-local move.
- ECS service runs one or two API tasks.
- RDS Postgres is private.
- Secrets live in Secrets Manager.
- Mobile builds use `EXPO_PUBLIC_API_BASE_URL=https://api.<domain-or-alb>`.

### Later Production

Split alpha and production only when real users or migration risk justify it. At that point, duplicate the stack with separate VPC, RDS, secrets, and Expo release channel.

## Proposed AWS Shape

```text
Internet
  |
  v
Route 53 + ACM
  |
  v
Application Load Balancer (public subnets)
  |
  v
ECS Fargate API service (private subnets)
  |
  +--> RDS PostgreSQL (private subnets)
  +--> Secrets Manager / SSM Parameter Store
  +--> CloudWatch Logs
  +--> OpenAI API, if enabled
```

## Data Boundaries

- Store only the child profile data required for the quest loop: display name, grade level, interests, preferred theme, tutor tone, daily goal, progress, attempts, and rewards.
- Do not store open-ended child chat because the MVP does not include open chat.
- Keep math answers, generators, answer checking, XP, coins, quest lifecycle, and rewards deterministic in application code.
- AI may reword tutor hints or summaries later, but it must not decide correctness or generate problem truth.

## Migration Sequence

1. Keep local development working with Docker Postgres and `.env.example`.
2. Finalize the persistent Prisma store and migrations in app-owned work.
3. Containerize the API once the store is ready.
4. Create the AWS alpha stack: VPC, ECR, ECS, ALB, RDS, Secrets Manager, CloudWatch.
5. Run migrations against the AWS alpha database through a controlled one-off task or operator command.
6. Build an Expo alpha pointing at the AWS API.
7. Add basic operational checks: health endpoint, logs, backup verification, and rollback notes.

## Open Decisions

- Domain name for the alpha API.
- Whether parent identity is passwordless email, Cognito, or a simpler private-alpha gate.
- Whether Prisma migrations will run in CI, an ECS one-off task, or a manual operator command for alpha.
- Whether the API needs background jobs before production; if yes, add a second ECS worker service instead of overloading request handlers.

## Infrastructure-as-Code Direction

Use `infra/` for AWS planning and future IaC. Do not deploy from this repository until the API persistence path and auth boundary are clear. When implementation starts, prefer a small CDK or Terraform stack with:

- Network module.
- Database module.
- API service module.
- Secrets/config module.
- Observability module.

Keep the first stack boring and reversible.
