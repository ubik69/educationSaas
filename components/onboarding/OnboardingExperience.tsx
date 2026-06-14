"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { SkillGraph, type GraphPoint } from "./SkillGraph";
import {
  labelForLevel,
  onboardingSkills,
  skillColor,
  SELF_RATINGS_STORAGE_KEY,
  type SelfRatings,
} from "@/lib/onboarding";
import { saveSelfRatings } from "@/app/onboarding/actions";

type Phase = "rate" | "reveal" | "trial";
const DEFAULT_LEVEL = 5;

export function OnboardingExperience() {
  const router = useRouter();
  const total = onboardingSkills.length;

  const [phase, setPhase] = useState<Phase>("rate");
  const [index, setIndex] = useState(0);
  const [ratings, setRatings] = useState<SelfRatings>({});
  const [revealStage, setRevealStage] = useState(0); // 0 line, 1 headline, 2 cta

  // Prefill from a previous run (redo onboarding) or start at the default.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SELF_RATINGS_STORAGE_KEY);
      if (raw) setRatings(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const current = onboardingSkills[index];
  const level = ratings[current.skillId] ?? DEFAULT_LEVEL;
  const meta = labelForLevel(level);
  const isLast = index === total - 1;

  // Dots accumulate as you advance; the current one moves live with the slider.
  const points: GraphPoint[] = useMemo(
    () =>
      onboardingSkills.slice(0, index + 1).map((s, i) => ({
        skillId: s.skillId,
        name: s.name,
        level: ratings[s.skillId] ?? DEFAULT_LEVEL,
        order: i + 1,
      })),
    [index, ratings],
  );

  const allPoints: GraphPoint[] = useMemo(
    () =>
      onboardingSkills.map((s, i) => ({
        skillId: s.skillId,
        name: s.name,
        level: ratings[s.skillId] ?? DEFAULT_LEVEL,
        order: i + 1,
      })),
    [ratings],
  );

  function setLevel(value: number) {
    setRatings((prev) => ({ ...prev, [current.skillId]: value }));
  }

  async function finish() {
    // Make sure every skill has a value (default any never-touched ones).
    const complete: SelfRatings = {};
    for (const s of onboardingSkills) {
      complete[s.skillId] = ratings[s.skillId] ?? DEFAULT_LEVEL;
    }
    setRatings(complete);
    try {
      localStorage.setItem(SELF_RATINGS_STORAGE_KEY, JSON.stringify(complete));
    } catch {
      /* ignore */
    }
    await saveSelfRatings(JSON.stringify(complete));
    setPhase("reveal");
  }

  function next() {
    if (isLast) void finish();
    else setIndex((i) => i + 1);
  }

  // Stage the reveal: line sweeps, then headline, then the CTA.
  useEffect(() => {
    if (phase !== "reveal") return;
    const t1 = setTimeout(() => setRevealStage(1), 1400);
    const t2 = setTimeout(() => setRevealStage(2), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  const avg =
    Math.round(
      (Object.values(allPoints).reduce((n, p) => n + p.level, 0) / total) * 10,
    ) / 10;

  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Logo />
        {phase === "rate" && (
          <span className="font-mono text-xs text-faint">
            Step {index + 1} of {total}
          </span>
        )}
      </header>

      {phase === "rate" && (
        <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-5 pb-12 lg:grid-cols-[1fr_0.85fr]">
          {/* Rating card */}
          <div className="animate-fade-up">
            <Badge tone="brand" dot mono>
              Onboarding · set your starting point
            </Badge>
            <p className="mt-5 text-xs text-faint">{current.domainName}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              How good are you at{" "}
              <span className="text-brand">{current.name}</span>?
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              Be honest — this is your starting point. It tells our engine where
              to look first, so you get useful recommendations before answering a
              single question.
            </p>

            {/* Big live level + label */}
            <div className="mt-8 flex items-end gap-4">
              <span
                className="font-mono text-6xl font-semibold leading-none"
                style={{ color: skillColor(index, total) }}
              >
                {level}
              </span>
              <div className="pb-1">
                <p className="text-lg font-semibold">{meta.label}</p>
                <p className="text-sm text-muted">{meta.blurb}</p>
              </div>
            </div>

            {/* Slider */}
            <div className="mt-6">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                aria-label={`Your level at ${current.name}, 0 to 10`}
                className="adept-range w-full"
                style={
                  {
                    color: skillColor(index, total),
                    "--fill": `${level * 10}%`,
                  } as CSSProperties
                }
              />
              <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-faint">
                <span>0 · new</span>
                <span>5</span>
                <span>10 · expert</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
              >
                Back
              </Button>
              <Button onClick={next}>
                {isLast ? "See my plan" : "Next skill"}
                <Icon name="arrowRight" size={18} />
              </Button>
            </div>
          </div>

          {/* Live graph */}
          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="card p-4">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="eyebrow">Your skill map</p>
                <span className="font-mono text-xs text-faint">
                  {points.length}/{total} rated
                </span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                <SkillGraph
                  points={points}
                  total={total}
                  activeOrder={index + 1}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "reveal" && (
        <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-5 pb-12 lg:grid-cols-[0.85fr_1fr]">
          <div>
            <div
              className={cn(
                "transition-all duration-700",
                revealStage >= 1
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0",
              )}
            >
              <Badge tone="brand" dot mono>
                Your baseline is set
              </Badge>
              <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                WE CAN GET YOU
                <br />
                <span className="text-brand">WAY BETTER</span> IN LESS
                <br />
                THAN 4 WEEKS.
              </h1>
              <p className="mt-4 max-w-md text-muted">
                You rated yourself{" "}
                <span className="font-mono text-fg">{avg}/10</span> on average.
                Our engine already knows which skills to push first — no
                50-question warm-up required.
              </p>
            </div>
            <div
              className={cn(
                "mt-8 transition-all duration-700",
                revealStage >= 2
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0",
              )}
            >
              <Button size="lg" onClick={() => setPhase("trial")}>
                Continue
                <Icon name="arrowRight" size={18} />
              </Button>
            </div>
          </div>

          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="eyebrow">Your skill map</p>
              <span className="font-mono text-xs text-brand">
                projected path ↗
              </span>
            </div>
            <div className="max-h-[64vh] overflow-y-auto">
              <SkillGraph points={allPoints} total={total} sweep />
            </div>
          </div>
        </div>
      )}

      {phase === "trial" && (
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-16">
          <div className="brand-glow pointer-events-none absolute top-10 h-72 w-[34rem]" />
          <div className="card relative w-full p-7 text-center shadow-2xl sm:p-8">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand/15 text-brand">
              <Icon name="star" size={24} />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              Start your free trial
            </h2>
            <p className="mt-2 text-sm text-muted">
              14 days of unlimited personalised sessions, built on the baseline
              you just set. No card required — this is a demo.
            </p>
            <div className="mt-6 space-y-2.5 text-left">
              {[
                "Personalised recommendations from day one",
                "AI lessons, flashcards & targeted quizzes",
                "Exam-readiness tracking as you improve",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-brand/15 text-brand">
                    <Icon name="check" size={13} />
                  </span>
                  <span className="text-muted">{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 space-y-2.5">
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Start free trial
                <Icon name="arrowRight" size={18} />
              </Button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full py-1 text-sm text-faint transition-colors hover:text-muted"
              >
                Skip — just take me in
              </button>
            </div>
          </div>
          <p className="relative mt-4 font-mono text-xs text-faint">
            mock checkout · no payment is taken
          </p>
        </div>
      )}
    </main>
  );
}
