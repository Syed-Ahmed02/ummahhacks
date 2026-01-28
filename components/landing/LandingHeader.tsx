"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "@/components/theme-toggle";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background"
      role="banner"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-semibold text-foreground text-lg hover:opacity-80 transition-opacity"
        >
          Community Invest
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
          <ModeToggle />
          <Button
            render={<Link href="/subscribe" />}
            nativeButton={false}
            size="sm"
            className="sm:hidden"
          >
            Start
          </Button>
          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/submit-bill"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              I need help
            </Link>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          </div>
          <button
            type="button"
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center text-foreground"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <Button render={<Link href="/subscribe" />} nativeButton={false} size="sm" className="hidden sm:inline-flex">
            Start Contributing
          </Button>
        </nav>
      </div>
      {menuOpen && (
        <div id="landing-mobile-menu" className="sm:hidden border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2">
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                How it works
              </Link>
              <Link
                href="/submit-bill"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                I need help
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="border-t border-border pt-3" />
              <Button
                render={<Link href="/subscribe" />}
                nativeButton={false}
                size="sm"
                className="w-full"
                onClick={() => setMenuOpen(false)}
              >
                Start Contributing
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
