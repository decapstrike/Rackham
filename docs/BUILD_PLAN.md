# LearningForge Build Plan

## Sprint 1 Goal

Prove the learning habit loop with the existing math pack:

1. Create child profile.
2. Start "Reignite the Fraction Furnace" as the first math quest.
3. Complete 8 fraction/review activities.
4. Use a hint.
5. Receive XP and coins.
6. See skill progress.
7. Buy a forge upgrade.
8. View parent summary.

## Milestones

1. Skeleton app: monorepo, API, mobile shell, shared package.
2. Content model: subject, skill, activity, answer, hint, explanation, and safety metadata.
3. Learning engine: deterministic generation and answer checking for the math pack.
4. Quest loop: create quest, fetch activity, answer, hint, complete.
5. Quest personalization: deterministic title and flavor selection from grade, interests, preferred theme, tutor tone, subject, and focus skill.
6. Progression: XP, coins, levels, skill mastery, forge upgrades.
7. AI tutor: optional AI wrapper with deterministic fallback.
8. Parent dashboard: weekly summary from real attempts.
9. Polish prototype: QA pass and child-ready flow.

## Quest Personalization Slice

- Add an explicit server-side quest presentation helper.
- Keep content generation and answer checking independent from presentation text.
- Use the child profile plus subject and focus skill as the only inputs for quest title and flavor selection.
- Treat interests as a light surface-level motif signal, not as content generation for the activities themselves.

## Non-MVP

Do not build multiplayer, leaderboards, purchases, classroom mode, open chat, subscriptions, push notifications, or Android release in the first prototype.
