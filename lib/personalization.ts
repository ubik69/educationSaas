// personalization.ts
// The "Personalisation Engine": pure functions that turn raw quiz attempts into
// per-skill mastery, domain readiness, weakest-skill ranking, and a recommended
// study session. No framework dependencies — safe to run on the server or client.

import {
  attempts as allAttempts,
  certification,
  domains,
  questions,
  skills,
  skillSets,
  type Domain,
  type Question,
  type QuizAttempt,
  type Skill,
} from "@/lib/data";
import { defaultSelfRatings, type SelfRatings } from "@/lib/onboarding";

export type SkillStatus = "untested" | "weak" | "developing" | "strong";

export type SkillStat = {
  skillId: string;
  skillName: string;
  skillSetId: string;
  skillSetName: string;
  domainId: string;
  domainName: string;
  examWeight: number;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number; // 0-100, raw quiz performance (correct/total)
  mastery: number; // 0-100, EFFECTIVE mastery: self-rating prior blended with accuracy
  status: SkillStatus; // derived from effective mastery
  selfRating: number | null; // 0-10 from onboarding, null if unrated
  lastAttemptAt: string | null;
};

// How many "virtual questions" a self-rating is worth. With K=4, a single wrong
// answer barely moves a confidently self-rated skill; after ~4-5 real answers,
// performance dominates. This is the prior strength chosen during onboarding.
const PRIOR_STRENGTH = 4;

function statusFromMastery(mastery: number): SkillStatus {
  if (mastery < 50) return "weak";
  if (mastery < 80) return "developing";
  return "strong";
}

// Effective mastery = Bayesian blend of the self-rating prior and quiz evidence.
// effective = w·accuracy + (1-w)·prior,  w = attempts / (attempts + K).
function blendMastery(
  attempts: number,
  accuracy: number,
  prior: number,
): number {
  if (attempts === 0) return Math.round(prior);
  const w = attempts / (attempts + PRIOR_STRENGTH);
  return Math.round(w * accuracy + (1 - w) * prior);
}

export type DomainStat = {
  domainId: string;
  domainName: string;
  examWeight: number;
  attempts: number;
  correct: number;
  accuracy: number; // 0-100
  skillsTested: number;
  skillsTotal: number;
};

export type AttemptDetail = QuizAttempt & {
  question: Question;
  skillName: string;
  domainName: string;
};

export type StudySession = {
  skill: SkillStat;
  reason: string;
  quizPlan: Question[];
  /** Short label for WHY the engine picked this skill, e.g. "Quick win". */
  headline: string;
};

export type EngineSnapshot = {
  userId: string;
  certificationName: string;
  certificationCode: string;
  totalAttempts: number;
  totalCorrect: number;
  overallAccuracy: number; // 0-100
  examReadiness: number; // 0-100, exam-weighted
  skillStats: SkillStat[];
  weakestSkills: SkillStat[];
  /** Skills ranked by best return-on-effort toward passing (the smart pick). */
  recommendedSkills: SkillStat[];
  domainStats: DomainStat[];
  recentAttempts: AttemptDetail[];
  studySession: StudySession;
  lastActivityAt: string | null;
};

const questionById = new Map(questions.map((q) => [q.id, q]));
const skillById = new Map<string, Skill>(skills.map((s) => [s.id, s]));
const skillSetById = new Map(skillSets.map((ss) => [ss.id, ss]));
const domainById = new Map<string, Domain>(domains.map((d) => [d.id, d]));

function statusFor(attempts: number, accuracy: number): SkillStatus {
  if (attempts === 0) return "untested";
  if (accuracy < 50) return "weak";
  if (accuracy < 80) return "developing";
  return "strong";
}

