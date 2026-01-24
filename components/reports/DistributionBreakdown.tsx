"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Distribution } from "@/lib/types";

type DistributionBreakdownProps = {
  distributions: Distribution[];
  /** Optional AI explanation per charity */
  explanations?: Record<string, string>;
};

export function DistributionBreakdown({
  distributions,
  explanations = {},
}: DistributionBreakdownProps) {
  const total = distributions.reduce((s, d) => s + d.amount, 0);

  return (
    <Card className="border-border">
      <CardHeader>
        <h3 className="font-medium text-foreground">Distribution breakdown</h3>
        <p className="text-muted-foreground text-sm">
          Total: ${total.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4" role="list">
          {distributions.map((d) => (
            <li key={d.id} className="border-border border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{d.charityName}</p>
                  <p className="font-semibold text-primary">
                    ${d.amount.toLocaleString()}
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">
                  {total > 0 ? Math.round((d.amount / total) * 100) : 0}%
                </span>
              </div>
              {explanations[d.charityId] && (
                <p className="text-muted-foreground mt-2 text-sm">
                  {explanations[d.charityId]}
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
