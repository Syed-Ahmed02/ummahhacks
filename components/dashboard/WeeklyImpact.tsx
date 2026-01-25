"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants/canada";
import { Sparkles, Users, DollarSign, ShieldCheck } from "lucide-react";

type WeeklyImpactProps = {
  familiesHelped: number;
  totalDistributed: number;
  weekStartDate: Date | number;
  disconnectionsPrevented?: number;
};

export function WeeklyImpact({
  familiesHelped,
  totalDistributed,
  weekStartDate,
  disconnectionsPrevented,
}: WeeklyImpactProps) {
  const weekStart = typeof weekStartDate === "number" ? new Date(weekStartDate) : weekStartDate;
  const formattedWeekStart = weekStart.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Sparkles className="text-muted-foreground size-5" aria-hidden />
        <span className="font-medium">This Week's Impact</span>
        <span className="text-muted-foreground text-xs ml-auto">
          Week of {formattedWeekStart}
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center size-10 rounded-full border border-border mx-auto mb-2">
              <Users className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-semibold text-foreground text-2xl">
              {familiesHelped}
            </p>
            <p className="text-muted-foreground text-xs">
              {familiesHelped === 1 ? "Family" : "Families"} Helped
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center size-10 rounded-full border border-border mx-auto mb-2">
              <DollarSign className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-semibold text-foreground text-2xl">
              {formatCurrency(totalDistributed)}
            </p>
            <p className="text-muted-foreground text-xs">Distributed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center size-10 rounded-full border border-border mx-auto mb-2">
              <ShieldCheck className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-semibold text-foreground text-2xl">
              {disconnectionsPrevented ?? familiesHelped}
            </p>
            <p className="text-muted-foreground text-xs">
              Disconnections Prevented
            </p>
          </div>
        </div>
        {familiesHelped === 0 && (
          <p className="text-muted-foreground text-sm text-center mt-4">
            No bills paid yet this week. The pool is ready to help!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
