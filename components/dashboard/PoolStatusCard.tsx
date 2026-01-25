"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants/canada";
import { Users, DollarSign, Heart } from "lucide-react";

type PoolStatusCardProps = {
  poolBalance: number;
  totalContributors: number;
  familiesHelped: number;
  city: string;
  province: string;
};

export function PoolStatusCard({
  poolBalance,
  totalContributors,
  familiesHelped,
  city,
  province,
}: PoolStatusCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground">Community Pool Status</p>
          <span className="text-muted-foreground text-xs">
            {city}, {province}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <DollarSign className="size-4" aria-hidden />
              <span className="text-xs font-medium">Pool Balance</span>
            </div>
            <p className="font-semibold text-foreground text-xl">
              {formatCurrency(poolBalance)}
            </p>
          </div>
          <div className="text-center border-x border-border">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Users className="size-4" aria-hidden />
              <span className="text-xs font-medium">Contributors</span>
            </div>
            <p className="font-semibold text-foreground text-xl">
              {totalContributors}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Heart className="size-4" aria-hidden />
              <span className="text-xs font-medium">Families Helped</span>
            </div>
            <p className="font-semibold text-foreground text-xl">
              {familiesHelped}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
