"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-semibold text-foreground text-lg hover:opacity-80 transition-opacity"
        >
          Community Invest
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-4">
          <Link
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Button render={<Link href="/subscribe" />} nativeButton={false} size="sm">
            Start Investing
          </Button>
        </nav>
      </div>
    </header>
  );
}
