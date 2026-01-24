"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Charity } from "@/lib/types";

type CharityTableProps = {
  charities: Charity[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
};

export function CharityTable({
  charities,
  onApprove,
  onReject,
}: CharityTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Category</th>
            <th className="px-4 py-3 text-left font-medium">Location</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {charities.map((c) => (
            <tr key={c.id} className="border-border border-t">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/charities/${c.id}`}
                  className="font-medium hover:underline"
                >
                  {c.name}
                </Link>
              </td>
              <td className="text-muted-foreground px-4 py-3">{c.category ?? "—"}</td>
              <td className="text-muted-foreground px-4 py-3">
                {[c.city, c.state].filter(Boolean).join(", ") || "—"}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[c.status ?? "pending"] ?? "outline"}>
                  {c.status ?? "pending"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    render={<Link href={`/admin/charities/${c.id}`} />}
                    nativeButton={false}
                    variant="ghost"
                    size="xs"
                  >
                    View
                  </Button>
                  {c.status === "pending" && (
                    <>
                      <Button
                        variant="default"
                        size="xs"
                        onClick={() => onApprove?.(c.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => onReject?.(c.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
