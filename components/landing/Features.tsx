"use client";

import { Banknote, ShieldCheck, Users, EyeOff, Clock, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  {
    title: "100% Direct Payment",
    description:
      "We pay utility companies directly. Every dollar goes to bills, not pockets. No middleman, no misuse.",
    icon: Banknote,
  },
  {
    title: "AI Fraud Protection",
    description:
      "Our AI verifies every bill submission. Fake bills, duplicate requests, and gaming attempts are caught automatically.",
    icon: ShieldCheck,
  },
  {
    title: "Community Transparency",
    description:
      "See your pool's impact: how many bills paid, families helped, and total amount distributed in your area.",
    icon: Users,
  },
  {
    title: "Privacy First",
    description:
      "Recipients remain anonymous. Contributors never see names—just that their neighbors' lights stayed on.",
    icon: EyeOff,
  },
  {
    title: "Urgency-Based Priority",
    description:
      "Disconnection notices get priority. When someone's about to lose power, they move to the front of the queue.",
    icon: Clock,
  },
  {
    title: "Rolling Assistance Limits",
    description:
      "Recipients can receive help up to $2,400/year. Limits roll forward monthly to ensure fair access for everyone.",
    icon: RotateCcw,
  },
];

export function Features() {
  return (
      <section
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        aria-labelledby="features-heading"
      >
      <div className="mx-auto max-w-5xl">
        <h2
          id="features-heading"
          className="font-semibold tracking-tight text-foreground text-center text-2xl sm:text-3xl"
        >
          Why utility insurance works
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center text-lg">
          Built to be trusted. Built to be fair. Built to actually help.
        </p>
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full border border-border px-3 py-1">Bills paid each week</span>
          <span className="rounded-full border border-border px-3 py-1">Total dollars distributed</span>
          <span className="rounded-full border border-border px-3 py-1">Cities served</span>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="border-border/80">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
                  <Icon className="text-muted-foreground size-5" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground text-base">
                  {title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
