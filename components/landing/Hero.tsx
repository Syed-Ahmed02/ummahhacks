"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-primary mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium">
          <Sparkles className="size-4" aria-hidden />
          Community-first giving
        </p>
        <h1
          id="hero-heading"
          className="font-semibold tracking-tight text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Don&apos;t just donate. Invest where your community needs it most.
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
          Subscribe once. Our AI monitors local needs, distributes funds automatically, and you get a clear impact report every week.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button render={<Link href="/subscribe" />} nativeButton={false} size="lg" className="gap-2 text-base">
            Start Investing
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button render={<Link href="#how-it-works" />} nativeButton={false} variant="outline" size="lg" className="text-base">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
