"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function StatsCard({ title, value, subtitle, icon, className }: StatsCardProps) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        {icon && <span className="text-muted-foreground" aria-hidden>{icon}</span>}
      </CardHeader>
      <CardContent>
        <p className="font-semibold text-foreground text-2xl">{value}</p>
        {subtitle && (
          <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
