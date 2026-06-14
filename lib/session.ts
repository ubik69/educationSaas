import { cookies } from "next/headers";
import { currentUser } from "@/lib/data";
import {
  ONBOARDED_COOKIE,
  SELF_RATINGS_COOKIE,
  defaultSelfRatings,
  parseSelfRatings,
  type SelfRatings,
} from "@/lib/onboarding";

// Mock session. There's no real auth — a single cookie marks the demo user as
// "signed in". Swapping in real auth later means replacing these three helpers.
export const SESSION_COOKIE = "adept_session";

export type Session = {
  userId: string;
  name: string;
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return { userId: currentUser.id, name: currentUser.name };
}

export async function isSignedIn(): Promise<boolean> {
  return (await getSession()) !== null;
}

// Whether the user has completed onboarding (mirror of localStorage in a cookie
// so server components know without a client round-trip).
export async function hasOnboarded(): Promise<boolean> {
  const store = await cookies();
  return store.get(ONBOARDED_COOKIE)?.value === "1";
}

// The self-ratings the recommendation engine should use. Reads the cookie mirror
// of localStorage; falls back to the demo defaults so the dashboard is always
// meaningful even before onboarding.
export async function getSelfRatings(): Promise<SelfRatings> {
  const store = await cookies();
  const parsed = parseSelfRatings(store.get(SELF_RATINGS_COOKIE)?.value);
  return parsed ?? defaultSelfRatings;
}
