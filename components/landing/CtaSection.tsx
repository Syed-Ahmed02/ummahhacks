"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, HandHeart, HelpCircle } from "lucide-react";

export function CtaSection() {
  return (
    <section
      className="border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="cta-heading"
          className="font-semibold tracking-tight text-foreground text-center text-2xl sm:text-3xl"
        >
          Ready to make a difference?
        </h2>
        <p className="text-muted-foreground mt-4 text-center text-lg max-w-2xl mx-auto">
          Whether you want to help keep your neighbors&apos; lights on or you&apos;re struggling with a utility bill, we&apos;re here for you.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
          {/* Contributor CTA */}
          <div className="rounded-xl border border-border bg-background p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border">
              <HandHeart className="text-foreground size-7" aria-hidden />
            </div>
            <h3 className="font-semibold text-foreground mt-4 text-lg">
              I want to help
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Start a weekly subscription and help neighbors in your community stay connected to essential utilities.
            </p>
            <Button
              render={<Link href="/subscribe" />}
              nativeButton={false}
              size="lg"
              className="mt-6 w-full gap-2"
            >
              Start Contributing
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
          
          {/* Recipient CTA */}
          <div className="rounded-xl border border-border bg-background p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border">
              <HelpCircle className="text-foreground size-7" aria-hidden />
            </div>
            <h3 className="font-semibold text-foreground mt-4 text-lg">
              I need help
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Struggling to pay a utility bill? Submit your bill and get help directly from your community.
            </p>
            <Button
              render={<Link href="/submit-bill" />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="mt-6 w-full gap-2"
            >
              Request Assistance
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
