# Activity Types

Activity types are reusable interaction patterns. A subject pack selects from these types and supplies deterministic content.

## MVP Types

| Type | Use | Answer Shape |
| --- | --- | --- |
| `multiple_choice` | Fast recognition, comparison, or vocabulary checks. | Choice id. |
| `short_answer` | Numeric, word, phrase, or symbol answer. | Normalized string or structured value. |
| `worked_step` | One focused step in a larger method. | Short answer plus explanation. |
| `ordering` | Sequence, ranking, timeline, or value ordering. | Ordered list of ids. |
| `matching` | Pair terms, examples, definitions, or values. | Pair list. |

## MVP Constraints

- Every type must support instant feedback, retry, hint, explanation, timing, and deterministic scoring.
- Activities should fit a short mobile session.
- Child-facing copy should be brief and concrete.
- Activity payloads must not expose the correct answer until the answer is submitted or the activity is completed.

## Out of Scope

- Open chat as an activity type.
- Peer, classroom, marketplace, billing, or social activities.
- Freeform AI grading without a deterministic rubric.
