import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SkillFocusPanel } from "@/components/dashboard/SkillFocusPanel";
import {
  MetricsExplorer,
  type MetricAttempt,
  type MetricSkill,
  type WeakSkill,
} from "@/components/dashboard/MetricsExplorer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buildSnapshot } from "@/lib/personalization";
import { getSession } from "@/lib/session";

export default async function DashboardOverview() {
  const session = await getSession();
  const snapshot = buildSnapshot(session?.userId);

  // Groups for the focus panel.
  const strongStats = snapshot.skillStats
    .filter((s) => s.status === "strong")
    .sort((a, b) => b.accuracy - a.accuracy || b.mastery - a.mastery);
  const needsWork = snapshot.recommendedSkills; // ROI-ranked: quick wins first
  const developingCount = snapshot.skillStats.filter(
    (s) => s.status === "developing",
  ).length;

  // Data for the pressable metrics explorer.
  const metricAttempts: MetricAttempt[] = snapshot.recentAttempts.map((a) => ({
    id: a.id,
    date: a.answeredAt,
    question: a.question.question,
    skillName: a.skillName,
    domainName: a.domainName,
    isCorrect: a.isCorrect,
    selectedAnswer: a.selectedAnswer,
    correctAnswer: a.question.correctAnswer,
  }));

  const strongSkills: MetricSkill[] = strongStats.map((s) => ({
    skillId: s.skillId,
    name: s.skillName,
    accuracy: s.accuracy,
    mastery: s.mastery,
    domainName: s.domainName,
    status: s.status,
  }));

  const weakSkills: WeakSkill[] = snapshot.weakestSkills
    .filter((s) => s.status !== "strong")
    .map((s) => ({
      skillId: s.skillId,
      name: s.skillName,
      accuracy: s.accuracy,
      mastery: s.mastery,
      domainName: s.domainName,
      status: s.status,
      wrong: snapshot.recentAttempts
        .filter((a) => a.question.skillId === s.skillId && !a.isCorrect)
        .map((a) => ({
          question: a.question.question,
          selectedAnswer: a.selectedAnswer,
          correctAnswer: a.question.correctAnswer,
        })),
    }));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow={`${snapshot.certificationName} · ${snapshot.certificationCode}`}
        title={
          <>
            Welcome back, {session?.name?.split(" ")[0] ?? "there"}
            <span className="text-brand">.</span>
          </>
        }
        description="Tap any tile to dig into your data, then choose how you want to study below."
      />

      {/* Pressable metrics + detail panel */}
      <MetricsExplorer
        examReadiness={snapshot.examReadiness}
        accuracy={snapshot.overallAccuracy}
        correct={snapshot.totalCorrect}
        wrong={snapshot.totalAttempts - snapshot.totalCorrect}
        attempts={metricAttempts}
        strong={strongSkills}
        weak={weakSkills}
        developing={developingCount}
        totalSkills={snapshot.skillStats.length}
        referenceIso={snapshot.lastActivityAt}
      />

      {/* The single decision point: weak vs strong, then a skill */}
      <SkillFocusPanel weak={needsWork} strong={strongStats} />

      {/* Domain breakdown */}
      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-semibold">Domain breakdown</h3>
          <span className="font-mono text-xs text-faint">exam-weighted</span>
        </div>
        <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {snapshot.domainStats.map((d) => (
            <li key={d.domainId}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium">
                  {d.domainName}
                </span>
                <span className="shrink-0 font-mono text-xs text-faint">
                  {d.examWeight}% · {d.accuracy}%
                </span>
              </div>
              <ProgressBar value={d.accuracy} height="h-1.5" />
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard/curriculum"
          className="mt-5 inline-flex text-sm text-muted transition-colors hover:text-fg"
        >
          View full curriculum →
        </Link>
      </section>
    </div>
  );
}
