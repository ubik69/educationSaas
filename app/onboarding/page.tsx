import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, hasOnboarded } from "@/lib/session";
import { OnboardingExperience } from "@/components/onboarding/OnboardingExperience";

export const metadata: Metadata = {
  title: "Set your starting point",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // First-time only: if already onboarded, skip straight to the dashboard
  // unless explicitly redoing (?redo=1).
  const params = await searchParams;
  const redo = params.redo === "1";
  if (!redo && (await hasOnboarded())) redirect("/dashboard");

  return <OnboardingExperience />;
}
