"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants/canada";
import { Receipt, Zap, Droplets, Flame, ThermometerSun } from "lucide-react";

type UtilityType = "electric" | "water" | "gas" | "heating";

type RecentBill = {
  utilityType: UtilityType;
  amount: number | null;
  paidAt: number | null;
};

type RecentBillsPaidProps = {
  bills: RecentBill[];
  city?: string;
};

const utilityIcons: Record<UtilityType, typeof Zap> = {
  electric: Zap,
  water: Droplets,
  gas: Flame,
  heating: ThermometerSun,
};

const utilityLabels: Record<UtilityType, string> = {
  electric: "Electric bill",
  water: "Water bill",
  gas: "Gas bill",
  heating: "Heating bill",
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
}

export function RecentBillsPaid({ bills, city }: RecentBillsPaidProps) {
  if (bills.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Receipt className="text-muted-foreground size-5" aria-hidden />
          <span className="font-medium">Recent Bills Paid</span>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No bills have been paid yet. Your contributions are building up the pool!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Receipt className="text-muted-foreground size-5" aria-hidden />
        <span className="font-medium">Recent Bills Paid</span>
        {city && (
          <span className="text-muted-foreground text-xs ml-auto">(Anonymized)</span>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {bills.map((bill, index) => {
            const Icon = utilityIcons[bill.utilityType];
            return (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-muted">
                    <Icon className="size-4 text-foreground" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {utilityLabels[bill.utilityType]}
                    </p>
                    {bill.paidAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(bill.paidAt)}
                      </p>
                    )}
                  </div>
                </div>
                {bill.amount && (
                  <span className="font-medium text-foreground">
                    {formatCurrency(bill.amount)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
