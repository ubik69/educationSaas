"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center">
        <span className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-surface-2 text-danger">
          <Icon name="x" size={22} />
        </span>
        <p className="eyebrow mt-6">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          That didn&apos;t load as expected.
        </h1>
        <p className="mt-4 max-w-md text-muted">
          An unexpected error occurred while rendering this page. You can try
          again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <Icon name="history" size={18} />
            Try again
          </Button>
          <Button href="/dashboard" variant="secondary">
            Go to dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
