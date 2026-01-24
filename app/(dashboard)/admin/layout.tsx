"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin/charities", label: "Charities" },
  { href: "/admin/charities/map", label: "Charity map" },
  { href: "/admin/needs", label: "Needs data" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <nav
        className="flex flex-wrap gap-2 border-b border-border pb-4"
        aria-label="Admin navigation"
      >
        {adminNav.map(({ href, label }) => {
          const isActive = pathname === href || (href !== "/admin/charities" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
