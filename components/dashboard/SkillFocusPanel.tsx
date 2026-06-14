"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillStatusBadge } from "@/components/ui/SkillStatusBadge";
import { cn } from "@/components/ui/cn";
import type { SkillStat } from "@/lib/personalization";

type Mode = "weak" | "strong";

const COPY: Record<
  Mode,
  {
    icon: IconName;
    toggleTitle: string;
    toggleSub: string;
    heroTag: string;
    heroSubtitle: string;
    cta: string;
    empty: string;
  }
> = {
  weak: {
    icon: "target",
    toggleTitle: "Strengthen weak spots",
    toggleSub: "skills below 80%",
    heroTag: "Recommended",
    heroSubtitle: "Your biggest score lever right now",
    cta: "Start session",
    empty: "No weak skills left — you're crushing this exam.",
  },
  strong: {
    icon: "star",
    toggleTitle: "Sharpen your strengths",
    toggleSub: "strong skills",
    heroTag: "Top strength",
    heroSubtitle: "Keep these easy marks locked in",
    cta: "Reinforce it",
    empty: "No strong skills yet — every skill is still a work in progress.",
  },
};

export function SkillFocusPanel({
  weak,
  strong,
}: {
  weak: SkillStat[];
  strong: SkillStat[];
}) {
  const [mode, setMode] = useState<Mode>("weak");
  const list = mode === "weak" ? weak : strong;
  const copy = COPY[mode];
  const hero = list[0];
  const rest = list.slice(1);

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold">What do you want to work on?</h3>
        <p className="mt-1 text-sm text-muted">
          Fix a gap, or push a strength even higher — pick a path, then a skill.
        </p>
      </div>

      {/* Tappable Weak / Strong toggle */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleCard
          active={mode === "weak"}
          onClick={() => setMode("weak")}
          icon={COPY.weak.icon}
          title={COPY.weak.toggleTitle}
          sub={COPY.weak.toggleSub}
          count={weak.length}
        />
        <ToggleCard
          active={mode === "strong"}
          onClick={() => setMode("strong")}
          icon={COPY.strong.icon}
          title={COPY.strong.toggleTitle}
          sub={COPY.strong.toggleSub}
          count={strong.length}
        />
      </div>

      {/* Active list */}
      <div className="mt-4 space-y-3">
        {hero ? (
          <HeroSkill skill={hero} mode={mode} copy={copy} />
        ) : (
          <div className="card p-6 text-center text-sm text-muted">
            {copy.empty}
          </div>
        )}

        {rest.length > 0 && (
          <ul className="card divide-y divide-line overflow-hidden">
            {rest.map((s) => (
              <SkillRow key={s.skillId} skill={s} cta={copy.cta} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ToggleCard({
  active,
  onClick,
  icon,
  title,
  sub,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: IconName;
  title: string;
  sub: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-brand/40 bg-brand/[0.06]"
          : "border-line bg-surface hover:border-line-strong hover:bg-surface-2",
      )}
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
          active ? "bg-brand/15 text-brand" : "bg-surface-2 text-muted",
        )}
      >
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              active ? "text-fg" : "text-muted",
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "font-mono text-sm",
              active ? "text-brand" : "text-faint",
            )}
          >
            {count}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-faint">{sub}</p>
      </div>
    </button>
  );
}

function HeroSkill({
  skill,
  mode,
  copy,
}: {
  skill: SkillStat;
  mode: Mode;
  copy: (typeof COPY)[Mode];
}) {
  // In the "weak" path the top pick is the engine's ROI recommendation, so the
  // framing changes depending on whether it's a quick win or a deep gap.
  const isQuickWin = mode === "weak" && skill.status === "developing";
  const heroTag = isQuickWin ? "Quick win" : copy.heroTag;
  const heroSubtitle = isQuickWin
    ? `Push ${skill.accuracy}% to exam-safe — your fastest route to a pass`
    : copy.heroSubtitle;

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="brand-glow pointer-events-none absolute -right-10 -top-16 h-44 w-64 opacity-50" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" mono>
              {heroTag}
            </Badge>
            <SkillStatusBadge status={skill.status} />
          </div>
          <h4 className="mt-3 text-lg font-semibold">{skill.skillName}</h4>
          <p className="mt-1 text-sm text-muted">
            {heroSubtitle} · {skill.domainName}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar value={skill.mastery} className="max-w-56" />
            <span className="shrink-0 font-mono text-xs text-faint">
              {skill.correct}/{skill.attempts} · {skill.accuracy}%
            </span>
          </div>
        </div>
        <Button href={`/dashboard/study?skill=${skill.skillId}`}>
          {copy.cta}
          <Icon name="arrowRight" size={18} />
        </Button>
      </div>
    </div>
  );
}

function SkillRow({ skill, cta }: { skill: SkillStat; cta: string }) {
  return (
    <li>
      <Link
        href={`/dashboard/study?skill=${skill.skillId}`}
        className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-medium">
              {skill.skillName}
            </span>
            <SkillStatusBadge status={skill.status} />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <ProgressBar value={skill.mastery} height="h-1.5" />
            <span className="shrink-0 font-mono text-xs text-faint">
              {skill.accuracy}%
            </span>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-muted transition-colors group-hover:text-brand sm:flex">
          {cta}
          <Icon
            name="arrowRight"
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </li>
  );
}
