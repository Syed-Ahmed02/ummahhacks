"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

type SubscriptionStatusProps = {
  status?: "active" | "paused" | "cancelled";
  weeklyAmount?: number;
  interval?: "week" | "month" | "year";
  nextBillingDate?: string | null;
};

export function SubscriptionStatus({
  status = "active",
  weeklyAmount = 20,
  interval = "week",
  nextBillingDate = null,
}: SubscriptionStatusProps) {
  const statusVariant = {
    active: "default",
    paused: "secondary",
    cancelled: "destructive",
  } as const;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <CreditCard className="text-muted-foreground size-5" aria-hidden />
          <span className="font-medium">Subscription</span>
        </div>
        <Badge variant={statusVariant[status]}>{status}</Badge>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">${weeklyAmount?.toFixed(2) || "0.00"}</span>{" "}
          {interval === "week" ? "per week" : interval === "month" ? "per month" : "per year"}
        </p>
        {status === "active" && nextBillingDate && (
          <p className="text-muted-foreground text-xs">
            Next billing: {formatDate(nextBillingDate) || nextBillingDate}
          </p>
        )}
        {status === "cancelled" && (
          <p className="text-muted-foreground text-xs">
            Your subscription has been cancelled
          </p>
        )}
        {status === "paused" && (
          <p className="text-muted-foreground text-xs">
            Your subscription is paused
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