// Mastery tempers raw accuracy by confidence: a single lucky correct answer
// shouldn't read as "fully mastered". We blend accuracy toward a neutral 50%
// based on how many attempts back it up.
function computeSkillStats(
  attempts: QuizAttempt[],
  selfRatings: SelfRatings,
): SkillStat[] {
  return skills.map((skill) => {
    const skillSet = skillSetById.get(skill.skillSetId)!;
    const domain = domainById.get(skillSet.domainId)!;

    const skillAttempts = attempts.filter(
      (a) => questionById.get(a.questionId)?.skillId === skill.id,
    );
    const total = skillAttempts.length;
    const correct = skillAttempts.filter((a) => a.isCorrect).length;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    const lastAttemptAt =
      skillAttempts
        .map((a) => a.answeredAt)
        .sort()
        .at(-1) ?? null;

    const rawRating = selfRatings[skill.id];
    const selfRating =
      typeof rawRating === "number" ? Math.max(0, Math.min(10, rawRating)) : null;
    const prior = selfRating !== null ? selfRating * 10 : null;

    // With neither a self-rating nor any attempts, we genuinely have no signal.
    let mastery: number;
    let status: SkillStatus;
    if (total === 0 && prior === null) {
      mastery = 0;
      status = "untested";
    } else if (prior !== null) {
      mastery = blendMastery(total, accuracy, prior);
      status = statusFromMastery(mastery);
    } else {
      // Attempts but no self-rating: fall back to raw performance.
      mastery = blendMastery(total, accuracy, 50);
      status = statusFor(total, accuracy);
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      skillSetId: skillSet.id,
      skillSetName: skillSet.name,
      domainId: domain.id,
      domainName: domain.name,
      examWeight: domain.examWeight,
      attempts: total,
      correct,
      incorrect: total - correct,
      accuracy,
      mastery,
      status,
      selfRating,
      lastAttemptAt,
    };
  });
}

function computeDomainStats(attempts: QuizAttempt[]): DomainStat[] {
  return domains.map((domain) => {
    const domainQuestionIds = new Set(
      questions.filter((q) => q.domainId === domain.id).map((q) => q.id),
    );
    const domainAttempts = attempts.filter((a) =>
      domainQuestionIds.has(a.questionId),
    );
    const correct = domainAttempts.filter((a) => a.isCorrect).length;
    const total = domainAttempts.length;
    const skillIdsInDomain = skills.filter(
      (s) => skillSetById.get(s.skillSetId)?.domainId === domain.id,
    );
    const testedSkillIds = new Set(
      domainAttempts.map((a) => questionById.get(a.questionId)?.skillId),
    );

    return {
      domainId: domain.id,
      domainName: domain.name,
      examWeight: domain.examWeight,
      attempts: total,
      correct,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
      skillsTested: skillIdsInDomain.filter((s) => testedSkillIds.has(s.id))
        .length,
      skillsTotal: skillIdsInDomain.length,
    };
  });
}

// A skill carries signal if we've measured it OR the learner self-rated it.
// This is what lets the engine make sense from minute one, post-onboarding.
function hasSignal(s: SkillStat): boolean {
  return s.attempts > 0 || s.selfRating !== null;
}

// Rank skills weakest-first by EFFECTIVE mastery (self-rating prior blended with
// quiz performance), then by evidence, then by exam weight. Works before any
// questions are answered because the self-rating provides the initial mastery.
function rankWeakest(skillStats: SkillStat[]): SkillStat[] {
  return skillStats
    .filter(hasSignal)
    .sort((a, b) => {
      if (a.mastery !== b.mastery) return a.mastery - b.mastery;
      if (a.attempts !== b.attempts) return b.attempts - a.attempts;
      return b.examWeight - a.examWeight;
    });
}

// Return-on-effort score for *recommending* what to study next. Rather than
// always sending the learner to a 0% skill (a long climb), this favours the
// "quick wins" — skills already part-way there, in heavier exam domains, where
// pushing to exam-safe (80%) recovers the most marks for the least effort.
// Operates on effective mastery, so a confident self-rating shapes day-one picks.
function recommendationScore(skill: SkillStat): number {
  if (!hasSignal(skill)) return 0; // nothing to go on yet
  if (skill.status === "strong") return skill.examWeight * 0.1; // already safe

  // Closer to the pass line = quicker win. A rock-bottom skill still matters
  // (floor 0.5), but a 50-79% skill scores higher because it's nearly there.
  const winnability = 0.5 + 0.5 * (Math.min(skill.mastery, 80) / 80);
  // More evidence (real attempts) = more confident the gap is real, not noise.
  // Smooth ramp 0.6 -> 1.0 with the same shape and K as the mastery blend, so
  // it never hard-caps and a pure self-rating still counts, just less certainly.
  const evidence =
    0.6 + 0.4 * (skill.attempts / (skill.attempts + PRIOR_STRENGTH));
  return skill.examWeight * winnability * evidence;
}

// Rank skills by best return-on-effort toward passing (highest score first).
function rankRecommended(skillStats: SkillStat[]): SkillStat[] {
  return skillStats
    .filter((s) => hasSignal(s) && s.status !== "strong")
    .sort((a, b) => recommendationScore(b) - recommendationScore(a));
}

