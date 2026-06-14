import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { CurriculumExplorer } from "@/components/dashboard/CurriculumExplorer";
import { buildCurriculum, buildSnapshot } from "@/lib/personalization";
import { getSession, getSelfRatings } from "@/lib/session";

export const metadata: Metadata = {
  title: "Curriculum",
};

export default async function CurriculumPage() {
  const session = await getSession();
  const selfRatings = await getSelfRatings();
  const snapshot = buildSnapshot(session?.userId, selfRatings);
  const curriculum = buildCurriculum(snapshot);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow={`${snapshot.certificationName} · ${snapshot.certificationCode}`}
        title="Curriculum"
        description="Search or filter to find any skill, then jump straight into a session to improve it."
      >
        <Badge mono tone="neutral">
          {snapshot.skillStats.length} skills · {curriculum.length} domains
        </Badge>
      </PageHeader>

      <CurriculumExplorer domains={curriculum} />
    </div>
  );
}
