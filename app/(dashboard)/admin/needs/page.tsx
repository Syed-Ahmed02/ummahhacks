"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NeedsForm } from "@/components/admin/NeedsForm";
import { mockCharities } from "@/lib/mock-data";
import type { NeedsEntry } from "@/components/admin/NeedsForm";

export default function AdminNeedsPage() {
  const handleSubmit = (data: NeedsEntry) => {
    console.log("Needs entry:", data);
    // Wire to Convex when available
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Needs data</h1>
        <p className="text-muted-foreground mt-1">
          Manage urgency, funding gaps, and categories for distribution decisions.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground text-sm">Filters</h2>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Filter by charity or city…"
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-medium text-foreground mb-4">Manual entry</h2>
          <NeedsForm
            charities={mockCharities}
            onSubmit={handleSubmit}
          />
        </div>
        <div>
          <h2 className="font-medium text-foreground mb-4">Needs list</h2>
          <Card className="border-border">
            <CardContent className="py-6">
              <p className="text-muted-foreground text-sm">
                Needs entries will appear here. Bulk import coming later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