function headlineFor(skill: SkillStat): string {
  if (skill.status === "developing") return "Quick win";
  if (skill.status === "weak") return "Biggest gap";
  return "Keep it sharp";
}

// Build a 5-question study plan focused on the target skill. We start with the
// skill's own questions, expand to its skill set, then its domain, and finally
// fill from the learner's other weak areas so the plan is always 5 questions.
function buildQuizPlan(target: SkillStat, weakest: SkillStat[]): Question[] {
  const PLAN_SIZE = 5;
  const plan: Question[] = [];
  const seen = new Set<string>();

  const add = (qs: Question[]) => {
    for (const q of qs) {
      if (plan.length >= PLAN_SIZE) break;
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      plan.push(q);
    }
  };

  add(questions.filter((q) => q.skillId === target.skillId));
  add(questions.filter((q) => q.skillSetId === target.skillSetId));
  add(questions.filter((q) => q.domainId === target.domainId));
  for (const weak of weakest) {
    add(questions.filter((q) => q.skillId === weak.skillId));
  }
  add(questions); // last-resort fill

  return plan.slice(0, PLAN_SIZE);
}

// The "why this skill" explanation adapts to whether you're shoring up a gap or
// keeping a strength sharp — and to whether the signal so far is your own
// self-rating, real quiz answers, or a blend of both.
function buildReason(skill: SkillStat): string {
  const domainBit = `It's in the "${skill.domainName}" domain, ${skill.examWeight}% of the CLF-C02 exam`;

  // Pre-quiz: the only signal is the onboarding self-rating.
  if (skill.attempts === 0 && skill.selfRating !== null) {
    const ratedLow = skill.selfRating <= 4;
    const base = `You rated yourself ${skill.selfRating}/10 on "${skill.skillName}", so we're starting it at ${skill.mastery}%.`;
    if (skill.status === "strong") {
      return `${base} ${domainBit} — a quick check confirms it's locked in.`;
    }
    return `${base} ${domainBit}, so ${ratedLow ? "building this up" : "tightening this"} is your highest-value move right now. Answer a few questions and we'll refine this instantly.`;
  }

  const attemptWord = skill.attempts === 1 ? "attempt" : "attempts";
  const ratedBit =
    skill.selfRating !== null
      ? ` Blended with your ${skill.selfRating}/10 self-rating, that puts your effective mastery at ${skill.mastery}%.`
      : "";
  const base = `You've answered ${skill.attempts} ${attemptWord} on "${skill.skillName}" and got ${skill.correct} right (${skill.accuracy}% accuracy).${ratedBit}`;

  if (skill.status === "strong") {
    return `${base} You're strong here — ${domainBit}, so a quick rep keeps these easy marks locked in.`;
  }
  if (skill.status === "developing") {
    return `${base} You're already part-way there — ${domainBit}. Pushing this one skill to exam-safe (80%) recovers more marks per minute than starting a 0% skill from scratch, so it's your fastest route to a pass.`;
  }
  return `${base} ${domainBit}, so closing this gap moves your score the most right now.`;
}

export function buildSnapshot(
  userId = "user_1",
  selfRatings: SelfRatings = defaultSelfRatings,
): EngineSnapshot {
  const attempts = allAttempts.filter((a) => a.userId === userId);

  const skillStats = computeSkillStats(attempts, selfRatings);
  const domainStats = computeDomainStats(attempts);
  const weakestSkills = rankWeakest(skillStats);
  const recommendedSkills = rankRecommended(skillStats);

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const overallAccuracy =
    totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);

  // Exam-weighted readiness from EFFECTIVE mastery (self-rating + quiz blend),
  // so onboarding alone produces a meaningful readiness score before any quiz.
  // Each domain contributes its skills' average mastery × its exam weight.
  const examReadiness = Math.round(
    domains.reduce((sum, domain) => {
      const domainSkills = skillStats.filter((s) => s.domainId === domain.id);
      const avgMastery =
        domainSkills.length === 0
          ? 0
          : domainSkills.reduce((n, s) => n + s.mastery, 0) /
            domainSkills.length;
      return sum + (domain.examWeight * avgMastery) / 100;
    }, 0),
  );

  const recentAttempts: AttemptDetail[] = [...attempts]
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
    .map((a) => {
      const question = questionById.get(a.questionId)!;
      const skill = skillById.get(question.skillId)!;
      const domain = domainById.get(question.domainId)!;
      return {
        ...a,
        question,
        skillName: skill.name,
        domainName: domain.name,
      };
    });

  // The recommended skill is the best return-on-effort pick (a "quick win"),
  // falling back to the absolute weakest if there's nothing in between.
  const target = recommendedSkills[0] ?? weakestSkills[0] ?? skillStats[0];
  const studySession: StudySession = {
    skill: target,
    reason: buildReason(target),
    quizPlan: buildQuizPlan(target, weakestSkills),
    headline: headlineFor(target),
  };

  const lastActivityAt = recentAttempts[0]?.answeredAt ?? null;

  return {
    userId,
    certificationName: certification.name,
    certificationCode: certification.code,
    totalAttempts,
    totalCorrect,
    overallAccuracy,
    examReadiness,
    skillStats,
    weakestSkills,
    recommendedSkills,
    domainStats,
    recentAttempts,
    studySession,
    lastActivityAt,
  };
}

