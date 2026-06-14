import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
};

const perks = [
  "Your weakest skills, ranked by exam impact",
  "Today's session built in under a second",
  "AI lesson, flashcards & a 5-question check",
];

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="brand-glow pointer-events-none absolute left-1/2 top-0 h-96 w-[40rem] -translate-x-1/2" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Logo />
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-fg"
        >
          ← Back to home
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-5 py-10 lg:grid-cols-2">
        {/* Pitch */}
        <div className="hidden lg:block">
          <Badge tone="brand" dot mono>
            Demo mode
          </Badge>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            Welcome back to your
            <br />
            <span className="text-brand">personalisation engine.</span>
          </h1>
          <p className="mt-4 max-w-md text-muted">
            This is a mock product — there&apos;s no real account. Press the
            button and you&apos;re straight into the demo student&apos;s
            dashboard.
          </p>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-muted">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-brand/15 text-brand">
                  <Icon name="check" size={14} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Form card */}
        <div className="mx-auto w-full max-w-md">
          <div className="card p-7 shadow-2xl sm:p-8">
            <h2 className="text-xl font-semibold">Sign in to Adept</h2>
            <p className="mt-1.5 text-sm text-muted">
              No credentials needed — these fields are just for show.
            </p>

            <form action={signIn} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-fg"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  placeholder="demo@adept.app"
                  className="h-11 w-full rounded-lg border border-line bg-surface-2 px-3.5 text-sm text-fg placeholder:text-faint focus:border-brand/50 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-fg"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  placeholder="••••••••••"
                  className="h-11 w-full rounded-lg border border-line bg-surface-2 px-3.5 text-sm text-fg placeholder:text-faint focus:border-brand/50 focus:outline-none"
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Sign in to demo
                <Icon name="arrowRight" size={18} />
              </Button>
            </form>

            <p className="mt-5 text-center font-mono text-xs text-faint">
              one-click access · no password is checked
            </p>
          </div>

          <p className="mt-5 text-center text-sm text-muted">
            New here?{" "}
            <Link href="/" className="text-brand hover:underline">
              See what Adept does
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
