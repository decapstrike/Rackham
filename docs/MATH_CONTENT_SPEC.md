# Math Content Spec

MVP math scope targets rising 6th-grade readiness.

## Domains

- Fractions: equivalent fractions, simplifying, comparing, adding common denominators, adding unlike denominators, multiplying simple fractions.
- Decimals: place value, comparing, adding, subtracting, multiplying by whole numbers.
- Ratios: ratio language, equivalent ratios, unit rates, scaling.
- Negative Numbers: number line, comparing, adding, subtracting.
- Pre-Algebra: variables, expressions, one-step equations, function tables.
- Geometry: perimeter, area, coordinate plane, volume.

## Generator Contract

Every deterministic generator returns `GeneratedProblem` with prompt, answer format, correct answer, explanation, three hints, difficulty, and metadata.

## Hint Rules

1. Conceptual nudge.
2. Procedural hint.
3. Almost-solution step.

Hint 1 must not reveal the final answer unless unavoidable.
