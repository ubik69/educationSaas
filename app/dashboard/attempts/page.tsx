import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { buildSnapshot } from "@/lib/personalization";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Attempt history",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AttemptsPage() {
  const session = await getSession();
  const snapshot = buildSnapshot(session?.userId);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow="Activity"
        title="Attempt history"
        description="Every recorded answer, newest first. This is the raw signal the personalisation engine reads to find your weak skills."
      >
        <Badge mono tone="neutral">
          {snapshot.totalCorrect}/{snapshot.totalAttempts} correct ·{" "}
          {snapshot.overallAccuracy}%
        </Badge>
      </PageHeader>

      <div className="card overflow-hidden">
        {/* table header (desktop) */}
        <div className="hidden grid-cols-[2.5rem_1fr_12rem_8rem] gap-4 border-b border-line bg-surface-2 px-6 py-3 text-xs font-medium uppercase tracking-wide text-faint md:grid">
          <span />
          <span>Question</span>
          <span>Skill</span>
          <span className="text-right">Answered</span>
        </div>

        <ul className="divide-y divide-line">
          {snapshot.recentAttempts.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-[2rem_1fr] items-start gap-4 px-5 py-4 md:grid-cols-[2.5rem_1fr_12rem_8rem] md:items-center md:px-6"
            >
              <span
                className={
                  a.isCorrect
                    ? "grid h-7 w-7 place-items-center rounded-full bg-brand/15 text-brand"
                    : "grid h-7 w-7 place-items-center rounded-full bg-danger/15 text-danger"
                }
              >
                <Icon name={a.isCorrect ? "check" : "x"} size={14} />
              </span>

              <div className="min-w-0">
                <p className="text-sm text-fg">{a.question.question}</p>
                {!a.isCorrect && (
                  <p className="mt-1 text-xs text-muted">
                    You answered{" "}
                    <span className="text-danger">{a.selectedAnswer}</span> ·
                    correct{" "}
                    <span className="text-brand">
                      {a.question.correctAnswer}
                    </span>
                  </p>
                )}
                {/* skill + date inline on mobile */}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint md:hidden">
                  <span>{a.skillName}</span>
                  <span className="font-mono">{formatDate(a.answeredAt)}</span>
                </div>
              </div>

              <span className="hidden truncate text-sm text-muted md:block">
                {a.skillName}
              </span>
              <span className="hidden text-right font-mono text-xs text-faint md:block">
                {formatDate(a.answeredAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
