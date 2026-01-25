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
          Update your payment method or weekly amount. Changes take effect on your next billing cycle.
        </p>
      </div>
      <SubscriptionStatus status="active" weeklyAmount={20} />
      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground">Actions</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled>
            Update payment method
          </Button>
          <Button variant="outline" size="sm" disabled>
            Change weekly amount
          </Button>
          <Button render={<Link href="/dashboard" />} nativeButton={false} variant="ghost" size="sm">
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
