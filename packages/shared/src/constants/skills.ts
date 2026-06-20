import type { Skill, SkillDomain } from "../types/domain.js";

export const skillDomains: SkillDomain[] = [
  { id: "domain_fractions", name: "Fractions", slug: "fractions", description: "Fraction sense and operations.", displayOrder: 1 },
  { id: "domain_decimals", name: "Decimals", slug: "decimals", description: "Decimal place value and operations.", displayOrder: 2 },
  { id: "domain_ratios", name: "Ratios", slug: "ratios", description: "Ratios, rates, and scaling.", displayOrder: 3 },
  { id: "domain_negative_numbers", name: "Negative Numbers", slug: "negative-numbers", description: "Integer comparison and operations.", displayOrder: 4 },
  { id: "domain_pre_algebra", name: "Pre-Algebra", slug: "pre-algebra", description: "Variables, expressions, and equations.", displayOrder: 5 },
  { id: "domain_geometry", name: "Geometry", slug: "geometry", description: "Area, perimeter, coordinates, and volume.", displayOrder: 6 }
];

const skill = (domainId: string, slug: string, name: string, displayOrder: number): Skill => ({
  id: `skill_${slug.replaceAll("-", "_")}`,
  domainId,
  name,
  slug,
  description: name,
  gradeBand: "5-6",
  displayOrder
});

export const skills: Skill[] = [
  skill("domain_fractions", "equivalent-fractions", "Equivalent Fractions", 1),
  skill("domain_fractions", "simplifying-fractions", "Simplifying Fractions", 2),
  skill("domain_fractions", "comparing-fractions", "Comparing Fractions", 3),
  skill("domain_fractions", "add-fractions-common-denominators", "Adding Fractions with Common Denominators", 4),
  skill("domain_fractions", "add-fractions-unlike-denominators", "Adding Fractions with Unlike Denominators", 5),
  skill("domain_decimals", "comparing-decimals", "Comparing Decimals", 1),
  skill("domain_decimals", "adding-decimals", "Adding Decimals", 2),
  skill("domain_decimals", "subtracting-decimals", "Subtracting Decimals", 3),
  skill("domain_decimals", "decimal-place-value", "Decimal Place Value", 4),
  skill("domain_ratios", "equivalent-ratios", "Equivalent Ratios", 1),
  skill("domain_ratios", "unit-rates", "Unit Rates", 2),
  skill("domain_ratios", "scale-ratios", "Scaling Ratios", 3),
  skill("domain_negative_numbers", "compare-integers", "Comparing Integers", 1),
  skill("domain_negative_numbers", "add-integers", "Adding Integers", 2),
  skill("domain_negative_numbers", "subtract-integers", "Subtracting Integers", 3),
  skill("domain_pre_algebra", "evaluate-expressions", "Evaluate Expressions", 1),
  skill("domain_pre_algebra", "one-step-equations-addition", "One-Step Addition Equations", 2),
  skill("domain_pre_algebra", "one-step-equations-multiplication", "One-Step Multiplication Equations", 3),
  skill("domain_geometry", "rectangle-area", "Area of Rectangles", 1),
  skill("domain_geometry", "rectangle-perimeter", "Perimeter of Rectangles", 2),
  skill("domain_geometry", "rectangular-prism-volume", "Volume of Rectangular Prisms", 3)
];

export const DEFAULT_FOCUS_SKILL_ID = "skill_equivalent_fractions";
