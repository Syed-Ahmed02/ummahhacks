"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants/canada";
import { Users, Receipt, Zap, Droplets, Flame, ThermometerSun } from "lucide-react";

type UtilityType = "electric" | "water" | "gas" | "heating";

type BillPaid = {
  utilityType: UtilityType;
  amount: number;
  city: string;
};

type ImpactReport = {
  _id: string;
  poolId: string;
  weekStartDate: number;
  weekEndDate: number;
  totalContributions: number;
  totalFamiliesHelped: number;
  billsPaid: BillPaid[];
  contributorCount: number;
  generatedAt: number;
};

type ReportCardProps = {
  report: ImpactReport;
};

const utilityIcons: Record<UtilityType, typeof Zap> = {
  electric: Zap,
  water: Droplets,
  gas: Flame,
  heating: ThermometerSun,
};

export function ReportCard({ report }: ReportCardProps) {
  const weekStart = new Date(report.weekStartDate).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });

  // Count utility types
  const utilityTypeCounts: Record<string, number> = {};
  for (const bill of report.billsPaid) {
    utilityTypeCounts[bill.utilityType] = (utilityTypeCounts[bill.utilityType] ?? 0) + 1;
  }
  const topUtilityType = Object.entries(utilityTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as UtilityType | undefined;
  const TopIcon = topUtilityType ? utilityIcons[topUtilityType] : Receipt;

  return (
    <Link href={`/reports/${report._id}`} className="block transition-opacity hover:opacity-90">
      <Card className="border-border h-full">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <p className="text-muted-foreground text-sm">Week of {weekStart}</p>
          <TopIcon className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-semibold text-foreground text-xl">
            {formatCurrency(report.totalContributions)}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="size-3.5" aria-hidden />
              <span>{report.totalFamiliesHelped} {report.totalFamiliesHelped === 1 ? "family" : "families"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Receipt className="size-3.5" aria-hidden />
              <span>{report.billsPaid.length} {report.billsPaid.length === 1 ? "bill" : "bills"}</span>
            </div>
          </div>
          {report.contributorCount > 0 && (
            <p className="text-muted-foreground text-xs">
              {report.contributorCount} active contributor{report.contributorCount !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
