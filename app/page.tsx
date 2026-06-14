import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ReadinessRing } from "@/components/ui/ReadinessRing";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillStatusBadge } from "@/components/ui/SkillStatusBadge";
import { buildCurriculum, buildSnapshot } from "@/lib/personalization";
import { generateMock } from "@/lib/ai/provider";

export default function LandingPage() {
  const snapshot = buildSnapshot();
  const curriculum = buildCurriculum(snapshot);
  const session = snapshot.studySession;
  const ai = generateMock({
    skillId: session.skill.skillId,
    skillName: session.skill.skillName,
    skillSetName: session.skill.skillSetName,
    domainName: session.skill.domainName,
    accuracy: session.skill.accuracy,
    attempts: session.skill.attempts,
    examWeight: session.skill.examWeight,
  });
  const topWeak = snapshot.weakestSkills.slice(0, 3);

  return (
    <>
      <SiteNav />
      <main className="flex-1">
        {/* ---------------------------------------------------------- Hero */}
        <section className="relative overflow-hidden">
          <div className="bg-grid pointer-events-none absolute inset-0" />
          <div className="brand-glow pointer-events-none absolute left-1/2 top-[-6rem] h-[28rem] w-[42rem] -translate-x-1/2" />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
            <div className="animate-fade-up">
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                <span className="text-gradient">The cloud cert exam is</span>
                <br />
                <span className="text-gradient">its own beast.</span>{" "}
                <span className="text-brand">Train exactly</span>
                <br className="hidden sm:block" />{" "}
                <span className="text-brand">where you&apos;re weak.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Adept maps the AWS Certified Cloud Practitioner exam down to the
                individual skill, finds the gaps costing you the most marks, and
                builds today&apos;s study session around them — lesson,
                flashcards, and a 5-question check. Stop re-reading what you
                already know.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href="/login" size="lg">
                  Start training free
                  <Icon name="arrowRight" size={18} />
                </Button>
                <Button href="#how" variant="secondary" size="lg">
                  See how it works
                </Button>
              </div>
              <p className="mt-4 font-mono text-xs text-faint">
                No card required · one-click demo sign-in
              </p>
            </div>

            {/* Product preview */}
            <div className="animate-fade-up [animation-delay:120ms]">
              <HeroPreview
                readiness={snapshot.examReadiness}
                accuracy={snapshot.overallAccuracy}
                attempts={snapshot.totalAttempts}
                skillName={session.skill.skillName}
                domainName={session.skill.domainName}
                weakest={topWeak.map((s) => ({
                  name: s.skillName,
                  mastery: s.mastery,
                  accuracy: s.accuracy,
                }))}
              />
            </div>
          </div>
        </section>

        {/* ----------------------------------------------- Social proof band */}
        <section className="border-y border-line bg-surface/30">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 text-center">
            <p className="eyebrow">Mapped to the official CLF-C02 blueprint</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-sm text-faint">
              <span className="text-fg/80">AWS Cloud Practitioner</span>
              <span>AWS Solutions Architect</span>
              <span>Azure Fundamentals</span>
              <span>Google ACE</span>
              <span>CompTIA Cloud+</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ Stats band */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            <Stat value={`${curriculum.length}`} label="Exam domains" />
            <Stat value={`${snapshot.skillStats.length}`} label="Skills mapped" />
            <Stat value="<1s" label="To today's session" />
            <Stat value="100%" label="Exam-weighted scoring" />
          </div>
        </section>

        {/* -------------------------------------------------------- Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
          <SectionHeading
            eyebrow="What it does"
            title="A personalisation engine, not another question bank"
            subtitle="Every part of Adept exists to answer one question: what is the single best thing for you to study right now?"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------- How it works */}
        <section id="how" className="scroll-mt-20 border-y border-line bg-surface/30">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <SectionHeading
              eyebrow="How it works"
              title="Three steps, every day"
              subtitle="The loop is deliberately short so you can run it daily without thinking about what to do next."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <Step key={s.title} index={i + 1} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- Curriculum */}
        <section id="curriculum" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
          <SectionHeading
            eyebrow="Curriculum"
            title="The whole exam, structured"
            subtitle="Certification → domain → skill set → skill. Adept tracks your mastery at the leaf level and rolls it up to a readiness score."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {curriculum.map((domain) => (
              <div
                key={domain.id}
                className="card card-hover flex flex-col p-5"
              >
                <div className="flex items-start justify-between">
                  <Badge mono tone="neutral">
                    {domain.examWeight}% of exam
                  </Badge>
                  <span className="font-mono text-xs text-faint">
                    {domain.skillSets.reduce(
                      (n, ss) => n + ss.skills.length,
                      0,
                    )}{" "}
                    skills
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug">
                  {domain.name}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  {domain.skillSets.slice(0, 3).map((ss) => (
                    <li key={ss.id} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-faint" />
                      {ss.name}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-faint">
                    <span>Your accuracy</span>
                    <span className="font-mono">{domain.accuracy}%</span>
                  </div>
                  <ProgressBar value={domain.accuracy} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------- Session showcase */}
        <section className="border-y border-line bg-surface/30">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <SectionHeading
              eyebrow="Today's study session"
              title="A real session, generated from the demo data"
              subtitle="This is exactly what a learner sees after signing in — built live from the personalisation engine, not a screenshot."
            />
            <div className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-brand">
                      <Icon name="target" size={18} />
                    </span>
                    <div>
                      <p className="eyebrow">Recommended focus</p>
                      <p className="text-sm font-semibold">
                        {session.skill.skillName}
                      </p>
                    </div>
                  </div>
                  <SkillStatusBadge status={session.skill.status} />
                </div>
                <div className="space-y-5 p-6">
                  <div>
                    <p className="eyebrow mb-2 flex items-center gap-1.5">
                      <Icon name="sparkles" size={13} /> AI lesson summary
                    </p>
                    <p className="text-sm leading-relaxed text-muted">
                      {ai.lessonSummary}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow mb-2 flex items-center gap-1.5">
                      <Icon name="cards" size={13} /> Flashcard
                    </p>
                    <div className="rounded-xl border border-line bg-surface-2 p-4">
                      <p className="text-sm font-medium">
                        {ai.flashcards[0].front}
                      </p>
                      <p className="mt-2 text-sm text-brand">
                        {ai.flashcards[0].back}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card flex flex-col p-6">
                <p className="eyebrow mb-2 flex items-center gap-1.5">
                  <Icon name="list" size={13} /> 5-question check
                </p>
                <ol className="space-y-2.5">
                  {session.quizPlan.map((q, i) => (
                    <li key={q.id} className="flex gap-3 text-sm">
                      <span className="font-mono text-xs text-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-muted">{q.question}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-auto pt-6">
                  <Button href="/login" className="w-full">
                    Get your session
                    <Icon name="arrowRight" size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Upgrade when you're cramming."
            subtitle="This is a demo — every plan's button just drops you straight into the product."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {tiers.map((t) => (
              <PriceTier key={t.name} {...t} />
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ Final CTA */}
        <section className="relative overflow-hidden border-t border-line">
          <div className="brand-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-[40rem] -translate-x-1/2 -translate-y-1/2" />
          <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Stop studying everything.
              <br />
              <span className="text-brand">Start studying what&apos;s wrong.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-muted">
              See your weakest skills and today&apos;s session in under a second.
              No setup, no card — just press the button.
            </p>
            <div className="mt-8 flex justify-center">
              <Button href="/login" size="lg">
                Open the demo
                <Icon name="arrowRight" size={18} />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/* ------------------------------------------------------------- Sub-components */

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 text-muted">{subtitle}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-bg px-6 py-7">
      <div className="font-mono text-3xl font-semibold tracking-tight text-fg">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}

const features: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "layers",
    title: "Skill-level mapping",
    body: "Every question is tagged to a skill, skill set, and domain — so progress is tracked at the leaf, not just the topic.",
  },
  {
    icon: "target",
    title: "Weakness detection",
    body: "We rank your weakest skills by accuracy, how much evidence backs it, and the domain's exam weight.",
  },
  {
    icon: "zap",
    title: "Today's session",
    body: "One focused plan a day: the skill to fix, why it was chosen, and exactly what to do about it.",
  },
  {
    icon: "sparkles",
    title: "AI micro-lessons",
    body: "Generated lesson summaries, flashcards, and remediation tips tuned to the skill you're failing.",
  },
  {
    icon: "cards",
    title: "Targeted quiz checks",
    body: "A 5-question plan that starts at your weak skill and expands outward through its skill set and domain.",
  },
  {
    icon: "gauge",
    title: "Exam readiness score",
    body: "An exam-weighted readiness percentage so you know when you're actually ready to book the test.",
  },
];

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: IconName;
  title: string;
  body: string;
}) {
  return (
    <div className="card card-hover p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface-2 text-brand">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

const steps: { title: string; body: string; icon: IconName }[] = [
  {
    icon: "history",
    title: "Attempt",
    body: "Answer questions across the full blueprint. Every attempt is recorded against the exact skill it tests.",
  },
  {
    icon: "target",
    title: "Diagnose",
    body: "The engine scores each skill and surfaces where your marks are leaking — weighted by what the exam cares about.",
  },
  {
    icon: "sparkles",
    title: "Personalise",
    body: "Get a session built for that gap: an AI lesson, flashcards, and a 5-question check. Re-test, watch readiness climb.",
  },
];

function Step({
  index,
  title,
  body,
  icon,
}: {
  index: number;
  title: string;
  body: string;
  icon: IconName;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-faint">0{index}</span>
        <span className="text-brand">
          <Icon name={icon} size={20} />
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function HeroPreview({
  readiness,
  accuracy,
  attempts,
  skillName,
  domainName,
  weakest,
}: {
  readiness: number;
  accuracy: number;
  attempts: number;
  skillName: string;
  domainName: string;
  weakest: { name: string; mastery: number; accuracy: number }[];
}) {
  return (
    <div className="card relative overflow-hidden p-1.5 shadow-2xl">
      <div className="rounded-[0.85rem] border border-line bg-surface-2/60">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 font-mono text-xs text-faint">
            adept.app/dashboard
          </span>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex justify-center">
            <ReadinessRing value={readiness} size={128} />
          </div>
          <div>
            <p className="eyebrow">Today&apos;s focus</p>
            <p className="mt-1 text-lg font-semibold">{skillName}</p>
            <p className="text-sm text-muted">{domainName}</p>
            <div className="mt-3 flex gap-4 font-mono text-xs text-faint">
              <span>{attempts} attempts</span>
              <span>{accuracy}% overall</span>
            </div>
          </div>
        </div>
        <div className="space-y-3 border-t border-line p-5">
          <p className="eyebrow">Weakest skills</p>
          {weakest.map((s) => (
            <div key={s.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted">{s.name}</span>
                <span className="font-mono text-xs text-faint">
                  {s.accuracy}%
                </span>
              </div>
              <ProgressBar value={s.mastery} height="h-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const tiers: {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  popular?: boolean;
  cta: string;
}[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    blurb: "Everything you need to fix one certification.",
    features: [
      "1 certification track",
      "Daily personalised session",
      "Mock-AI lessons & flashcards",
      "Exam readiness score",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    blurb: "For people with an exam booked.",
    features: [
      "All certification tracks",
      "Unlimited sessions & quizzes",
      "Real AI lessons (bring your key)",
      "Spaced repetition scheduling",
      "Priority readiness insights",
    ],
    popular: true,
    cta: "Go Pro",
  },
  {
    name: "Team",
    price: "$49",
    cadence: "per seat / mo",
    blurb: "Train a whole cohort to certification.",
    features: [
      "Everything in Pro",
      "Cohort & manager analytics",
      "Shared skill heatmaps",
      "Admin & SSO (mock)",
    ],
    cta: "Talk to us",
  },
];

function PriceTier({
  name,
  price,
  cadence,
  blurb,
  features,
  popular,
  cta,
}: (typeof tiers)[number]) {
  return (
    <div
      className={
        popular
          ? "relative rounded-2xl border border-brand/40 bg-surface p-7 shadow-[0_0_60px_-20px_color-mix(in_oklab,var(--color-brand)_45%,transparent)]"
          : "card p-7"
      }
    >
      {popular && (
        <div className="absolute -top-3 left-7">
          <span className="inline-flex items-center rounded-full bg-brand px-3 py-1 text-xs font-semibold tracking-wide text-bg shadow-sm">
            Most popular
          </span>
        </div>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted">{blurb}</p>
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-mono text-4xl font-semibold tracking-tight">
          {price}
        </span>
        <span className="text-sm text-faint">{cadence}</span>
      </div>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
            <span className="mt-0.5 text-brand">
              <Icon name="check" size={16} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-7">
        <Button
          href="/login"
          variant={popular ? "primary" : "secondary"}
          className="w-full"
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}
