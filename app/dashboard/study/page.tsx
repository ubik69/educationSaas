import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AiStudyContent } from "@/components/dashboard/AiStudyContent";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillStatusBadge } from "@/components/ui/SkillStatusBadge";
import { buildSnapshot } from "@/lib/personalization";
import { generateStudyContent } from "@/lib/ai/provider";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Today's session",
};

export default async function StudySessionPage() {
  const session = await getSession();
  const snapshot = buildSnapshot(session?.userId);
  const study = snapshot.studySession;
  const skill = study.skill;

  const aiContent = await generateStudyContent({
    skillId: skill.skillId,
    skillName: skill.skillName,
    skillSetName: skill.skillSetName,
    domainName: skill.domainName,
    accuracy: skill.accuracy,
    attempts: skill.attempts,
    examWeight: skill.examWeight,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow="Today's study session"
        title={skill.skillName}
        description={study.reason}
      >
        <Button href={`/dashboard/quiz?skill=${skill.skillId}`}>
          Start the 5-question check
          <Icon name="arrowRight" size={18} />
        </Button>
      </PageHeader>

      {/* Why this skill */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card flex flex-col justify-between p-5">
          <p className="text-xs text-faint">Your accuracy</p>
          <div className="mt-3">
            <p className="font-mono text-2xl font-semibold text-fg">
              {skill.accuracy}%
            </p>
            <p className="mt-1 text-xs text-muted">
              {skill.correct}/{skill.attempts} correct
            </p>
            <div className="mt-3">
              <ProgressBar value={skill.mastery} height="h-1.5" />
            </div>
          </div>
        </div>
        <div className="card flex flex-col justify-between p-5">
          <p className="text-xs text-faint">Where it sits</p>
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium">{skill.skillSetName}</p>
            <Badge mono tone="neutral">
              {skill.domainName}
            </Badge>
          </div>
        </div>
        <div className="card flex flex-col justify-between p-5">
          <p className="text-xs text-faint">Why it matters</p>
          <div className="mt-3">
            <p className="font-mono text-2xl font-semibold text-brand">
              {skill.examWeight}%
            </p>
            <p className="mt-1 text-xs text-muted">
              of the exam is this domain
            </p>
            <div className="mt-3">
              <SkillStatusBadge status={skill.status} />
            </div>
          </div>
        </div>
      </section>

      {/* AI-generated lesson, remediation, flashcards */}
      <AiStudyContent skillId={skill.skillId} initial={aiContent} />

      {/* Quiz plan */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface-2 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-brand">
              <Icon name="list" size={18} />
            </span>
            <p className="font-semibold">5-question check</p>
          </div>
          <Badge mono tone="neutral">
            {study.quizPlan.length} questions
          </Badge>
        </div>
        <ol className="divide-y divide-line">
          {study.quizPlan.map((q, i) => (
            <li key={q.id} className="flex items-start gap-4 px-6 py-4">
              <span className="font-mono text-sm text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-muted">{q.question}</p>
            </li>
          ))}
        </ol>
        <div className="border-t border-line p-5">
          <Button
            href={`/dashboard/quiz?skill=${skill.skillId}`}
            className="w-full sm:w-auto"
          >
            Take the check now
            <Icon name="arrowRight" size={18} />
          </Button>
        </div>
      </section>

      {/* Recommendation */}
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface/40 p-5 text-sm text-muted">
        <span className="mt-0.5 shrink-0 text-brand">
          <Icon name="brain" size={18} />
        </span>
        <p>{aiContent.recommendation}</p>
      </div>
    </div>
  );
}
