"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/constants/canada";
import { ArrowLeft, Users, DollarSign, Zap, Droplets, Flame, Thermometer } from "lucide-react";

type BillPaid = {
  utilityType: string;
  amount: number;
  city: string;
};

const utilityIcons: Record<string, React.ElementType> = {
  electric: Zap,
  water: Droplets,
  gas: Flame,
  heating: Thermometer,
};

const utilityLabels: Record<string, string> = {
  electric: "Electric",
  water: "Water",
  gas: "Gas",
  heating: "Heating",
};

function ReportDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const weekId = params.weekId as string;

  // Try to get the report by ID
  const report = useQuery(
    api.impact.getReport,
    weekId ? { reportId: weekId as Id<"impactReports"> } : "skip"
  );

  const isLoading = report === undefined;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Link
            href="/reports"
            className="text-primary mb-2 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="size-4" /> Back to reports
          </Link>
          <h1 className="font-semibold text-foreground text-2xl">Loading report...</h1>
        </div>
        <ReportDetailSkeleton />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-4">
        <Link
          href="/reports"
          className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to reports
        </Link>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Report not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekStart = new Date(report.weekStartDate);
  const weekEnd = new Date(report.weekEndDate);
  const weekRange = `${weekStart.toLocaleDateString("en-CA", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}`;

  // Group bills by utility type
  const utilityBreakdown: Record<string, { count: number; amount: number }> = {};
  for (const bill of report.billsPaid) {
    if (!utilityBreakdown[bill.utilityType]) {
      utilityBreakdown[bill.utilityType] = { count: 0, amount: 0 };
    }
    utilityBreakdown[bill.utilityType].count += 1;
    utilityBreakdown[bill.utilityType].amount += bill.amount;
  }

  // Group by city
  const cityBreakdown: Record<string, number> = {};
  for (const bill of report.billsPaid) {
    cityBreakdown[bill.city] = (cityBreakdown[bill.city] ?? 0) + bill.amount;
  }
  const cities = Object.entries(cityBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/reports"
          className="text-primary mb-2 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to reports
        </Link>
        <h1 className="font-semibold text-foreground text-2xl">
          Week of {weekStart.toLocaleDateString("en-CA", { month: "long", day: "numeric" })}
        </h1>
        <p className="text-muted-foreground mt-1">{weekRange}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <DollarSign className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">
              {formatCurrency(report.totalContributions)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Families Helped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">{report.totalFamiliesHelped}</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">{report.contributorCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Utility Breakdown */}
      {Object.keys(utilityBreakdown).length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">By Utility Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(utilityBreakdown).map(([type, data]) => {
                const Icon = utilityIcons[type] ?? Zap;
                return (
                  <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="rounded-lg bg-background p-2">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {utilityLabels[type] ?? type}
                      </p>
                      <p className="font-semibold">{formatCurrency(data.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.count} {data.count === 1 ? "bill" : "bills"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* City Breakdown */}
      {cities.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">By Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cities.map(([city, amount]) => (
                <div key={city} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{city}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bills Paid */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Bills Paid This Week</CardTitle>
        </CardHeader>
        <CardContent>
          {report.billsPaid.length > 0 ? (
            <div className="space-y-2">
              {report.billsPaid.map((bill: BillPaid, index: number) => {
                const Icon = utilityIcons[bill.utilityType] ?? Zap;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="capitalize">{bill.utilityType}</span>
                      <span className="text-sm text-muted-foreground">- {bill.city}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(bill.amount)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No bills were paid this week.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
