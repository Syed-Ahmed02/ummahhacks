"use client";

import Link from "next/link";
import { Receipt, DollarSign, CheckCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const reasons = [
  {
    title: "Why utility bills?",
    description:
      "Utility bills are verifiable. They have account numbers, due dates, and amounts that can be confirmed. Unlike cash requests, bills provide a clear paper trail.",
    icon: Receipt,
    highlights: ["Verifiable account numbers", "Clear due dates", "Trackable payments"],
  },
  {
    title: "Why not give cash?",
    description:
      "Cash can be misused. By paying providers directly, we ensure 100% of contributions go to keeping utilities on. The recipient never handles any money.",
    icon: DollarSign,
    highlights: ["Zero cash handling", "Direct to provider", "No misuse possible"],
  },
  {
    title: "Why AI verification?",
    description:
      "Our AI checks for duplicate bills, suspicious patterns, and verifies bill authenticity. Human admins review edge cases and users can appeal.",
    icon: CheckCircle,
    highlights: ["Duplicate detection", "Pattern analysis", "Human oversight + appeals"],
  },
  {
    title: "Weekly public reports",
    description:
      "We publish weekly reports with totals by utility type and city so you can see where funds go.",
    icon: BarChart3,
    highlights: ["Totals by utility", "City breakdowns", "Weekly updates"],
  },
];

export function TrustSection() {
  return (
    <section
      className="border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="trust-heading"
          className="font-semibold tracking-tight text-foreground text-center text-2xl sm:text-3xl"
        >
          Built on trust, not faith
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center text-lg">
          We designed this system to earn skeptics&apos; trust. Here&apos;s why it works.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {reasons.map(({ title, description, icon: Icon, highlights }) => (
            <div key={title} className="rounded-xl border border-border bg-background p-6 hover-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                <Icon className="text-foreground size-6" aria-hidden />
              </div>
              <h3 className="font-semibold text-foreground mt-4 text-lg">
                {title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {description}
              </p>
              <ul className="mt-4 space-y-2">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="size-1.5 rounded-full bg-foreground" aria-hidden />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button render={<Link href="/reports" />} nativeButton={false} variant="outline">
            View weekly reports
          </Button>
        </div>
      </div>
    </section>
  );
}
