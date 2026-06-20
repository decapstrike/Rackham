# MathForge

MathForge is a gamified math tutoring prototype for a rising 6th grader. The MVP proves whether a child will voluntarily complete a short daily math quest and want to return tomorrow.

## Local Development

```sh
npm install
npm run build
npm run test
npm run dev:api
npm run dev:mobile
```

The first sprint is intentionally local-first:

- Deterministic math generators own correctness.
- The API uses in-memory persistence until the core loop is proven.
- AI tutor calls are optional and have deterministic fallbacks.
- No secrets are committed.

## Workspaces

- `apps/api`: Node/Express TypeScript API.
- `apps/mobile`: Expo React Native prototype.
- `packages/shared`: shared contracts, seed data, math engine, and game economy.

## MVP Demo Path

1. Create a child profile.
2. Start the daily quest, "Reignite the Fraction Furnace."
3. Answer 8 problems.
4. Use a hint.
5. Earn XP and coins.
6. Buy a forge upgrade.
7. Review the parent dashboard.
