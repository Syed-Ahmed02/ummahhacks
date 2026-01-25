"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants/canada";
import { Clock3, HeartHandshake } from "lucide-react";

type CampaignProgressProps = {
  currentAmount: number;
  goalAmount: number;
  donationCount: number;
  onRefetch?: () => void;
};

export function CampaignProgress({
  currentAmount,
  goalAmount,
  donationCount,
  onRefetch,
}: CampaignProgressProps) {
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
  const remaining = Math.max(goalAmount - currentAmount, 0);

  return (
    <Card className="border-sky-100 bg-sky-50">
      <CardContent className="p-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xl font-semibold text-slate-900">
                Campaign Progress
              </p>
              <p className="text-sm text-slate-600">
                {formatCurrency(currentAmount)} raised of {formatCurrency(goalAmount)} goal
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-sky-700 shadow-sm">
              {Math.round(percentage)}% funded
            </span>
          </div>

          <div className="w-full rounded-full bg-white shadow-inner h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">
              <HeartHandshake className="size-4 text-sky-700" />
              <span>
                {donationCount} {donationCount === 1 ? "donation" : "donations"}
              </span>
            </div>
            {onRefetch && (
              <button
                type="button"
                className="text-xs underline text-muted-foreground"
                onClick={onRefetch}
              >
                Refresh
              </button>
            )}
            {remaining > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">
                <Clock3 className="size-4 text-amber-600" />
                <span>{formatCurrency(remaining)} still needed</span>
              </div>
            )}
          </div>

          {currentAmount >= goalAmount && (
            <div className="text-center rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Goal reached! 🎉 Thank you for your generosity.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
