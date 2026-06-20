# LearningForge QA Plan

## Sprint 1 QA Goal

Validate that the MVP proves the daily learning quest loop without hiding correctness or reward defects behind AI wording. Sprint 1 passes QA only when a child can create a profile, complete "Reignite the Fraction Furnace," receive deterministic feedback and rewards, buy one forge upgrade, and a parent can see a summary based on real attempts.

## Sprint 1 Release Gates

- Daily quest contains exactly 8 activities: 5 focus, 2 review, and 1 challenge.
- The quest can be completed in one uninterrupted flow with no dead ends.
- At least one correct answer, one incorrect answer, one hint, and one retry are verified during the run.
- XP, coins, skill progress, streak, and forge upgrade progress change only after the expected quest or upgrade actions.
- Parent dashboard reflects the completed quest attempts, not placeholder or static data.
- AI-offline mode still gives child-safe feedback, hints, and parent summaries from deterministic fallback content.
- No child-facing copy is shaming, overly long, or open-ended chat.
- Activity payloads follow `docs/CONTENT_MODEL.md` and `docs/ACTIVITY_TYPES.md`.

## Manual Quest Loop Script

1. Open the app.
2. Create a child profile with grade level 6, forge theme, coach tone, and a 10-minute daily goal.
3. Confirm home shows level, XP, coins, streak, forge state, skill progress, and one available daily quest.
4. Start "Reignite the Fraction Furnace" with preferred length 8.
5. Confirm the quest sequence has 5 focus activities, 2 review activities, and 1 challenge activity.
6. Answer the first activity correctly and confirm immediate positive feedback appears before moving on.
7. Answer a later activity incorrectly and confirm the app shows non-shaming feedback plus a retry path.
8. Request hint level 1 and confirm it is a conceptual nudge that does not reveal the final answer.
9. Retry the missed activity and submit the correct answer.
10. Complete all 8 activities and finish the quest.
11. Confirm quest completion grants XP, coins, skill progress, streak or daily completion state, and forge upgrade progress.
12. Buy or upgrade one forge item and confirm coins decrease by the item cost exactly once.
13. Return home and confirm the upgraded forge state is visible.
14. Open the parent dashboard and confirm weekly stats, strong skills, weak skills, plain-English summary, and recommended next quest reflect the just-completed attempts.

## Math Correctness Spot Checks

Use deterministic expected answers for the math pack. AI text can vary, but correctness, hints, explanations, and scoring must not.

| Area | Check | Expected Result |
| --- | --- | --- |
| Equivalent fractions | Generate or encounter an equivalent fraction activity. | Correct answer matches a mathematically equivalent fraction; alternate equivalent forms are accepted only if the answer checker supports them intentionally. |
| Simplifying fractions | Submit a reducible and simplified form where allowed. | Checker accepts the canonical simplified answer and rejects unrelated numerators or denominators. |
| Comparing fractions | Test two fractions with unlike denominators. | Ordering is based on numeric value, not string or denominator order. |
| Adding common denominators | Submit numerator addition with denominator preserved. | Correct answer is accepted and denominator is not added incorrectly. |
| Adding unlike denominators | Test a lowest-common-denominator case. | Correct answer is normalized or accepted according to answer format rules. |
| Simple fraction multiplication | Test numerator times numerator and denominator times denominator. | Product is correct and simplification behavior is consistent. |
| Review activity | Encounter one non-fraction review item. | Skill metadata identifies it as review, not focus. |
| Challenge activity | Encounter the challenge item. | Difficulty and reward treatment match challenge metadata. |

For every spot check, inspect:

- Prompt is unambiguous and age-appropriate.
- Correct answer is deterministic.
- Explanation matches the answer.
- Three hints are present.
- Hint 1 does not reveal the final answer unless the format makes that unavoidable.
- Incorrect answers are recorded without granting correctness rewards.

## AI-Offline Mode

Run the full manual quest loop with AI calls disabled or forced to fail.

- Activity prompts, answer checking, explanations, and hints still render from deterministic content.
- Child-facing feedback remains short, encouraging, and non-shaming.
- Parent summary still describes real 7-day practice stats without pretending AI analysis ran.
- No screen blocks on loading, retrying, or missing AI responses.
- Logs may record the AI fallback, but the child experience should not expose technical error text.

## Parent Dashboard Validation

Before opening the dashboard, complete a quest with a known mix of correct, incorrect, hinted, retried, focus, review, and challenge attempts.

- 7-day practice stats include the completed quest.
- Strong skills come from higher-performing attempted skills.
- Weak skills come from missed, hinted, retried, or slower attempted skills.
- Plain-English summary is based on the actual attempt mix.
- Recommended next quest follows observed skill needs and does not point to a nonexistent quest.
- Parent view does not expose server-only explanation metadata or unnecessary child personal data.

## Critical Checks

- Daily quest loop has no blocking bug.
- Feedback is visible before continuing.
- AI-offline mode still produces useful messages.
- Parent dashboard reflects actual attempts.
- Activity answers are deterministic and spot-checked.
- Rewards are granted once, not per refresh or duplicate completion request.
- Hints are tracked without marking the attempt wrong by themselves.
- Retry success is rewarded as effort and correction, not treated as failure-only.
- Quest completion cannot happen before all 8 activities are answered.
- API responses do not expose hidden correct-answer metadata to the child activity display.

## API Contract Smoke Checks

Use `http://localhost:4000` when the API is running.

- `POST /child-profiles` creates the child profile used for the run.
- `GET /child-profiles/:childProfileId/home` returns rewards, daily quest availability, skill progress, and forge upgrades.
- `POST /child-profiles/:childProfileId/quests/daily` accepts `{ "preferredLength": 8 }` and returns the Sprint 1 quest.
- `GET /quests/:questId/next-problem` returns one unanswered activity at a time without server-only explanation metadata.
- `POST /problem-attempts/:attemptId/answer` records correctness and time spent.
- `POST /problem-attempts/:attemptId/hint` records the requested hint level.
- `POST /quests/:questId/complete` returns quest summary and earned rewards only after all 8 activities are answered.
- `GET /child-profiles/:childProfileId/parent-summary` returns 7-day practice stats and a recommended next quest.

## Known Sprint 1 Limits

- Persistence is in-memory.
- Authentication is intentionally omitted.
- Visual polish is functional prototype quality, not final game art.
- QA should not require social, chat, marketplace, billing, classroom, push notification, subscription, or Android release behavior.
