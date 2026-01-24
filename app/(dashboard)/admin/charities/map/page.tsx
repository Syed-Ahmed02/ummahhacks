"use client";

import { CharityProjectsMap } from "@/components/map/CharityProjectsMap";
import { mockCharities, mockDistributions } from "@/lib/mock-data";

export default function AdminCharityMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Charity map</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all approved charities. Use filters on the charities list to narrow by status or category.
        </p>
      </div>
      <CharityProjectsMap
        charities={mockCharities}
        distributions={mockDistributions}
        height={500}
        getDetailHref={(c) => `/admin/charities/${c.id}`}
      />
    </div>
  );
}
