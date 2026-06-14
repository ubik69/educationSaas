"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";

// Mock sign-in: ignores any credentials and just sets the session cookie.
export async function signIn() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "user_1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  redirect("/dashboard");
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
