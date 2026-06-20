# API Contracts

Base URL: `http://localhost:4000`

## Child Profile

`POST /child-profiles`

```json
{
  "displayName": "Player",
  "gradeLevel": 6,
  "interests": ["space", "dragons"],
  "preferredTheme": "forge",
  "tutorTone": "coach",
  "dailyGoalMinutes": 10
}
```

`interests` is optional and may be omitted or empty.

## Home

`GET /child-profiles/:childProfileId/home`

Returns child rewards, daily quest availability, current daily quest presentation, skill progress, and forge upgrades.

## Daily Quest

`POST /child-profiles/:childProfileId/quests/daily`

```json
{
  "preferredLength": 8,
  "subjectId": "math"
}
```

The returned quest should include a deterministic presentation payload derived from the child profile, subject, and focus skill:

```json
{
  "quest": {
    "id": "quest_123",
    "title": "Reignite the Fraction Furnace",
    "subjectId": "math",
    "focusSkillId": "skill_equivalent_fractions",
    "presentation": {
      "title": "Reignite the Fraction Furnace",
      "flavor": "A forge-themed recovery run for equivalent fractions.",
      "gradeLevel": 6,
      "theme": "forge",
      "tutorTone": "coach",
      "interestMotif": "space"
    }
  }
}
```

Quest presentation rules:

- `title` and `flavor` are deterministic server-side strings.
- `gradeLevel` controls vocabulary density and intensity.
- `interests` may add one light motif only; they do not change the underlying activities.
- `preferredTheme` shapes nouns, metaphors, and surface art direction.
- `tutorTone` shapes encouragement style only.
- `subjectId` and `focusSkillId` anchor the actual learning content.
- AI must not be used for answer checking, activity generation, or correctness decisions.

## Next Activity

`GET /quests/:questId/next-problem`

Returns one unanswered activity without exposing server-only answer metadata beyond what is needed for display. The current route name is still `next-problem` for compatibility; future API cleanup can rename it to `next-activity`.

## Submit Answer

`POST /problem-attempts/:attemptId/answer`

```json
{
  "submittedAnswer": "B",
  "timeSpentSeconds": 18
}
```

## Hint

`POST /problem-attempts/:attemptId/hint`

```json
{
  "hintLevel": 1
}
```

## Complete Quest

`POST /quests/:questId/complete`

Returns quest summary and earned rewards.

## Parent Dashboard

`GET /child-profiles/:childProfileId/parent-summary`

Returns 7-day practice stats and recommended next quest.
