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
  accuracy: number; // 0-100
  mastery: number; // 0-100, accuracy tempered by how much evidence we have
  status: SkillStatus;
  lastAttemptAt: string | null;
};

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
function masteryFor(attempts: number, accuracy: number): number {
  if (attempts === 0) return 0;
  const confidence = Math.min(1, attempts / 3);
  return Math.round(accuracy * confidence + 50 * (1 - confidence));
}

function computeSkillStats(attempts: QuizAttempt[]): SkillStat[] {
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
      mastery: masteryFor(total, accuracy),
      status: statusFor(total, accuracy),
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

// Rank tested skills weakest-first. We sort by accuracy ascending, then by
// number of attempts (more evidence = more confident it's a real gap), then by
// the domain's exam weight (a weak high-weight domain hurts the score more).
function rankWeakest(skillStats: SkillStat[]): SkillStat[] {
  return skillStats
    .filter((s) => s.attempts > 0)
    .sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      if (a.attempts !== b.attempts) return b.attempts - a.attempts;
      return b.examWeight - a.examWeight;
    });
}

// Return-on-effort score for *recommending* what to study next. Rather than
// always sending the learner to a 0% skill (a long climb), this favours the
// "quick wins" — skills already part-way there, in heavier exam domains, where
// pushing to exam-safe (80%) recovers the most marks for the least effort.
function recommendationScore(skill: SkillStat): number {
  if (skill.attempts === 0) return 0; // can't recommend what we haven't measured
  if (skill.status === "strong") return skill.examWeight * 0.1; // already safe

  // Closer to the pass line = quicker win. 0% still matters (floor 0.5),
  // but a 50-79% skill scores higher because it's nearly there.
  const winnability = 0.5 + 0.5 * (skill.accuracy / 80);
  // More attempts = we're more sure the gap is real, not noise.
  const evidence = 0.6 + 0.4 * Math.min(1, skill.attempts / 2);
  return skill.examWeight * winnability * evidence;
}

// Rank skills by best return-on-effort toward passing (highest score first).
function rankRecommended(skillStats: SkillStat[]): SkillStat[] {
  return skillStats
    .filter((s) => s.attempts > 0 && s.status !== "strong")
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
// keeping a strength sharp — so it reads correctly whichever path the user picks.
function buildReason(skill: SkillStat): string {
  const attemptWord = skill.attempts === 1 ? "attempt" : "attempts";
  const base = `You've answered ${skill.attempts} ${attemptWord} on "${skill.skillName}" and got ${skill.correct} right (${skill.accuracy}% accuracy).`;
  const domainBit = `It's in the "${skill.domainName}" domain, ${skill.examWeight}% of the CLF-C02 exam`;

  if (skill.status === "strong") {
    return `${base} You're strong here — ${domainBit}, so a quick rep keeps these easy marks locked in.`;
  }
  if (skill.status === "developing") {
    return `${base} You're already part-way there — ${domainBit}. Pushing this one skill from ${skill.accuracy}% to exam-safe (80%) recovers more marks per minute than starting a 0% skill from scratch, so it's your fastest route to a pass.`;
  }
  return `${base} ${domainBit}, so closing this gap moves your score the most right now.`;
}

export function buildSnapshot(userId = "user_1"): EngineSnapshot {
  const attempts = allAttempts.filter((a) => a.userId === userId);

  const skillStats = computeSkillStats(attempts);
  const domainStats = computeDomainStats(attempts);
  const weakestSkills = rankWeakest(skillStats);
  const recommendedSkills = rankRecommended(skillStats);

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const overallAccuracy =
    totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);

  // Exam-weighted readiness. Domain weights sum to 100, so this yields a
  // conservative percentage where untested domains drag readiness down.
  const examReadiness = Math.round(
    domainStats.reduce(
      (sum, d) => sum + (d.examWeight * d.accuracy) / 100,
      0,
    ),
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
  skillSets: CurriculumSkillSet[];
};

export function buildCurriculum(snapshot: EngineSnapshot): CurriculumDomain[] {
  const statById = new Map(snapshot.skillStats.map((s) => [s.skillId, s]));
  return domains.map((domain) => {
    const domainStat = snapshot.domainStats.find(
      (d) => d.domainId === domain.id,
    );
    return {
      id: domain.id,
      name: domain.name,
      examWeight: domain.examWeight,
      accuracy: domainStat?.accuracy ?? 0,
      skillSets: skillSets
        .filter((ss) => ss.domainId === domain.id)
        .map((ss) => ({
          id: ss.id,
          name: ss.name,
          skills: skills
            .filter((s) => s.skillSetId === ss.id)
            .map((s) => statById.get(s.id)!),
        })),
    };
  });
}
