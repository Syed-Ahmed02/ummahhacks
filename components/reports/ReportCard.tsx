"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WeekReport } from "@/lib/types";

type ReportCardProps = {
  report: WeekReport;
};

export function ReportCard({ report }: ReportCardProps) {
  const weekLabel = `${new Date(report.weekStart).toLocaleDateString()} – ${new Date(report.weekEnd).toLocaleDateString()}`;

  return (
    <Link href={`/reports/${report.id}`} className="block transition-opacity hover:opacity-90">
      <Card className="border-border h-full">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <p className="text-muted-foreground text-sm">Week of {new Date(report.weekStart).toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-semibold text-foreground text-xl">
            ${report.totalDistributed.toLocaleString()}
          </p>
          <p className="text-muted-foreground text-sm">
            {report.charityCount} {report.charityCount === 1 ? "charity" : "charities"} supported
          </p>
          {report.topCharity && (
            <p className="text-muted-foreground text-xs">
              Top: {report.topCharity.name} (${report.topCharity.amount})
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
