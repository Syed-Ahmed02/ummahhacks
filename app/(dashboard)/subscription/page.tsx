"use client";

import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SubscriptionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Manage subscription</h1>
        <p className="text-muted-foreground mt-1">
          Update your payment method or change your weekly amount. Full management is covered by the Stripe plan.
        </p>
      </div>
      <SubscriptionStatus status="active" weeklyAmount={20} nextBillingDate="Jan 27, 2025" />
      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground">Actions</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled>
            Update payment method (Stripe)
          </Button>
          <Button variant="outline" size="sm" disabled>
            Change weekly amount (Stripe)
          </Button>
          <Button render={<Link href="/dashboard" />} nativeButton={false} variant="ghost" size="sm">
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
