import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuizRunner, type QuizQuestion } from "@/components/dashboard/QuizRunner";
import { Badge } from "@/components/ui/Badge";
import { buildSnapshot, getQuizPlan } from "@/lib/personalization";
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

  const session = await getSession();
  const snapshot = buildSnapshot(session?.userId);
  const plan = getQuizPlan(snapshot, skillParam);

  const nameBySkillId = new Map(
    snapshot.skillStats.map((s) => [s.skillId, s.skillName]),
  );
  const focusSkill =
    (skillParam && nameBySkillId.get(skillParam)) ||
    snapshot.studySession.skill.skillName;

  const questions: QuizQuestion[] = plan.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    skillName: nameBySkillId.get(q.skillId) ?? "",
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow="Practice quiz"
        title="5-question check"
        description={`A focused check built around your weakest skill, expanding outward through its skill set and domain.`}
      >
        <Badge mono tone="brand" dot>
          {focusSkill}
        </Badge>
      </PageHeader>

      <QuizRunner questions={questions} />
    </div>
  );
}
