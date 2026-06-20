# LearningForge

LearningForge is a subject-agnostic daily learning quest prototype. The first subject pack is 6th-grade math, but the product model should also support future reading, science, vocabulary, and other practice domains without rebuilding the habit loop.

## Local Development

```sh
npm install
npm run build
npm run test
npm run dev:api
npm run dev:mobile
```

The first sprint is intentionally local-first:

- Deterministic content engines own correctness.
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
3. Answer 8 activities.
4. Use a hint.
5. Earn XP and coins.
6. Buy a forge upgrade.
7. Review the parent dashboard.

## Planning Docs

- `docs/CONTENT_MODEL.md`: subject-agnostic content model and correctness boundary.
- `docs/ACTIVITY_TYPES.md`: supported MVP activity types and payload rules.
- `docs/AI_TUTOR_SPEC.md`: AI tutor limits, fallbacks, and output rules.
- `docs/CHILD_SAFETY.md`: child safety, privacy, and copy guardrails.
