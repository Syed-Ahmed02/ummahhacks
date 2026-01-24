"use client";

import Link from "next/link";
import { DashboardNav } from "@/components/navigation/DashboardNav";
import { Header } from "@/components/navigation/Header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /** Mock user; replace with Auth (e.g. Clerk) when available */
  const user = { name: "Guest User", email: "guest@example.com" };
  const isAdmin = false;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside
        className={cn(
          "border-sidebar-border bg-sidebar w-full shrink-0 border-b md:w-56 md:border-b-0 md:border-r",
          "sticky top-0 z-40 md:h-screen"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 md:border-b-0">
          <Link
            href="/dashboard"
            className="font-semibold text-sidebar-foreground hover:text-sidebar-foreground/80"
          >
            Community Invest
          </Link>
        </div>
        <div className="hidden flex-1 overflow-y-auto p-3 md:block">
          <DashboardNav isAdmin={isAdmin} />
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-border sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
          <nav className="md:hidden flex-1 overflow-x-auto">
            <DashboardNav isAdmin={isAdmin} className="flex flex-row gap-1" />
          </nav>
          <div className="shrink-0 md:ml-auto">
            <Header user={user} showLogo={false} />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
