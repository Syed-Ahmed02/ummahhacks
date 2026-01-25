"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SubscribePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Start contributing</h1>
        <p className="text-muted-foreground mt-1">
          Choose a weekly amount to support your community. You can update it anytime.
        </p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground">Set up your contribution</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            You'll add a payment method and confirm your weekly amount in the next step. Funds are distributed automatically each week.
          </p>
          <Button render={<Link href="/dashboard" />} nativeButton={false} variant="outline">
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
