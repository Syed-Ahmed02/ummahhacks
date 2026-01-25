"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/constants/canada";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

type ContributionStatsProps = {
  weeklyAmount: number;
  totalContributed: number;
  startDate: Date | number;
  status: "active" | "paused" | "cancelled";
};

export function ContributionStats({
  weeklyAmount,
  totalContributed,
  startDate,
  status,
}: ContributionStatsProps) {
  const statusVariant = {
    active: "outline",
    paused: "secondary",
    cancelled: "destructive",
  } as const;

  const startDateObj = typeof startDate === "number" ? new Date(startDate) : startDate;
  const formattedStartDate = startDateObj.toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric",
  });

  // Calculate weeks active
  const now = new Date();
  const weeksActive = Math.floor(
    (now.getTime() - startDateObj.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-muted-foreground size-5" aria-hidden />
          <span className="font-medium">Your Contributions</span>
        </div>
        <Badge variant={statusVariant[status]}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <DollarSign className="size-3" aria-hidden />
              <span className="text-xs">Weekly</span>
            </div>
            <p className="font-semibold text-foreground text-lg">
              {formatCurrency(weeklyAmount)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="size-3" aria-hidden />
              <span className="text-xs">Total</span>
            </div>
            <p className="font-semibold text-foreground text-lg">
              {formatCurrency(totalContributed)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Calendar className="size-3" aria-hidden />
              <span className="text-xs">Since</span>
            </div>
            <p className="font-semibold text-foreground text-lg">
              {formattedStartDate}
            </p>
          </div>
        </div>
        {weeksActive > 0 && (
          <p className="text-muted-foreground text-xs mt-3">
            You've been contributing for {weeksActive} week{weeksActive !== 1 ? "s" : ""}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          render={<Link href="/subscription" />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          Manage subscription
        </Button>
      </CardFooter>
    </Card>
  );
}
