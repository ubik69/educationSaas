import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuizRunner, type QuizQuestion } from "@/components/dashboard/QuizRunner";
import { Badge } from "@/components/ui/Badge";
import {
  buildSnapshot,
  getQuizPlan,
  getWeakPracticePlan,
} from "@/lib/personalization";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Practice quiz",
};

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const skillParam = typeof params.skill === "string" ? params.skill : undefined;
  const focusParam = typeof params.focus === "string" ? params.focus : undefined;
  const weakPractice = focusParam === "weak";

  const session = await getSession();
  const snapshot = buildSnapshot(session?.userId);

  // "Practice more" pulls random questions from every weak area; otherwise we
  // build a focused plan around a chosen (or recommended) skill.
  const plan = weakPractice
    ? getWeakPracticePlan(snapshot)
    : getQuizPlan(snapshot, skillParam);

  const nameBySkillId = new Map(
    snapshot.skillStats.map((s) => [s.skillId, s.skillName]),
  );

  const questions: QuizQuestion[] = plan.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    skillName: nameBySkillId.get(q.skillId) ?? "",
  }));

  const focusLabel = weakPractice
    ? "Weak-area mix"
    : (skillParam && nameBySkillId.get(skillParam)) ||
      snapshot.studySession.skill.skillName;

  const description = weakPractice
    ? "A randomised mix of questions drawn from everything you're currently weak at. Refresh for a new set."
    : "A focused check built around the chosen skill, expanding outward through its skill set and domain.";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow="Practice quiz"
        title={weakPractice ? "Practice your weak spots" : "5-question check"}
        description={description}
      >
        <Badge mono tone="brand" dot>
          {focusLabel}
        </Badge>
      </PageHeader>

      <QuizRunner questions={questions} />
    </div>
  );
}
