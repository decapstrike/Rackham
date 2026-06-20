# MathForge Infrastructure

This directory is reserved for infrastructure planning and future infrastructure-as-code. No deployment resources are active yet.

Current infrastructure docs:

- `docs/AWS_INFRASTRUCTURE_PLAN.md`: pragmatic AWS service map and migration sequence.
- `docs/LOCAL_DEV_INFRA.md`: local Docker Postgres and environment setup.
- `docker-compose.yml`: local Postgres service matching `.env.example`.

## Guardrails

- Do not deploy from this directory yet.
- Keep API secrets server-side in AWS Secrets Manager when AWS alpha is created.
- Keep Expo public variables limited to public configuration.
- Preserve local development as the default path until the persistent API store is ready.
- Add IaC in small modules when implementation starts, rather than committing a large speculative stack.

## Future Layout

A future IaC implementation can use this shape:

```text
infra/
  README.md
  environments/
    alpha/
  modules/
    network/
    database/
    api-service/
    config/
    observability/
```

The first alpha stack should include only VPC networking, ECS Fargate API hosting, RDS Postgres, Secrets Manager/SSM config, ALB/TLS, and CloudWatch logs.
