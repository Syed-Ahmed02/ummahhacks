"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
      <section
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36"
        aria-labelledby="hero-heading"
      >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-[0.2em] fade-up fade-up-1">
          Neighborhood utility insurance
        </p>
        <div className="mx-auto mb-6 flex flex-wrap items-center justify-center gap-2 text-xs fade-up fade-up-2">
          <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
            For contributors
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
            For neighbors who need help
          </span>
        </div>
        <h1
          id="hero-heading"
          className="font-semibold tracking-tight text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl fade-up fade-up-2"
        >
          Keep Your Neighbors&apos; Lights On
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl fade-up fade-up-3">
          Subscribe weekly. When a neighbor can&apos;t pay their utility bill, we verify the request and pay the provider directly. No cash is exchanged.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row fade-up fade-up-4">
          <Button render={<Link href="/subscribe" />} nativeButton={false} size="lg" className="gap-2 text-base">
            Start Contributing
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button render={<Link href="/submit-bill" />} nativeButton={false} variant="outline" size="lg" className="text-base">
            Need help with a bill?
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-sm fade-up fade-up-4">
          Donors support the pool. Recipients submit a bill for review.
        </p>
      </div>
    </section>
  );
}
