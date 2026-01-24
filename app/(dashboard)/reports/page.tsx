"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockWeekReports, mockStats } from "@/lib/mock-data";
import { ReportCard } from "@/components/reports/ReportCard";
import { ImpactBadgeGroup } from "@/components/shared/ImpactBadge";

export default function ReportsListPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Weekly reports</h1>
        <p className="text-muted-foreground mt-1">
          See how your contributions were distributed each week.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="impact-summary-heading">
        <h2 id="impact-summary-heading" className="sr-only">
          Impact summary
        </h2>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <p className="text-muted-foreground text-sm font-medium">Total distributed</p>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">
              ${mockStats.totalDonated.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <p className="text-muted-foreground text-sm font-medium">Report weeks</p>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground text-2xl">
              {mockWeekReports.length}
            </p>
          </CardContent>
        </Card>
        <div className="sm:col-span-2">
          <ImpactBadgeGroup
            metrics={[
              { label: "Lives impacted", value: mockStats.livesImpacted },
              { label: "Meals provided", value: mockStats.mealsProvided, unit: "est." },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="reports-heading">
        <h2 id="reports-heading" className="font-medium text-foreground mb-4 text-lg">
          Reports
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockWeekReports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
