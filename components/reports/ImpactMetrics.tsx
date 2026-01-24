"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImpactBadgeGroup } from "@/components/shared/ImpactBadge";

type ImpactMetricsProps = {
  livesImpacted?: number;
  mealsProvided?: number;
  /** Additional metrics */
  metrics?: Array<{ label: string; value: string | number; unit?: string }>;
};

export function ImpactMetrics({
  livesImpacted = 0,
  mealsProvided = 0,
  metrics = [],
}: ImpactMetricsProps) {
  const base = [
    ...(livesImpacted > 0 ? [{ label: "Lives impacted", value: livesImpacted }] : []),
    ...(mealsProvided > 0 ? [{ label: "Meals provided", value: mealsProvided, unit: "est." }] : []),
  ];
  const all = [...base, ...metrics];

  if (all.length === 0) return null;

  return (
    <Card className="border-border">
      <CardHeader>
        <h3 className="font-medium text-foreground">Impact metrics</h3>
      </CardHeader>
      <CardContent>
        <ImpactBadgeGroup metrics={all} />
      </CardContent>
    </Card>
  );
}
