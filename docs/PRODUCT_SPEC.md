# MathForge Product Spec

MathForge is a gamified math tutoring app for one initial user: a 12-year-old rising 6th grader. It should feel like a lightweight RPG/base-building game where solving problems rebuilds the ancient MathForge.

The behavioral question for the MVP is: will the child voluntarily complete a short math session today and want to come back tomorrow?

## MVP Experience

- Child creates a profile.
- Home shows level, XP, coins, streak, forge/base state, and the daily quest.
- The daily quest title and flavor adapt to the child's grade, interests, preferred theme, tutor tone, and current focus skill.
- A daily quest has 8 problems: 5 focus, 2 review, and 1 challenge.
- Each problem gives instant feedback, hints, and a retry path.
- Completion grants XP, coins, skill progress, and forge upgrade progress.
- Parent dashboard shows weekly progress, strong skills, weak skills, and a plain-English summary.

## Product Rules

- No shaming.
- Reward effort, correction, and consistency.
- Keep sessions near 8-12 minutes.
- Make progress visible.
- Do not expose open chat to the child.
- AI can improve wording, but deterministic code owns correctness.
- Quest personalization should be deterministic server-side presentation, not AI-generated math logic.
