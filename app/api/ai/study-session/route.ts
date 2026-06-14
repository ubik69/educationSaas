import type { NextRequest } from "next/server";
import { buildSnapshot } from "@/lib/personalization";
import { activeProvider, generateStudyContent } from "@/lib/ai/provider";

// GET /api/ai/study-session?skillId=skill_iam_users_roles
// Returns AI-generated (or mock) study content for a skill. If no skillId is
// given, it uses the engine's recommended weakest skill.
export async function GET(req: NextRequest) {
  const skillId = req.nextUrl.searchParams.get("skillId");
  const snapshot = buildSnapshot();
  const target =
    (skillId && snapshot.skillStats.find((s) => s.skillId === skillId)) ||
    snapshot.studySession.skill;

  // Give the mock provider a touch of latency so the "generating" state is
  // visible. Real providers have their own natural latency.
  if (activeProvider() === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  const content = await generateStudyContent({
    skillId: target.skillId,
    skillName: target.skillName,
    skillSetName: target.skillSetName,
    domainName: target.domainName,
    accuracy: target.accuracy,
    attempts: target.attempts,
    examWeight: target.examWeight,
  });

  return Response.json({
    skillId: target.skillId,
    skillName: target.skillName,
    content,
  });
}
