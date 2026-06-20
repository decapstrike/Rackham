# Content Model

LearningForge content is subject-agnostic. Math is the first subject pack, but the platform model should support any practice domain that can provide deterministic activities, answers, hints, explanations, and progress signals.

## Core Objects

| Object | Purpose | Notes |
| --- | --- | --- |
| Subject | Broad domain such as math, reading, science, or vocabulary. | MVP ships `math` only. |
| Skill | Measurable learning target inside a subject. | Example: equivalent fractions. |
| Activity | One child-facing practice item. | Formerly called problem in some APIs. |
| Attempt | One submitted answer, hint request, retry, timing, and correctness record. | Used for rewards and parent summaries. |
| Quest | Daily sequence of activities with focus, review, and challenge mix. | Default length is 8. |
| Explanation | Deterministic rationale shown after answering. | AI can reword only when fallback is present. |
| Hint | Scaffolded help for the activity. | Three levels: nudge, procedure, near-solution. |

## Activity Contract

Every activity should include:

- `subjectId`
- `skillId`
- `activityType`
- child-safe `prompt`
- display payload for the activity type
- answer format
- deterministic correct answer or grading rule
- explanation
- three hints or scaffolds
- difficulty
- metadata for focus, review, or challenge role

## Correctness Boundary

- Deterministic code owns generated truth, accepted answers, explanations, scoring, rewards, and mastery updates.
- AI may reword feedback, summaries, or encouragement only after deterministic results exist.
- AI output must have deterministic fallback text.
- Child-facing responses must never reveal hidden answer metadata before submission.

## Subject Pack Rules

Each subject pack must define its skills, activity types, answer formats, generators or item sources, and QA spot checks before it becomes part of the daily quest loop.
