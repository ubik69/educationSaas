"use server";

import { cookies } from "next/headers";
import {
  ONBOARDED_COOKIE,
  SELF_RATINGS_COOKIE,
  parseSelfRatings,
} from "@/lib/onboarding";

const COOKIE_OPTS = {
  httpOnly: false, // also read by the client to hydrate localStorage
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

// Persist the onboarding self-ratings into the cookie mirror so the server-side
// recommendation engine can read them with no loading flash. localStorage (the
// source of truth) is written separately on the client.
//
// NOTE: this deliberately does NOT set the "onboarded" flag. A Server Action
// implicitly refreshes the current route, and if we marked onboarding complete
// here the onboarding page would immediately redirect to /dashboard mid-flow —
// skipping the "we can get you better" reveal. Onboarded is marked separately,
// only once the learner leaves for the dashboard (see markOnboarded).
export async function saveSelfRatings(ratingsJson: string): Promise<void> {
  const ratings = parseSelfRatings(ratingsJson);
  if (!ratings) return;

  const store = await cookies();
  store.set(SELF_RATINGS_COOKIE, JSON.stringify(ratings), COOKIE_OPTS);
}

// Mark onboarding complete. Called as the learner transitions to the dashboard,
// so the redirect it triggers lands them exactly where they're already headed.
export async function markOnboarded(): Promise<void> {
  const store = await cookies();
  store.set(ONBOARDED_COOKIE, "1", COOKIE_OPTS);
}

// Clear onboarding so the experience can be replayed ("Redo onboarding").
export async function resetOnboarding(): Promise<void> {
  const store = await cookies();
  store.delete(SELF_RATINGS_COOKIE);
  store.delete(ONBOARDED_COOKIE);
}
