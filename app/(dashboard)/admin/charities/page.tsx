"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CharityTable } from "@/components/admin/CharityTable";
import { mockCharities } from "@/lib/mock-data";
import { Plus } from "lucide-react";
import Link from "next/link";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminCharitiesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = mockCharities.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.category?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus =
      statusFilter === "all" || (c.status ?? "pending") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-foreground text-2xl">Charities</h1>
          <p className="text-muted-foreground mt-1">
            Manage and approve charity applications.
          </p>
        </div>
        <Button render={<Link href="/admin/charities/new" />} nativeButton={false} className="gap-2">
          <Plus className="size-4" /> Create charity
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground text-sm">Filters</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Input
            placeholder="Search by name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <CharityTable charities={filtered} />
    </div>
  );
}
