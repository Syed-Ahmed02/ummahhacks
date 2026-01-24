"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings } from "lucide-react";

type HeaderProps = {
  /** User display name; when absent, show "Guest" or sign-in prompt */
  user?: { name?: string; email?: string } | null;
  /** Show logo link in header (e.g. false when used in dashboard with sidebar) */
  showLogo?: boolean;
  className?: string;
};

export function Header({
  user,
  showLogo = true,
  className,
}: HeaderProps) {
  const displayName = user?.name ?? "Account";

  return (
    <div className={className} role="group" aria-label="User menu">
      <div className="flex h-full items-center justify-between gap-4">
        {showLogo && (
          <Link
            href="/dashboard"
            className="font-semibold text-foreground text-lg hover:opacity-80 transition-opacity"
          >
            Community Invest
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
            aria-label="Open user menu"
          >
            <User className="size-4" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
            <div className="px-1.5 py-2">
              <p className="text-sm font-medium">{displayName}</p>
              {user?.email && (
                <p className="text-muted-foreground text-xs">{user.email}</p>
              )}
            </div>
            <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
              <Settings className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/" />}>
              <LogOut className="size-4" />
              Back to home
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
