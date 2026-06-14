import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="brand-glow pointer-events-none absolute left-1/2 top-1/3 h-72 w-[34rem] -translate-x-1/2" />
      <div className="relative z-10 flex flex-col items-center">
        <Logo />
        <p className="eyebrow mt-10">Error 404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          This page isn&apos;t on the syllabus.
        </h1>
        <p className="mt-4 max-w-md text-muted">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you
          back to studying.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/dashboard">
            Go to dashboard
            <Icon name="arrowRight" size={18} />
          </Button>
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </div>
    </main>
  );
}
