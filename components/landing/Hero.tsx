"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-primary mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium">
          <Shield className="size-4" aria-hidden />
          Neighborhood utility insurance
        </p>
        <h1
          id="hero-heading"
          className="font-semibold tracking-tight text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Keep Your Neighbors&apos; Lights On
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
          Subscribe weekly. When a neighbor can&apos;t pay their utility bill, our AI verifies the need and we pay the provider directly. No cash changes hands.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button render={<Link href="/subscribe" />} nativeButton={false} size="lg" className="gap-2 text-base">
            Start Contributing
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button render={<Link href="/submit-bill" />} nativeButton={false} variant="outline" size="lg" className="text-base">
            I Need Help
          </Button>
        </div>
      </div>
    </section>
  );
}
