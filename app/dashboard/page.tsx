import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ReadinessRing } from "@/components/ui/ReadinessRing";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillStatusBadge } from "@/components/ui/SkillStatusBadge";
import { buildSnapshot } from "@/lib/personalization";
import { getSession } from "@/lib/session";

export default async function DashboardOverview() {
  const session = await getSession();
  const snapshot = buildSnapshot(session?.userId);
  const study = snapshot.studySession;

  const strongCount = snapshot.skillStats.filter(
    (s) => s.status === "strong",
  ).length;
  const weakCount = snapshot.skillStats.filter(
    (s) => s.status === "weak",
  ).length;

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
        description="Here's where you stand on the exam and the single best thing to study right now."
      >
        <Button href="/dashboard/study">
          Start today&apos;s session
          <Icon name="arrowRight" size={18} />
        </Button>
      </PageHeader>

      {/* Top metrics */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="card flex items-center justify-center p-6">
          <ReadinessRing value={snapshot.examReadiness} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Overall accuracy"
            value={`${snapshot.overallAccuracy}%`}
            hint={`${snapshot.totalCorrect}/${snapshot.totalAttempts} correct`}
          />
          <MetricCard
            label="Questions attempted"
            value={`${snapshot.totalAttempts}`}
            hint="across the blueprint"
          />
          <MetricCard
            label="Strong skills"
            value={`${strongCount}`}
            hint={`of ${snapshot.skillStats.length} mapped`}
            tone="brand"
          />
          <MetricCard
            label="Weak skills"
            value={`${weakCount}`}
            hint="need attention"
            tone="danger"
          />
        </div>
      </div>

      {/* Today's focus highlight */}
      <Link
        href="/dashboard/study"
        className="group card card-hover relative block overflow-hidden p-6 sm:p-7"
      >
        <div className="brand-glow pointer-events-none absolute -right-10 -top-16 h-48 w-72 opacity-60" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow flex items-center gap-1.5">
              <Icon name="sparkles" size={13} /> Today&apos;s focus
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {study.skill.skillName}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {study.reason}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SkillStatusBadge status={study.skill.status} />
              <Badge mono tone="neutral">
                {study.skill.domainName}
              </Badge>
              <Badge mono tone="neutral">
                {study.skill.examWeight}% of exam
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-brand">
            Open session
            <Icon
              name="arrowRight"
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </Link>

      {/* Weakest skills + domains */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Weakest skills</h3>
            <Link
              href="/dashboard/curriculum"
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              View all →
            </Link>
          </div>
          <ul className="space-y-4">
            {snapshot.weakestSkills.slice(0, 5).map((s) => (
              <li key={s.skillId}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">
                    {s.skillName}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-faint">
                    {s.correct}/{s.attempts} · {s.accuracy}%
                  </span>
                </div>
                <ProgressBar value={s.mastery} height="h-1.5" />
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Domain breakdown</h3>
            <span className="font-mono text-xs text-faint">exam-weighted</span>
          </div>
          <ul className="space-y-4">
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
        </section>
      </div>

      {/* Recent attempts */}
      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-semibold">Recent attempts</h3>
          <Link
            href="/dashboard/attempts"
            className="text-sm text-muted transition-colors hover:text-fg"
          >
            Full history →
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {snapshot.recentAttempts.slice(0, 6).map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              <span
                className={
                  a.isCorrect
                    ? "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/15 text-brand"
                    : "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-danger/15 text-danger"
                }
              >
                <Icon name={a.isCorrect ? "check" : "x"} size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg">{a.question.question}</p>
                <p className="truncate text-xs text-faint">{a.skillName}</p>
              </div>
              <span className="hidden shrink-0 font-mono text-xs text-faint sm:block">
                {new Date(a.answeredAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "brand" | "danger";
}) {
  const valueColor =
    tone === "brand"
      ? "text-brand"
      : tone === "danger"
        ? "text-danger"
        : "text-fg";
  return (
    <div className="card p-5">
      <p className="text-xs text-faint">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-semibold ${valueColor}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
