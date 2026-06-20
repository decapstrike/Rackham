# LearningForge Product Spec

LearningForge is a subject-agnostic daily learning app. The first MVP subject pack is 6th-grade math, wrapped in the existing forge/base-building theme, but the product should not hard-code the habit loop to math.

The behavioral question for the MVP is: will the child voluntarily complete one short learning quest today and want to come back tomorrow?

## MVP Experience

- Child creates a profile.
- Home shows level, XP, coins, streak, forge/base state, and the daily quest.
- The daily quest title and flavor adapt to the child's grade, interests, preferred theme, tutor tone, subject, and current focus skill.
- A daily quest has 8 activities: 5 focus, 2 review, and 1 challenge.
- Each activity gives instant feedback, hints or scaffolds, and a retry path.
- Completion grants XP, coins, skill progress, and forge upgrade progress.
- Parent dashboard shows weekly progress, strong areas, weak areas, and a plain-English summary.

## Product Rules

- No shaming.
- Reward effort, correction, and consistency.
- Keep sessions near 8-12 minutes.
- Make progress visible.
- Do not expose open chat to the child.
- AI can improve wording, but deterministic content engines own correctness.
- Quest personalization should be deterministic server-side presentation, not AI-generated answer logic.
- Math remains the first content pack; new subjects must plug into the same content model, activity types, safety rules, rewards, and quest lifecycle.
