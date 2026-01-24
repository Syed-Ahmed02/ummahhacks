"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DistributionBreakdown } from "@/components/reports/DistributionBreakdown";
import { ImpactMetrics } from "@/components/reports/ImpactMetrics";
import { ReportMap } from "@/components/reports/ReportMap";
import { mockCharities, mockDistributions, mockWeekReports } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const weekId = params.weekId as string;
  const report = mockWeekReports.find((r) => r.id === weekId);
  const weekDistributions = mockDistributions.filter((d) => d.weekId === weekId);
  const weekCharities = mockCharities.filter((c) =>
    weekDistributions.some((d) => d.charityId === c.id)
  );

  if (!report) {
    return (
      <div className="space-y-4">
        <Link
          href="/reports"
          className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to reports
        </Link>
        <p className="text-muted-foreground">Report not found.</p>
      </div>
    );
  }

  const weekRange = `${new Date(report.weekStart).toLocaleDateString()} – ${new Date(report.weekEnd).toLocaleDateString()}`;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/reports"
          className="text-primary mb-2 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to reports
        </Link>
        <h1 className="font-semibold text-foreground text-2xl">Week of {new Date(report.weekStart).toLocaleDateString()}</h1>
        <p className="text-muted-foreground mt-1">{weekRange}</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground">Summary</h2>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="font-semibold text-foreground text-xl">
            ${report.totalDistributed.toLocaleString()} distributed
          </p>
          <p className="text-muted-foreground text-sm">
            {report.charityCount} {report.charityCount === 1 ? "charity" : "charities"} supported
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionBreakdown distributions={weekDistributions} />
        <ImpactMetrics
          livesImpacted={120}
          mealsProvided={Math.round(report.totalDistributed / 0.65)}
        />
      </div>

      <ReportMap
        charities={weekCharities}
        distributions={weekDistributions}
        weekId={weekId}
      />
    </div>
  );
}
