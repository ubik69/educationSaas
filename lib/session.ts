import { cookies } from "next/headers";
import { currentUser } from "@/lib/data";

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
