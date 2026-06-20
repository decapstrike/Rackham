# MathForge Build Plan

## Sprint 1 Goal

Prove the loop:

1. Create child profile.
2. Start "Reignite the Fraction Furnace."
3. Complete 8 fraction/review problems.
4. Use a hint.
5. Receive XP and coins.
6. See skill progress.
7. Buy a forge upgrade.
8. View parent summary.

## Milestones

1. Skeleton app: monorepo, API, mobile shell, shared package.
2. Math engine: deterministic generators and answer checker.
3. Quest loop: create quest, fetch problem, answer, hint, complete.
4. Quest personalization: deterministic title and flavor selection from grade, interests, preferred theme, tutor tone, and focus skill.
5. Progression: XP, coins, levels, skill mastery, forge upgrades.
6. AI tutor: optional AI wrapper with deterministic fallback.
7. Parent dashboard: weekly summary from real attempts.
8. Polish prototype: QA pass and child-ready flow.

## Quest Personalization Slice

- Add an explicit server-side quest presentation helper.
- Keep math generation and answer checking independent from presentation text.
- Use the child profile plus focus skill as the only inputs for quest title and flavor selection.
- Treat interests as a light surface-level motif signal, not as content generation for the problems themselves.

## Non-MVP

Do not build multiplayer, leaderboards, purchases, classroom mode, open chat, subscriptions, push notifications, or Android release in the first prototype.
