"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardNav } from "@/components/navigation/DashboardNav";
import { Header } from "@/components/navigation/Header";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();

  // Get Convex user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Skip onboarding check if we're already on the onboarding page
  const isOnboardingPage = pathname === "/onboarding";

  // Check if user is admin (via Clerk public metadata)
  const isAdmin = clerkUser?.publicMetadata?.role === "admin";

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (
      clerkLoaded &&
      clerkUser &&
      convexUser === null &&
      !isOnboardingPage
    ) {
      router.replace("/onboarding");
    }
  }, [clerkLoaded, clerkUser, convexUser, isOnboardingPage, router]);

  // Show loading state
  if (!clerkLoaded || (convexUser === undefined && !isOnboardingPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // For onboarding page, render children directly without the dashboard chrome
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  // Still loading convex user
  if (convexUser === null && !isOnboardingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const user = {
    name: clerkUser?.fullName ?? clerkUser?.firstName ?? "User",
    email: clerkUser?.primaryEmailAddress?.emailAddress ?? "",
  };

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
          <DashboardNav role={convexUser?.role ?? null} isAdmin={isAdmin} />
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-border sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
          <nav className="md:hidden flex-1 overflow-x-auto">
            <DashboardNav
              role={convexUser?.role ?? null}
              isAdmin={isAdmin}
              className="flex flex-row gap-1"
            />
          </nav>
          <div className="shrink-0 md:ml-auto">
            <Header user={user} showLogo={false} onSignOut={() => signOut()} />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
