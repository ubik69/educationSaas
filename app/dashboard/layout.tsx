import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar, MobileNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar userName={session.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav userName={session.name} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
