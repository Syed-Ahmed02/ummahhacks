"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Distribution } from "@/lib/types";

type RecentDistributionsProps = {
  distributions: Distribution[];
  reportWeekId?: string;
};

export function RecentDistributions({
  distributions,
  reportWeekId = "w1",
}: RecentDistributionsProps) {
  const list = distributions.slice(0, 5);

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <span className="font-medium">Recent distributions</span>
        <Link
          href="/reports"
          className="text-primary text-sm font-medium hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border" role="list">
          {list.length === 0 ? (
            <li className="text-muted-foreground py-4 text-sm">No distributions yet.</li>
          ) : (
            list.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3 first:pt-0">
                <div>
                  <p className="font-medium text-sm">{d.charityName}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(d.distributedAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-medium text-sm">${d.amount.toLocaleString()}</p>
              </li>
            ))
          )}
        </ul>
        {list.length > 0 && (
          <Link
            href={`/reports/${reportWeekId}`}
            className="text-primary mt-3 inline-block text-sm font-medium hover:underline"
          >
            View full report →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
