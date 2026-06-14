// attempts.ts
// Real quiz answers the learner records in the UI. These are merged into the
// personalisation engine alongside the seeded mock attempts, so taking quizzes
// actually moves accuracy, mastery and exam-readiness. Persisted in a cookie
// (so the server engine can read it) mirrored to localStorage on the client.

import type { QuizAttempt } from "@/lib/data";

export const RECORDED_ATTEMPTS_COOKIE = "adept_attempts";
export const RECORDED_ATTEMPTS_STORAGE_KEY = "adept_attempts";

// Cookies cap at ~4KB; keep the most recent N answers to stay well under it.
export const MAX_RECORDED_ATTEMPTS = 40;

export type RecordedAttempt = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string; // ISO
};

export function parseRecordedAttempts(
  raw: string | undefined | null,
): RecordedAttempt[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (a): a is Record<string, unknown> =>
          !!a && typeof a === "object" && typeof (a as { questionId?: unknown }).questionId === "string",
      )
      .map((a) => ({
        questionId: String(a.questionId),
        selectedAnswer: String(a.selectedAnswer ?? ""),
        isCorrect: Boolean(a.isCorrect),
        answeredAt:
          typeof a.answeredAt === "string"
            ? a.answeredAt
            : new Date().toISOString(),
      }))
      .slice(-MAX_RECORDED_ATTEMPTS);
  } catch {
    return [];
  }
}

// Shape recorded answers into engine QuizAttempts for a given user.
export function toQuizAttempts(
  recorded: RecordedAttempt[],
  userId: string,
): QuizAttempt[] {
  return recorded.map((a, i) => ({
    id: `rec_${i}_${a.answeredAt}`,
    userId,
    questionId: a.questionId,
    selectedAnswer: a.selectedAnswer,
    isCorrect: a.isCorrect,
    answeredAt: a.answeredAt,
  }));
}
