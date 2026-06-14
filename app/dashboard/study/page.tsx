import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AiStudyContent } from "@/components/dashboard/AiStudyContent";
import { LessonVideo } from "@/components/dashboard/LessonVideo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillStatusBadge } from "@/components/ui/SkillStatusBadge";
import { buildSnapshot, getStudySession } from "@/lib/personalization";
import { generateStudyContent } from "@/lib/ai/provider";
import { getSession, getSelfRatings } from "@/lib/session";

export const metadata: Metadata = {
  title: "Study session",
};

export default async function StudySessionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const skillParam = typeof params.skill === "string" ? params.skill : undefined;

  const session = await getSession();
  const selfRatings = await getSelfRatings();
  const snapshot = buildSnapshot(session?.userId, selfRatings);
  const study = getStudySession(snapshot, skillParam);
  const skill = study.skill;

  // Whether this is the engine's recommended weakest skill or one the user chose.
  const isRecommended =
    !skillParam || skillParam === snapshot.studySession.skill.skillId;
  const eyebrow =
    skill.status === "strong"
      ? "Strengthen a strength"
      : isRecommended
        ? "Today's study session"
        : "Study session";

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
        eyebrow={eyebrow}
        title={skill.skillName}
        description={study.reason}
      >
        <Button href={`/dashboard/quiz?skill=${skill.skillId}`}>
          Start quiz for &ldquo;{skill.skillName}&rdquo;
          <Icon name="arrowRight" size={18} />
        </Button>
      </PageHeader>

      {/* Why this skill */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-faint">Your accuracy</p>
          <p className="mt-3 font-mono text-2xl font-semibold text-fg">
            {skill.accuracy}%
          </p>
          <p className="mt-1 text-xs text-muted">
            {skill.correct}/{skill.attempts} correct
          </p>
          <div className="mt-3">
            <ProgressBar value={skill.accuracy} height="h-1.5" />
          </div>
        </div>

        <div className="card p-5">
          <p className="text-xs text-faint">Where it sits</p>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-faint">Domain</dt>
              <dd className="truncate font-medium">{skill.domainName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
              <dt className="text-faint">Skill set</dt>
              <dd className="truncate font-medium">{skill.skillSetName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
              <dt className="text-faint">Status</dt>
              <dd>
                <SkillStatusBadge status={skill.status} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-5">
          <p className="text-xs text-faint">Why it matters</p>
          <p className="mt-3 font-mono text-2xl font-semibold text-brand">
            {skill.examWeight}%
          </p>
          <p className="mt-1 text-xs text-muted">of the exam is this domain</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-surface-2/50 px-3 py-2 text-xs text-muted">
            <Icon name="gauge" size={14} className="shrink-0 text-faint" />
            {study.headline}
          </div>
        </div>
      </section>

      {/* Lesson video (mock) */}
      <LessonVideo title={skill.skillName} domain={skill.domainName} />

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
