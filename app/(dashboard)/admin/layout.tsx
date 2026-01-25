"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ClipboardCheck, CreditCard, Users } from "lucide-react";

const adminNav = [
  { href: "/admin/bills", label: "Bill Review", icon: ClipboardCheck },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/pools", label: "Pools", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Redirect non-admins to dashboard
  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isAdmin, router]);

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render if not admin (redirecting)
  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav
        className="flex flex-wrap gap-2 border-b border-border pb-4"
        aria-label="Admin navigation"
      >
        {adminNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin/bills" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
