"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReportCard } from "@/components/reports/ReportCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/constants/canada";
import { Users, DollarSign, Calendar, Receipt } from "lucide-react";

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    </div>
  );
}

export default function ReportsListPage() {
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

  // Fetch aggregate stats
  const aggregateStats = useQuery(
    api.impact.getAggregateStats,
    pool?._id ? { poolId: pool._id } : "skip"
  );

  // Fetch all reports for the pool
  const reports = useQuery(
    api.impact.getPoolReports,
    pool?._id ? { poolId: pool._id } : "skip"
  );

  // Loading state
  if (!isClerkLoaded || convexUser === undefined) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-semibold text-foreground text-2xl">Impact Reports</h1>
          <p className="text-muted-foreground mt-1">Loading your reports...</p>
        </div>
        <ReportsSkeleton />
      </div>
    );
  }

  // Redirect to onboarding if user doesn't exist
  if (!convexUser) {
    redirect("/onboarding");
  }

  // Utility breakdown for display
  const utilityBreakdown: Record<string, number> = aggregateStats?.utilityBreakdown ?? {};
  const utilityTypes = Object.entries(utilityBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Impact Reports</h1>
        <p className="text-muted-foreground mt-1">
          See how your community pool helps families each week.
        </p>
      </div>

      {/* Summary Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="impact-summary-heading">
        <h2 id="impact-summary-heading" className="sr-only">
          Impact summary
        </h2>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <DollarSign className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-muted-foreground text-sm font-medium">Total Distributed</p>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">
              {formatCurrency(aggregateStats?.totalFundsDistributed ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-muted-foreground text-sm font-medium">Families Helped</p>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">
              {aggregateStats?.totalFamiliesHelped ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Calendar className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-muted-foreground text-sm font-medium">Weeks Active</p>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">
              {aggregateStats?.totalWeeksActive ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Receipt className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-muted-foreground text-sm font-medium">Pool Balance</p>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">
              {formatCurrency(aggregateStats?.currentPoolBalance ?? 0)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Utility Breakdown */}
      {utilityTypes.length > 0 && (
        <section aria-labelledby="utility-breakdown-heading">
          <h2 id="utility-breakdown-heading" className="font-medium text-foreground mb-4 text-lg">
            By Utility Type
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {utilityTypes.map(([type, amount]) => (
              <Card key={type} className="border-border">
                <CardContent className="pt-4">
                  <p className="text-muted-foreground text-sm capitalize">{type}</p>
                  <p className="font-semibold text-foreground text-lg">
                    {formatCurrency(amount)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Weekly Reports */}
      <section aria-labelledby="reports-heading">
        <h2 id="reports-heading" className="font-medium text-foreground mb-4 text-lg">
          Weekly Reports
        </h2>
        {reports && reports.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report: Doc<"impactReports">) => (
              <ReportCard key={report._id} report={report as any} />
            ))}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No reports yet. Reports are generated weekly once the pool starts helping families.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