// Build a full study session for an arbitrary skill (used when the learner
// chooses a specific weak OR strong skill to work on). Falls back to the
// engine's recommended weakest skill when no/unknown skillId is given.
export function getStudySession(
  snapshot: EngineSnapshot,
  skillId?: string,
): StudySession {
  if (!skillId) return snapshot.studySession;
  const skill = snapshot.skillStats.find((s) => s.skillId === skillId);
  if (!skill) return snapshot.studySession;
  return {
    skill,
    reason: buildReason(skill),
    quizPlan: buildQuizPlan(skill, snapshot.weakestSkills),
    headline: headlineFor(skill),
  };
}

// Build a focused quiz plan for an arbitrary skill (used by the practice quiz).
// Falls back to the recommended weakest skill when no/unknown skillId is given.
export function getQuizPlan(
  snapshot: EngineSnapshot,
  skillId?: string,
): Question[] {
  const target =
    (skillId && snapshot.skillStats.find((s) => s.skillId === skillId)) ||
    snapshot.studySession.skill;
  return buildQuizPlan(target, snapshot.weakestSkills);
}

// "Practice more": a freshly shuffled set of questions drawn from everything the
// learner is currently weak at (weak + developing skills), expanding to their
// skill sets if there aren't enough. Random order each call.
export function getWeakPracticePlan(
  snapshot: EngineSnapshot,
  size = 5,
): Question[] {
  const weak = snapshot.skillStats.filter(
    (s) => s.attempts > 0 && s.status !== "strong",
  );
  const weakSkillIds = new Set(weak.map((s) => s.skillId));
  const weakSkillSetIds = new Set(weak.map((s) => s.skillSetId));

  const fromSkills = questions.filter((q) => weakSkillIds.has(q.skillId));
  const fromSets = questions.filter((q) => weakSkillSetIds.has(q.skillSetId));

  const pool: Question[] = [];
  const seen = new Set<string>();
  for (const q of [...fromSkills, ...fromSets, ...questions]) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    pool.push(q);
  }

  // Fisher–Yates shuffle for genuine randomness each request.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
}

// Curriculum tree helper for the syllabus / curriculum view.
export type CurriculumSkill = SkillStat;
export type CurriculumSkillSet = {
  id: string;
  name: string;
  skills: CurriculumSkill[];
};
export type CurriculumDomain = {
  id: string;
  name: string;
  examWeight: number;
  accuracy: number;
  mastery: number; // average effective mastery across the domain's skills
  skillSets: CurriculumSkillSet[];
};

export function buildCurriculum(snapshot: EngineSnapshot): CurriculumDomain[] {
  const statById = new Map(snapshot.skillStats.map((s) => [s.skillId, s]));
  return domains.map((domain) => {
    const domainStat = snapshot.domainStats.find(
      (d) => d.domainId === domain.id,
    );
    const builtSkillSets = skillSets
      .filter((ss) => ss.domainId === domain.id)
      .map((ss) => ({
        id: ss.id,
        name: ss.name,
        skills: skills
          .filter((s) => s.skillSetId === ss.id)
          .map((s) => statById.get(s.id)!),
      }));

    const allSkills = builtSkillSets.flatMap((ss) => ss.skills);
    const mastery =
      allSkills.length === 0
        ? 0
        : Math.round(
            allSkills.reduce((n, s) => n + s.mastery, 0) / allSkills.length,
          );

    return {
      id: domain.id,
      name: domain.name,
      examWeight: domain.examWeight,
      accuracy: domainStat?.accuracy ?? 0,
      mastery,
      skillSets: builtSkillSets,
    };
  });
}
