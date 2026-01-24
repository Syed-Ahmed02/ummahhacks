"use client";

import {
  CreditCard,
  Brain,
  Zap,
  FileBarChart,
} from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Subscribe for a weekly amount",
    description:
      "Choose how much you want to give each week. No commitment beyond that—pause or cancel anytime.",
    icon: CreditCard,
  },
  {
    step: 2,
    title: "AI monitors community needs",
    description:
      "Our system tracks urgency, funding gaps, and local data to identify where help is needed most.",
    icon: Brain,
  },
  {
    step: 3,
    title: "Funds distributed automatically",
    description:
      "Your contribution is allocated across vetted local charities. No extra work—just set it and forget it.",
    icon: Zap,
  },
  {
    step: 4,
    title: "Receive your weekly impact report",
    description:
      "See exactly where your money went, how many people were helped, and stories from the ground.",
    icon: FileBarChart,
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
          Four simple steps to meaningful, ongoing impact.
        </p>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
