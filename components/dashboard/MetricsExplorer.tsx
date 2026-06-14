"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ReadinessRing } from "@/components/ui/ReadinessRing";
import { SkillStatusBadge } from "@/components/ui/SkillStatusBadge";
import { cn } from "@/components/ui/cn";
import type { SkillStatus } from "@/lib/personalization";

export type MetricAttempt = {
  id: string;
  date: string;
  question: string;
  skillName: string;
  domainName: string;
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
};

export type MetricSkill = {
  skillId: string;
  name: string;
  accuracy: number;
  mastery: number;
  domainName: string;
  status: SkillStatus;
};

export type WeakSkill = MetricSkill & {
  wrong: { question: string; selectedAnswer: string; correctAnswer: string }[];
};

type Metric = "accuracy" | "attempts" | "mastered" | "weak";
type Range = "week" | "month" | "all";

const RANGES: { id: Range; label: string; days: number }[] = [
  { id: "week", label: "Last 7 days", days: 7 },
  { id: "month", label: "Last 30 days", days: 30 },
  { id: "all", label: "All time", days: Infinity },
];

export function MetricsExplorer({
  examReadiness,
  accuracy,
  correct,
  wrong,
  attempts,
  strong,
  weak,
  developing,
  totalSkills,
  referenceIso,
}: {
  examReadiness: number;
  accuracy: number;
  correct: number;
  wrong: number;
  attempts: MetricAttempt[];
  strong: MetricSkill[];
  weak: WeakSkill[];
  developing: number;
  totalSkills: number;
  referenceIso: string | null;
}) {
  const [active, setActive] = useState<Metric>("accuracy");
  const [range, setRange] = useState<Range>("all");

  const refMs = referenceIso ? new Date(referenceIso).getTime() : null;
  const totalAttempts = attempts.length;
  const mastered = strong.length;

  const weekCount = useMemo(
    () => attempts.filter((a) => inRange(a.date, "week", refMs)).length,
    [attempts, refMs],
  );

  const filtered = useMemo(
    () => attempts.filter((a) => inRange(a.date, range, refMs)),
    [attempts, range, refMs],
  );

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="card flex items-center justify-center p-6">
          <ReadinessRing value={examReadiness} />
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            label="Overall accuracy"
            icon="activity"
            active={active === "accuracy"}
            onClick={() => setActive("accuracy")}
          >
            <div className="font-mono text-2xl font-semibold">{accuracy}%</div>
            <div className="mt-3">
              <ProgressBar value={accuracy} height="h-1.5" />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-brand">{correct} correct</span>
              <span className="text-danger">{wrong} wrong</span>
            </div>
          </MetricCard>

          <MetricCard
            label="Questions attempted"
            icon="history"
            active={active === "attempts"}
            onClick={() => setActive("attempts")}
          >
            <div className="font-mono text-2xl font-semibold">
              {totalAttempts}
            </div>
            <p className="mt-3 text-xs text-muted">
              <span className="font-mono text-fg">{weekCount}</span> in last 7
              days
            </p>
            <p className="mt-1 text-xs text-faint">
              across {countSkills(attempts)} skills
            </p>
          </MetricCard>

          <MetricCard
            label="Skills mastered"
            icon="shield"
            active={active === "mastered"}
            onClick={() => setActive("mastered")}
          >
            <div className="font-mono text-2xl font-semibold text-brand">
              {mastered}
              <span className="text-faint">/{totalSkills}</span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={(mastered / Math.max(1, totalSkills)) * 100}
                tone="brand"
                height="h-1.5"
              />
            </div>
            <p className="mt-2 text-xs text-faint">
              {developing} developing · {weak.length} weak
            </p>
          </MetricCard>

          <MetricCard
            label="Weak spots"
            icon="target"
            active={active === "weak"}
            onClick={() => setActive("weak")}
          >
            <div className="font-mono text-2xl font-semibold text-danger">
              {weak.length}
            </div>
            <ul className="mt-3 space-y-1">
              {weak.slice(0, 2).map((w) => (
                <li key={w.skillId} className="truncate text-xs text-muted">
                  {w.name}
                </li>
              ))}
              {weak.length > 2 && (
                <li className="text-xs text-faint">+{weak.length - 2} more</li>
              )}
            </ul>
          </MetricCard>
        </div>
      </div>

      {/* Detail panel */}
      <div className="card overflow-hidden">
        {active === "accuracy" && (
          <Panel
            title="Answer history"
            subtitle={`${rangeCorrect(filtered)}/${filtered.length} correct · ${rangeAccuracy(filtered)}% in this range`}
            range={range}
            onRange={setRange}
            action={<PracticeMore />}
          >
            <AttemptList items={filtered} />
          </Panel>
        )}

        {active === "attempts" && (
          <Panel
            title="Where your attempts went"
            subtitle={`${filtered.length} questions answered in this range`}
            range={range}
            onRange={setRange}
          >
            <DomainBreakdown items={filtered} />
          </Panel>
        )}

        {active === "mastered" && (
          <Panel
            title="Skills you've mastered"
            subtitle={`${strong.length} skills at 80%+ accuracy`}
          >
            {strong.length === 0 ? (
              <Empty>No mastered skills yet — keep practising.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {strong.map((s) => (
                  <li
                    key={s.skillId}
                    className="flex items-center gap-4 px-5 py-3.5 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium">
                          {s.name}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-brand">
                          {s.accuracy}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-faint">
                        {s.domainName}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/study?skill=${s.skillId}`}
                      className="shrink-0 text-xs font-medium text-muted transition-colors hover:text-brand"
                    >
                      Reinforce →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        {active === "weak" && (
          <Panel
            title="Your weak spots"
            subtitle="The answers you got wrong — drill them until they stick"
            action={<PracticeMore />}
          >
            {weak.length === 0 ? (
              <Empty>No weak spots — you&apos;re crushing this exam.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {weak.map((w) => (
                  <li key={w.skillId} className="px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-medium">{w.name}</span>
                        <SkillStatusBadge status={w.status} />
                      </div>
                      <Link
                        href={`/dashboard/study?skill=${w.skillId}`}
                        className="shrink-0 text-xs font-medium text-muted transition-colors hover:text-brand"
                      >
                        Study →
                      </Link>
                    </div>
                    {w.wrong.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {w.wrong.map((m, i) => (
                          <li
                            key={i}
                            className="rounded-lg border border-line bg-surface-2/50 p-3"
                          >
                            <p className="text-sm">{m.question}</p>
                            <p className="mt-1.5 text-xs text-muted">
                              you said{" "}
                              <span className="text-danger">
                                {m.selectedAnswer}
                              </span>{" "}
                              · correct{" "}
                              <span className="text-brand">
                                {m.correctAnswer}
                              </span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- helpers */

function inRange(dateIso: string, range: Range, refMs: number | null): boolean {
  if (range === "all" || refMs === null) return true;
  const days = range === "week" ? 7 : 30;
  return refMs - new Date(dateIso).getTime() <= days * 86_400_000;
}

function countSkills(items: MetricAttempt[]): number {
  return new Set(items.map((a) => a.skillName)).size;
}

function rangeCorrect(items: MetricAttempt[]): number {
  return items.filter((a) => a.isCorrect).length;
}

function rangeAccuracy(items: MetricAttempt[]): number {
  if (items.length === 0) return 0;
  return Math.round((rangeCorrect(items) / items.length) * 100);
}

function MetricCard({
  label,
  icon,
  active,
  onClick,
  children,
}: {
  label: string;
  icon: IconName;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "card card-hover flex h-full flex-col p-5 text-left",
        active && "border-brand/40 bg-brand/[0.04]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-faint">{label}</span>
        <span className={active ? "text-brand" : "text-faint"}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </button>
  );
}

function Panel({
  title,
  subtitle,
  range,
  onRange,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  range?: Range;
  onRange?: (r: Range) => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 border-b border-line bg-surface-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {range && onRange && (
            <div className="flex rounded-lg border border-line bg-bg p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onRange(r.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs transition-colors",
                    range === r.id
                      ? "bg-surface-3 text-fg"
                      : "text-faint hover:text-fg",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
          {action}
        </div>
      </div>
      <div className="max-h-[26rem] overflow-y-auto">{children}</div>
    </>
  );
}

function AttemptList({ items }: { items: MetricAttempt[] }) {
  if (items.length === 0) return <Empty>No answers in this range.</Empty>;
  return (
    <ul className="divide-y divide-line">
      {items.map((a) => (
        <li key={a.id} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
          <span
            className={
              a.isCorrect
                ? "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand"
                : "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-danger/15 text-danger"
            }
          >
            <Icon name={a.isCorrect ? "check" : "x"} size={13} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm">{a.question}</p>
            {!a.isCorrect && (
              <p className="mt-1 text-xs text-muted">
                you said <span className="text-danger">{a.selectedAnswer}</span>{" "}
                · correct <span className="text-brand">{a.correctAnswer}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-faint">
              {a.skillName} · {formatDate(a.date)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DomainBreakdown({ items }: { items: MetricAttempt[] }) {
  const byDomain = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>();
    for (const a of items) {
      const d = map.get(a.domainName) ?? { total: 0, correct: 0 };
      d.total += 1;
      if (a.isCorrect) d.correct += 1;
      map.set(a.domainName, d);
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [items]);

  if (byDomain.length === 0) return <Empty>No attempts in this range.</Empty>;

  return (
    <ul className="space-y-4 p-5 sm:p-6">
      {byDomain.map(([domain, d]) => {
        const acc = Math.round((d.correct / d.total) * 100);
        return (
          <li key={domain}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium">{domain}</span>
              <span className="shrink-0 font-mono text-xs text-faint">
                {d.total} Qs · {acc}%
              </span>
            </div>
            <ProgressBar value={acc} height="h-1.5" />
          </li>
        );
      })}
    </ul>
  );
}

function PracticeMore() {
  return (
    <Button href="/dashboard/quiz?focus=weak" size="sm">
      <Icon name="zap" size={15} />
      Practice more
    </Button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-10 text-center text-sm text-faint">{children}</p>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
