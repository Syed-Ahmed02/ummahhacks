"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/constants/canada";

function daysLeft(shutoff: number) {
  const now = Date.now();
  const diff = Math.ceil((shutoff - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} days left` : "Past due";
}

export default function BrowseCampaignsPage() {
  const campaigns = useQuery(api.campaigns.getActiveCampaigns, {});

  if (campaigns === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fundraising now</h1>
          <p className="text-muted-foreground">Browse active campaigns</p>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No active campaigns yet.</p>
            <Button asChild>
              <Link href="/my-campaigns/create">Start a Campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const pct = Math.min((c.currentAmount / c.goalAmount) * 100, 100);
            return (
              <div key={c._id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold line-clamp-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{c.donationCount} donors</span>
                    <span>{daysLeft(c.shutoffDate)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary transition-[width] duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(c.currentAmount)}</span>
                      <span>funded of {formatCurrency(c.goalAmount)}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href={`/campaigns/${c.shareableSlug}`}>Donate</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
