"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section
      className="border-t border-border bg-primary/5 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="cta-heading"
          className="font-semibold tracking-tight text-foreground text-2xl sm:text-3xl"
        >
          Ready to invest in your community?
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Join others who give consistently. Start with as little as you like—every bit helps.
        </p>
        <div className="mt-8">
          <Button render={<Link href="/subscribe" />} nativeButton={false} size="lg" className="gap-2 text-base">
            Start Investing
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
