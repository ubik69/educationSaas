// onboarding.ts
// Everything the self-assessment onboarding needs: the ordered list of skills to
// rate, the 0-10 level labels, a default demo profile, and helpers to read/write
// the ratings. Self-ratings act as a PRIOR for the recommendation engine — see
// lib/personalization.ts for how they blend with real quiz performance.

import { domains, skillSets, skills } from "@/lib/data";

export const SELF_RATINGS_COOKIE = "adept_self_ratings";
export const ONBOARDED_COOKIE = "adept_onboarded";
export const SELF_RATINGS_STORAGE_KEY = "adept_self_ratings";

export type SelfRatings = Record<string, number>; // skillId -> 0..10

export type OnboardingSkill = {
  skillId: string;
  name: string;
  skillSetName: string;
  domainName: string;
};

const skillSetById = new Map(skillSets.map((ss) => [ss.id, ss]));
const domainById = new Map(domains.map((d) => [d.id, d]));

// Ordered the same way as the curriculum (domain → skill set → skill).
export const onboardingSkills: OnboardingSkill[] = skills.map((skill) => {
  const skillSet = skillSetById.get(skill.skillSetId)!;
  const domain = domainById.get(skillSet.domainId)!;
  return {
    skillId: skill.id,
    name: skill.name,
    skillSetName: skillSet.name,
    domainName: domain.name,
  };
});

export type LevelLabel = {
  label: string;
  blurb: string;
  tone: "danger" | "warning" | "brand";
};

// The headline label changes as the user drags the slider.
export function labelForLevel(level: number): LevelLabel {
  if (level <= 0)
    return {
      label: "No idea yet",
      blurb: "Totally new to this — we'll start from the ground up.",
      tone: "danger",
    };
  if (level <= 2)
    return {
      label: "Just starting",
      blurb: "You've seen it, but it hasn't clicked yet.",
      tone: "danger",
    };
  if (level <= 4)
    return {
      label: "Getting the basics",
      blurb: "You know the gist, with gaps to fill in.",
      tone: "warning",
    };
  if (level <= 6)
    return {
      label: "Pretty solid",
      blurb: "Comfortable here — just needs sharpening.",
      tone: "warning",
    };
  if (level <= 8)
    return {
      label: "You're really good at this",
      blurb: "Strong grasp. We'll mostly keep it warm.",
      tone: "brand",
    };
  return {
    label: "Expert level",
    blurb: "You could teach this one. We'll trust you here.",
    tone: "brand",
  };
}

// Colour a 0-10 level on a red→amber→green scale: low = weak (red), high =
// strong (green, near our brand emerald). Used for the graph dots and slider.
export function levelColor(level: number): string {
  const clamped = Math.max(0, Math.min(10, level));
  const hue = clamped * 15; // 0 → red, 75 → amber, 150 → green
  return `hsl(${hue} 72% 52%)`;
}

// The improved "in 4 weeks" projection: each rating is pushed 60% of the way
// toward mastery (10), so weak skills jump the most and the green line lands in
// the exam-safe zone — a visibly better curve than today's self-ratings.
export function projectedLevel(level: number): number {
  const clamped = Math.max(0, Math.min(10, level));
  return Math.min(10, clamped + (10 - clamped) * 0.6);
}

// Default demo profile — used when no real ratings are present (e.g. the public
// landing page, or a dashboard viewed before onboarding). Chosen to tell a
// coherent story alongside the mocked quiz attempts in data.ts.
export const defaultSelfRatings: SelfRatings = {
  skill_pay_as_you_go: 8,
  skill_elasticity: 8,
  skill_capex_opex: 3,
  skill_customer_responsibilities: 5,
  skill_aws_responsibilities: 8,
  skill_iam_users_roles: 2,
  skill_mfa: 7,
  skill_ec2_basics: 8,
  skill_lambda_basics: 4,
  skill_s3_basics: 8,
  skill_s3_storage_classes: 3,
  skill_cloudwatch_metrics: 6,
  skill_aws_budgets: 7,
  skill_cost_explorer: 3,
  skill_support_plans: 2,
};

// Safely parse the cookie/localStorage value into a clean ratings map.
export function parseSelfRatings(
  raw: string | undefined | null,
): SelfRatings | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as unknown;
    if (!obj || typeof obj !== "object") return null;
    const out: SelfRatings = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const n = Number(value);
      if (Number.isFinite(n)) out[key] = Math.max(0, Math.min(10, Math.round(n)));
    }
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}
