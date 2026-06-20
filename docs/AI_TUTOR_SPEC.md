# AI Tutor Spec

The AI tutor is an optional wording layer. It should make deterministic learning content warmer and clearer, not decide whether the child is correct.

## Allowed Uses

- Reword deterministic feedback into short encouraging copy.
- Reword hints without revealing the answer earlier than the deterministic hint level allows.
- Summarize parent progress from real attempt data.
- Adjust tone to the child profile's `tutorTone`.

## Not Allowed

- Generate hidden answer truth for MVP activities.
- Decide correctness, score, mastery, rewards, streaks, or quest completion.
- Create open-ended child chat.
- Ask for unnecessary child personal data.
- Produce shame, fear, pressure, diagnoses, or comparisons to other children.

## Fallback Rule

Every AI-assisted surface must work with model access disabled or failing. The deterministic fallback must be child-safe, concise, and useful enough to ship.

## Output Rules

- Child feedback: one or two short sentences.
- Hint 1: conceptual nudge only.
- Hint 2: procedure or strategy.
- Hint 3: near-solution step, still not a hidden grading bypass when avoidable.
- Parent summary: plain-English facts from actual attempts, not speculation.
