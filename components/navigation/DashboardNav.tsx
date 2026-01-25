"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileBarChart,
  CreditCard,
  User,
  Shield,
  FileText,
  Receipt,
  Users,
  DollarSign,
  MapPin,
  HelpCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Contributor navigation items
const contributorNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Impact Reports", icon: FileBarChart },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

// Recipient navigation items
const recipientNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/impact", label: "How it works", icon: HelpCircle },
  { href: "/my-requests", label: "My Requests", icon: FileText },
  { href: "/my-campaigns", label: "My Campaigns", icon: FileBarChart },
  { href: "/submit-bill", label: "Submit Bill", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

// Admin navigation items
const adminNavItems: NavItem[] = [
  { href: "/admin/bills", label: "Bill Review", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/pools", label: "Pools", icon: MapPin },
  { href: "/admin/users", label: "Users", icon: Users },
];

type UserRole = "contributor" | "recipient" | null;

type DashboardNavProps = {
  role?: UserRole;
  isAdmin?: boolean;
  className?: string;
};

export function DashboardNav({ role, isAdmin = false, className }: DashboardNavProps) {
  const pathname = usePathname();
  
  // Get nav items based on role
  const roleNavItems = role === "recipient" ? recipientNavItems : contributorNavItems;
  
  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Dashboard navigation"
    >
      {/* Main role-based navigation */}
      {roleNavItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
      
      {/* Admin section */}
      {isAdmin && (
        <>
          <div className="my-2 border-t border-sidebar-border" />
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Admin
          </span>
          {adminNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Shield className="size-3 shrink-0 text-amber-500" aria-hidden />
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}
