"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ImpactMetric = {
  label: string;
  value: string | number;
  /** Optional unit (e.g. "meals", "lives") */
  unit?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
};

type ImpactBadgeProps = {
  metric: ImpactMetric;
  className?: string;
  /** Render as compact badge or with full label */
  compact?: boolean;
};

export function ImpactBadge({
  metric,
  className,
  compact = false,
}: ImpactBadgeProps) {
  const { label, value, unit, variant = "secondary" } = metric;
  const formatted = typeof value === "number" && value >= 1000 ? value.toLocaleString() : String(value);
  const display = unit ? `${formatted} ${unit}` : formatted;

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-medium",
        compact && "text-xs",
        !compact && "px-2.5 py-1",
        className
      )}
      title={compact ? `${label}: ${display}` : undefined}
    >
      {!compact && <span className="text-muted-foreground mr-1">{label}:</span>}
      {display}
    </Badge>
  );
}

type ImpactBadgeGroupProps = {
  metrics: ImpactMetric[];
  className?: string;
  compact?: boolean;
};

export function ImpactBadgeGroup({
  metrics,
  className,
  compact = false,
}: ImpactBadgeGroupProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="list"
      aria-label="Impact metrics"
    >
      {metrics.map((m, i) => (
        <ImpactBadge key={i} metric={m} compact={compact} />
      ))}
    </div>
  );
}
