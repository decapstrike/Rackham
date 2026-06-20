# Quest Personalization Contract

This document defines the server-side contract for quest title and flavor personalization in MathForge.

## Goal

Make the daily quest feel tailored to the child without changing math correctness, problem generation, or answer checking.

## Inputs

The personalization layer may use these child profile inputs:

- `gradeLevel`
- `interests` as an optional short array of parent-entered nouns or topics
- `preferredTheme`
- `tutorTone`
- `focusSkillId`

Only the grade, interests, theme, tone, and focus skill should influence quest presentation text.

## Outputs

Quest generation should return a presentation object alongside the normal quest payload:

```json
{
  "title": "Reignite the Fraction Furnace",
  "flavor": "Forge a path through equivalent fractions.",
  "gradeLevel": 6,
  "theme": "forge",
  "tutorTone": "coach",
  "focusSkillId": "skill_equivalent_fractions",
  "interestMotif": "space"
}
```

## Rules

- Deterministic: the same inputs should produce the same presentation result.
- Non-AI for correctness: presentation text can be templated, but math generation and answer checking stay fully deterministic.
- Short copy: titles should be compact and readable in the home screen and quest header.
- Age-fit: grade should control the vocabulary and energy level.
- Light motif only: interests can contribute at most one surface-level theme cue.
- Theme controls style words, not content scope.
- Tone controls encouragement phrasing, not the problem set.
- Focus skill is the anchor. The quest title and flavor must clearly point at the skill being practiced.

## Recommended Implementation Shape

- Add a small server helper that accepts the child profile and focus skill.
- Build quest title/flavor from a fixed template table keyed by theme, tone, and grade band.
- Keep the helper separate from math generation and answer checking.
- Return the presentation object from `POST /child-profiles/:childProfileId/quests/daily` and `GET /child-profiles/:childProfileId/home`.

## Example Mapping

For a sixth grader with `preferredTheme = forge`, `tutorTone = coach`, `interests = ["space"]`, and a focus skill of equivalent fractions:

- title: `Reignite the Fraction Furnace`
- flavor: `Repair the forge by mastering equivalent fractions.`

For a younger child with `preferredTheme = fantasy`, `tutorTone = guide`, and `interests = ["dinosaurs"]`:

- title: `Restore the Dragon Gate`
- flavor: `A calmer quest that uses the same math skill, wrapped in fantasy language.`

## Out of Scope

- No AI-written math explanations.
- No personalization of the underlying problem set beyond selecting the correct focus and review mix.
- No collection of extra child data beyond the minimum needed for presentation.
