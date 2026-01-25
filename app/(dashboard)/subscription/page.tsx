"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

type SubscriptionData = {
  status: "active" | "paused" | "cancelled";
  weeklyAmount: number;
  interval: "week" | "month" | "year";
  nextBillingDate: string | null;
  subscriptionId: string | null;
};

export default function SubscriptionPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch user from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Fetch active subscription
  const convexSubscription = useQuery(
    api.subscriptions.getActiveSubscription,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Fetch next billing date from Stripe
  useEffect(() => {
    const fetchNextBillingDate = async () => {
      if (!convexSubscription?.stripeSubscriptionId) {
        setNextBillingDate(null);
        return;
      }

      try {
        const response = await fetch(
          `/api/stripe/get-subscription-details?subscriptionId=${convexSubscription.stripeSubscriptionId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.nextBillingDate) {
            setNextBillingDate(data.nextBillingDate);
          }
        }
      } catch (err) {
        console.error("Failed to fetch next billing date:", err);
        // Calculate based on interval and start date as fallback
        if (convexSubscription?.startDate && convexSubscription?.interval) {
          const startDate = new Date(convexSubscription.startDate);
          const nextDate = new Date(startDate);

          if (convexSubscription.interval === "week") {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (convexSubscription.interval === "month") {
            nextDate.setMonth(nextDate.getMonth() + 1);
          } else if (convexSubscription.interval === "year") {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
          }

          setNextBillingDate(nextDate.toISOString());
        }
      }
    };

    if (convexSubscription) {
      fetchNextBillingDate();
    }
  }, [convexSubscription]);

  // Transform Convex subscription to SubscriptionData
  const subscription: SubscriptionData | null = convexSubscription
    ? {
      status: convexSubscription.status,
      weeklyAmount: convexSubscription.weeklyAmount,
      interval: convexSubscription.interval || "week",
      nextBillingDate,
      subscriptionId: convexSubscription.stripeSubscriptionId,
    }
    : null;

  const isLoading = !isClerkLoaded || convexUser === undefined || convexSubscription === undefined;

  const handleOpenPortal = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open portal");
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to open portal");
      setIsUpdating(false);
    }
  };

  const handleUpdateAmount = async () => {
    if (!subscription?.subscriptionId) {
      setError("Subscription ID not found");
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 1) {
      const intervalLabel = subscription?.interval === "week" ? "week" : subscription?.interval === "month" ? "month" : "year";
      setError(`Invalid amount. Minimum is $1 per ${intervalLabel}.`);
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/stripe/update-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscriptionId,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update subscription");
      }

      setSuccess("Subscription updated successfully!");
      setNewAmount("");
      // Subscription data will automatically refresh via Convex query
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to update subscription");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription?.subscriptionId) {
      setError("Subscription ID not found");
      return;
    }

    if (!confirm("Are you sure you want to cancel your subscription? This action cannot be undone.")) {
      return;
    }

    setIsCanceling(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscriptionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      // Subscription data will automatically refresh via Convex query
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to cancel subscription");
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No active subscription found.{" "}
              <Link href="/subscribe" className="text-foreground underline">
                Start a subscription
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Manage subscription</h1>
        <p className="text-muted-foreground mt-1">
          Update your payment method or change your weekly amount.
        </p>
      </div>

      <SubscriptionStatus
        status={subscription.status}
        weeklyAmount={subscription.weeklyAmount}
        interval={subscription.interval}
        nextBillingDate={subscription.nextBillingDate}
      />

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500">
          <CardContent className="pt-6">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground">Payment Method</h2>
          <CardDescription>
            Update your payment method, view billing history, and download invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleOpenPortal}
            disabled={isUpdating || subscription.status === "cancelled"}
            variant="outline"
            className="w-full"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Opening...
              </>
            ) : (
              "Manage Payment Method"
            )}
          </Button>
        </CardContent>
      </Card>

      {subscription.status === "active" && (
        <Card className="border-border">
          <CardHeader>
            <h2 className="font-medium text-foreground">
              Change {subscription.interval === "week" ? "Weekly" : subscription.interval === "month" ? "Monthly" : "Yearly"} Amount
            </h2>
            <CardDescription>
              Update your {subscription.interval === "week" ? "weekly" : subscription.interval === "month" ? "monthly" : "yearly"} donation amount. Changes will be prorated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-amount">
                New {subscription.interval === "week" ? "weekly" : subscription.interval === "month" ? "monthly" : "yearly"} amount
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="new-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={subscription.weeklyAmount.toString()}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  disabled={isUpdating}
                  className="flex-1"
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateAmount}
              disabled={isUpdating || !newAmount || parseFloat(newAmount) < 1}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Amount"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {subscription.status === "active" && (
        <Card className="border-border">
          <CardHeader>
            <h2 className="font-medium text-destructive">Cancel Subscription</h2>
            <CardDescription>
              Cancel your subscription. You can resubscribe anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCancel}
              disabled={isCanceling}
              variant="destructive"
              className="w-full"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="pt-4">
        <Button
          render={<Link href="/dashboard" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
