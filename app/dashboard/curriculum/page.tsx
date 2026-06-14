import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillStatusBadge } from "@/components/ui/SkillStatusBadge";
import { buildCurriculum, buildSnapshot } from "@/lib/personalization";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Curriculum",
};

export default async function CurriculumPage() {
  const session = await getSession();
  const snapshot = buildSnapshot(session?.userId);
  const curriculum = buildCurriculum(snapshot);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow={`${snapshot.certificationName} · ${snapshot.certificationCode}`}
        title="Curriculum"
        description="The full exam blueprint, from domain down to skill. Mastery is tracked at the skill level and rolled up into your readiness score."
      >
        <Badge mono tone="neutral">
          {snapshot.skillStats.length} skills · {curriculum.length} domains
        </Badge>
      </PageHeader>

      <div className="space-y-5">
        {curriculum.map((domain) => (
          <section key={domain.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface-2 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">{domain.name}</h2>
                <p className="mt-0.5 font-mono text-xs text-faint">
                  {domain.skillSets.length} skill sets ·{" "}
                  {domain.skillSets.reduce((n, ss) => n + ss.skills.length, 0)}{" "}
                  skills
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge mono tone="neutral">
                  {domain.examWeight}% of exam
                </Badge>
                <div className="w-28">
                  <div className="mb-1 flex justify-between text-xs text-faint">
                    <span>acc</span>
                    <span className="font-mono">{domain.accuracy}%</span>
                  </div>
                  <ProgressBar value={domain.accuracy} height="h-1.5" />
                </div>
              </div>
            </div>

            <div className="divide-y divide-line">
              {domain.skillSets.map((skillSet) => (
                <div key={skillSet.id} className="px-6 py-5">
                  <p className="eyebrow mb-3">{skillSet.name}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {skillSet.skills.map((skill) => (
                      <div
                        key={skill.skillId}
                        className="rounded-xl border border-line bg-surface-2/50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium leading-snug">
                            {skill.skillName}
                          </p>
                          <SkillStatusBadge status={skill.status} />
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <ProgressBar value={skill.mastery} height="h-1.5" />
                          <span className="shrink-0 font-mono text-xs text-faint">
                            {skill.attempts > 0
                              ? `${skill.correct}/${skill.attempts}`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
