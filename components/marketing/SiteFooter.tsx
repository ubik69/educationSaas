import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Personalisation engine" },
      { href: "#how", label: "How it works" },
      { href: "#curriculum", label: "Curriculum" },
      { href: "#pricing", label: "Pricing" },
    ],
  },
  {
    title: "Certifications",
    links: [
      { href: "/login", label: "AWS Cloud Practitioner" },
      { href: "/login", label: "AWS Solutions Architect" },
      { href: "/login", label: "Azure Fundamentals" },
      { href: "/login", label: "Google ACE" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Careers" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              The personalisation engine for certification prep. Train exactly
              where you&apos;re weak, not where you&apos;re already strong.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Adept Labs. A mock product demo.</p>
          <p className="font-mono">
            Not affiliated with AWS or getcracked.io · Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
