"use client";

import { CharityProjectsMap } from "@/components/map/CharityProjectsMap";
import type { Charity } from "@/lib/types";
import type { Distribution } from "@/lib/types";

type ReportMapProps = {
  charities: Charity[];
  distributions: Distribution[];
  weekId: string;
  height?: number | string;
};

export function ReportMap({
  charities,
  distributions,
  weekId,
  height = 360,
}: ReportMapProps) {
  const weekDistributions = distributions.filter((d) => d.weekId === weekId);

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-foreground text-sm">Map view</h3>
      <CharityProjectsMap
        charities={charities}
        distributions={weekDistributions}
        height={height}
      />
    </div>
  );
}
