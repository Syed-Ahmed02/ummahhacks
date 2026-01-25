"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants/canada";
import { Heart } from "lucide-react";
import type { DonationData } from "@/lib/campaigns/privacy";
import { filterDonationData } from "@/lib/campaigns/privacy";
import type { CampaignData } from "@/lib/campaigns/privacy";

type DonationListProps = {
  donations: DonationData[];
  campaign: CampaignData;
};

export function DonationList({ donations, campaign }: DonationListProps) {
  if (donations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No donations yet. Be the first to help!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Donations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {donations.map((donation) => {
            const filtered = filterDonationData(donation, campaign);
            return (
              <div
                key={donation._id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Heart className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {filtered.donorName || "Anonymous Donor"}
                    </p>
                    {filtered.message && (
                      <p className="text-sm text-muted-foreground">
                        "{filtered.message}"
                      </p>
                    )}
                    {filtered.paidAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(filtered.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(filtered.amount)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
