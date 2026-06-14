"use server";

import { cookies } from "next/headers";
import {
  ONBOARDED_COOKIE,
  SELF_RATINGS_COOKIE,
  parseSelfRatings,
} from "@/lib/onboarding";

// Persist the onboarding self-ratings into the cookie mirror so the server-side
// recommendation engine can read them with no loading flash. localStorage (the
// source of truth) is written separately on the client.
export async function saveSelfRatings(ratingsJson: string): Promise<void> {
  const ratings = parseSelfRatings(ratingsJson);
  if (!ratings) return;

  const store = await cookies();
  const opts = {
    httpOnly: false, // also read by the client to hydrate localStorage
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
  store.set(SELF_RATINGS_COOKIE, JSON.stringify(ratings), opts);
  store.set(ONBOARDED_COOKIE, "1", opts);
}

// Clear onboarding so the experience can be replayed ("Redo onboarding").
export async function resetOnboarding(): Promise<void> {
  const store = await cookies();
  store.delete(SELF_RATINGS_COOKIE);
  store.delete(ONBOARDED_COOKIE);
}
