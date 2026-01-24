"use client";

import { Square, Cpu, BarChart3, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  {
    title: "Set it and forget it",
    description:
      "One subscription, recurring impact. No need to hunt for charities or decide each time—we handle it.",
    icon: Square,
  },
  {
    title: "AI-powered distribution",
    description:
      "Algorithms weigh urgency, funding gaps, and local data so your dollars go where they’re needed most.",
    icon: Cpu,
  },
  {
    title: "Transparent reporting",
    description:
      "Weekly reports show exactly where funds went, which charities received what, and estimated impact.",
    icon: BarChart3,
  },
  {
    title: "Local impact",
    description:
      "Focus on your community. Support food banks, shelters, and services in your area, not just big names.",
    icon: MapPin,
  },
];

export function Features() {
  return (
    <section
      className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="features-heading"
          className="font-semibold tracking-tight text-foreground text-center text-2xl sm:text-3xl"
        >
          Why invest with us
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center text-lg">
          Built for busy people who care about their community.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="border-border/80">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50">
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
