"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";

import { PoolStatusCard } from "@/components/dashboard/PoolStatusCard";
import { ContributionStats } from "@/components/dashboard/ContributionStats";
import { RecentBillsPaid } from "@/components/dashboard/RecentBillsPaid";
import { WeeklyImpact } from "@/components/dashboard/WeeklyImpact";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText, Plus } from "lucide-react";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function ContributorDashboard({
  user,
  pool,
  subscription,
  recentBills,
  weeklyImpact,
}: {
  user: { _id: any; city: string; province: string };
  pool: {
    totalFundsAvailable: number;
    totalContributors: number;
    totalFamiliesHelped: number;
  } | null;
  subscription: {
    weeklyAmount: number;
    totalContributed: number;
    startDate: number;
    status: "active" | "paused" | "cancelled";
  } | null;
  recentBills: { utilityType: "electric" | "water" | "gas" | "heating"; amount: number | null; paidAt: number | null }[];
  weeklyImpact: { familiesHelped: number; totalDistributed: number; weekStartDate: number } | null;
}) {
  return (
    <div className="space-y-6">
      {/* Pool Status */}
      <PoolStatusCard
        poolBalance={pool?.totalFundsAvailable ?? 0}
        totalContributors={pool?.totalContributors ?? 0}
        familiesHelped={pool?.totalFamiliesHelped ?? 0}
        city={user.city}
        province={user.province}
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {subscription ? (
          <ContributionStats
            weeklyAmount={subscription.weeklyAmount}
            totalContributed={subscription.totalContributed}
            startDate={subscription.startDate}
            status={subscription.status}
          />
        ) : (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Plus className="size-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground mb-2">Start Contributing</p>
              <p className="text-sm text-muted-foreground mb-4">
                Set up a weekly contribution to help families in your community.
              </p>
              <Button render={<Link href="/subscription" />} nativeButton={false}>
                Set Up Subscription
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        <RecentBillsPaid bills={recentBills} city={user.city} />
      </div>

      {/* Weekly Impact */}
      {weeklyImpact && (
        <WeeklyImpact
          familiesHelped={weeklyImpact.familiesHelped}
          totalDistributed={weeklyImpact.totalDistributed}
          weekStartDate={weeklyImpact.weekStartDate}
        />
      )}
    </div>
  );
}

function RecipientDashboard({
  user,
  pool,
}: {
  user: { _id: any; city: string; province: string };
  pool: {
    totalFundsAvailable: number;
    totalContributors: number;
    totalFamiliesHelped: number;
  } | null;
}) {
  return (
    <div className="space-y-6">
      {/* Pool Status - shows community support available */}
      <PoolStatusCard
        poolBalance={pool?.totalFundsAvailable ?? 0}
        totalContributors={pool?.totalContributors ?? 0}
        familiesHelped={pool?.totalFamiliesHelped ?? 0}
        city={user.city}
        province={user.province}
      />

      {/* Quick Actions for Recipients */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="size-10 text-muted-foreground mb-3" />
            <p className="font-medium text-foreground mb-2">Submit a Bill</p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a utility bill that's at risk of shutoff to request assistance.
            </p>
            <Button render={<Link href="/submit-bill" />} nativeButton={false}>
              Submit Bill
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="size-10 text-muted-foreground mb-3" />
            <p className="font-medium text-foreground mb-2">My Requests</p>
            <p className="text-sm text-muted-foreground mb-4">
              View the status of your bill submissions and payment history.
            </p>
            <Button
              variant="outline"
              render={<Link href="/my-requests" />}
              nativeButton={false}
            >
              View Requests
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  // Fetch user from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Fetch pool by user's location
  const pool = useQuery(
    api.pools.getPoolByLocation,
    convexUser ? { city: convexUser.city, province: convexUser.province } : "skip"
  );

  // Fetch pool stats
  const poolStats = useQuery(
    api.pools.getPoolStats,
    pool?._id ? { poolId: pool._id } : "skip"
  );

  // Fetch active subscription (for contributors)
  const subscription = useQuery(
    api.subscriptions.getActiveSubscription,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Fetch recent paid bills for the pool
  const recentBills = useQuery(
    api.bills.getRecentPaidBills,
    pool?._id ? { poolId: pool._id, limit: 5 } : "skip"
  );

  // Fetch this week's impact
  const weeklyImpact = useQuery(
    api.impact.getThisWeeksImpact,
    pool?._id ? { poolId: pool._id } : "skip"
  );

  // Show loading state
  if (!isClerkLoaded || convexUser === undefined) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-semibold text-foreground text-2xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Loading your dashboard...</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  // Redirect to onboarding if user doesn't exist in Convex
  if (!convexUser) {
    redirect("/onboarding");
  }

  const isContributor = convexUser.role === "contributor";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">
          Welcome back{clerkUser?.firstName ? `, ${clerkUser.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isContributor
            ? "Here's your community impact at a glance."
            : "Your community is here to help."}
        </p>
      </div>

      {isContributor ? (
        <ContributorDashboard
          user={convexUser}
          pool={poolStats ?? null}
          subscription={subscription ?? null}
          recentBills={recentBills ?? []}
          weeklyImpact={weeklyImpact ?? null}
        />
      ) : (
        <RecipientDashboard
          user={convexUser}
          pool={poolStats ?? null}
        />
      )}
    </div>
  );
}
