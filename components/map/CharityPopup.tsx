"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Charity } from "@/lib/types";

type CharityPopupProps = {
  charity: Charity;
  amount?: number;
  distributionCount?: number;
  urgencyScore?: number;
  /** Link for "View details"; omit to hide */
  detailHref?: string;
};

export function CharityPopup({
  charity,
  amount,
  distributionCount,
  urgencyScore,
  detailHref,
}: CharityPopupProps) {
  return (
    <div className="min-w-[200px] space-y-2">
      <div>
        <h4 className="font-semibold text-foreground text-sm">{charity.name}</h4>
        {charity.category && (
          <Badge variant="secondary" className="mt-1 text-xs">
            {charity.category}
          </Badge>
        )}
      </div>
      {(amount != null || distributionCount != null) && (
        <div className="text-muted-foreground space-y-0.5 text-xs">
          {amount != null && (
            <p>Total received: ${amount.toLocaleString()}</p>
          )}
          {distributionCount != null && (
            <p>Distributions: {distributionCount}</p>
          )}
        </div>
      )}
      {urgencyScore != null && (
        <p className="text-muted-foreground text-xs">Urgency: {urgencyScore}/100</p>
      )}
      {detailHref && (
        <div className="flex gap-2 pt-1">
          <Button
            render={<Link href={detailHref} />}
            nativeButton={false}
            variant="outline"
            size="xs"
          >
            View details
          </Button>
        </div>
      )}
    </div>
  );
}
