"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import type { GeneratedStudyContent } from "@/lib/ai/provider";

type Props = {
  skillId: string;
  initial: GeneratedStudyContent;
};

export function AiStudyContent({ skillId, initial }: Props) {
  const [content, setContent] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function regenerate() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ai/study-session?skillId=${encodeURIComponent(skillId)}&t=${Date.now()}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      setContent(data.content as GeneratedStudyContent);
    } catch {
      // keep existing content on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Lesson summary */}
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-brand">
              <Icon name="sparkles" size={18} />
            </span>
            <div>
              <p className="eyebrow">AI lesson summary</p>
              <p className="font-mono text-xs text-faint">
                {content.provider} · {content.model}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={regenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-3 px-3 py-1.5 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-60"
          >
            <Icon
              name="sparkles"
              size={15}
              className={loading ? "animate-pulse" : ""}
            />
            {loading ? "Generating…" : "Regenerate"}
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <SkeletonLines />
          ) : (
            <p className="leading-relaxed text-muted">{content.lessonSummary}</p>
          )}

          {/* Remediation callout */}
          <div className="mt-5 flex gap-3 rounded-xl border border-brand/25 bg-brand/[0.06] p-4">
            <span className="mt-0.5 shrink-0 text-brand">
              <Icon name="target" size={18} />
            </span>
            <div>
              <p className="text-sm font-medium text-fg">How to fix it</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {loading ? "…" : content.remediation}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flashcards */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow flex items-center gap-1.5">
            <Icon name="cards" size={13} /> Flashcards
          </p>
          <span className="font-mono text-xs text-faint">
            tap a card to flip
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {content.flashcards.map((card, i) => (
            <Flashcard key={`${card.front}-${i}`} front={card.front} back={card.back} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-2.5">
      {["w-[92%]", "w-full", "w-[84%]", "w-[70%]"].map((w) => (
        <div
          key={w}
          className={cn("shimmer h-3.5 rounded bg-white/[0.06]", w)}
        />
      ))}
    </div>
  );
}

function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="group h-40 w-full text-left [perspective:1000px]"
      aria-pressed={flipped}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-line bg-surface p-4 [backface-visibility:hidden]">
          <span className="eyebrow">Question</span>
          <p className="text-sm font-medium leading-snug">{front}</p>
          <span className="font-mono text-[0.65rem] text-faint">flip →</span>
        </div>
        {/* Back */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-brand/30 bg-brand/[0.07] p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="eyebrow text-brand/80">Answer</span>
          <p className="text-sm leading-snug text-fg">{back}</p>
          <span className="font-mono text-[0.65rem] text-faint">← flip back</span>
        </div>
      </div>
    </button>
  );
}
