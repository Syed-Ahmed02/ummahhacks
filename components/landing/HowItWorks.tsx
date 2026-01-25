"use client";

import {
  CreditCard,
  Brain,
  Banknote,
} from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Subscribe Weekly",
    description:
      "Choose how much you want to contribute each week. Starting at $5/week, you can pause or cancel anytime.",
    icon: CreditCard,
  },
  {
    step: 2,
    title: "AI Verifies Bills",
    description:
      "When a neighbor submits a utility bill, our AI verifies it's legitimate. No fake requests slip through.",
    icon: Brain,
  },
  {
    step: 3,
    title: "Direct Payment",
    description:
      "We pay the utility company directly. No cash goes to the recipient. 100% of your contribution covers bills.",
    icon: Banknote,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="how-it-works-heading"
          className="font-semibold tracking-tight text-foreground text-center text-2xl sm:text-3xl"
        >
          How it works
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center text-lg">
          Three simple steps to keep your community powered.
        </p>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map(({ step, title, description, icon: Icon }) => (
            <li
              key={step}
              className="relative flex flex-col"
            >
              <span
                className="bg-primary text-primary-foreground inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                aria-hidden
              >
                {step}
              </span>
              <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
                <Icon className="text-muted-foreground size-5" aria-hidden />
              </div>
              <h3 className="font-semibold text-foreground mt-3 text-base">
                {title}
              </h3>
              <p className="text-muted-foreground mt-1 flex-1 text-sm leading-relaxed">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
