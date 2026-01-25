"use client";

import Link from "next/link";

const footerLinks = [
  { href: "/reports", label: "Reports" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "#how-it-works", label: "How it works" },
];

export function Footer() {
  return (
    <footer
      className="border-t border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Community Invest. All rights reserved.
        </p>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-6">
            {footerLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
