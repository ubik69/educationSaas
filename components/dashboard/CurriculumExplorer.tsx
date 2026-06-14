"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillStatusBadge } from "@/components/ui/SkillStatusBadge";
import { cn } from "@/components/ui/cn";
import type { CurriculumDomain, SkillStatus } from "@/lib/personalization";

type Filter = "all" | "needs-work" | SkillStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs-work", label: "Needs work" },
  { id: "weak", label: "Weak" },
  { id: "developing", label: "Developing" },
  { id: "strong", label: "Strong" },
];

function matchesFilter(status: SkillStatus, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "needs-work") return status === "weak" || status === "developing";
  return status === filter;
}

export function CurriculumExplorer({
  domains,
}: {
  domains: CurriculumDomain[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      domains
        .map((d) => ({
          ...d,
          skillSets: d.skillSets
            .map((ss) => ({
              ...ss,
              skills: ss.skills.filter((sk) => {
                const inText =
                  !q ||
                  sk.skillName.toLowerCase().includes(q) ||
                  ss.name.toLowerCase().includes(q) ||
                  d.name.toLowerCase().includes(q);
                return inText && matchesFilter(sk.status, filter);
              }),
            }))
            .filter((ss) => ss.skills.length > 0),
        }))
        .filter((d) => d.skillSets.length > 0),
    [domains, q, filter],
  );

  const shown = filtered.reduce(
    (n, d) => n + d.skillSets.reduce((m, ss) => m + ss.skills.length, 0),
    0,
  );

  return (
    <div className="space-y-5">
      {/* Search + status filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
            <Icon name="search" size={17} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a skill to improve…"
            className="h-10 w-full rounded-lg border border-line bg-surface-2 pl-9 pr-9 text-sm text-fg placeholder:text-faint focus:border-brand/50 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-fg"
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="font-mono text-xs text-faint">
        {shown} skill{shown === 1 ? "" : "s"} shown
      </p>

      {/* Results */}
      {shown === 0 ? (
        <div className="card p-10 text-center text-sm text-faint">
          No skills match. Try a different search or filter.
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((domain) => (
            <section key={domain.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface-2 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold">{domain.name}</h2>
                  <p className="mt-0.5 font-mono text-xs text-faint">
                    {domain.skillSets.reduce(
                      (n, ss) => n + ss.skills.length,
                      0,
                    )}{" "}
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
                        <SkillTile key={skill.skillId} skill={skill} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillTile({
  skill,
}: {
  skill: CurriculumDomain["skillSets"][number]["skills"][number];
}) {
  return (
    <Link
      href={`/dashboard/study?skill=${skill.skillId}`}
      className="group block rounded-xl border border-line bg-surface-2/50 p-4 transition-colors hover:border-brand/40 hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug">{skill.skillName}</p>
        <SkillStatusBadge status={skill.status} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={skill.mastery} height="h-1.5" />
        <span className="shrink-0 font-mono text-xs text-faint">
          {skill.mastery}%
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <span className="font-mono text-xs text-faint">
          {skill.attempts > 0
            ? `${skill.correct}/${skill.attempts} answered`
            : "not yet tested"}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors group-hover:text-brand">
          Improve
          <Icon
            name="arrowRight"
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
