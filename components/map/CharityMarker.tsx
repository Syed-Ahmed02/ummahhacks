"use client";

import { MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { CharityPopup } from "./CharityPopup";
import type { Charity } from "@/lib/types";
import { cn } from "@/lib/utils";

type CharityMarkerProps = {
  charity: Charity;
  longitude: number;
  latitude: number;
  amount?: number;
  distributionCount?: number;
  urgencyScore?: number;
  /** Custom marker color based on category/urgency */
  variant?: "default" | "high-urgency" | "medium";
};

export function CharityMarker({
  charity,
  longitude,
  latitude,
  amount,
  distributionCount,
  urgencyScore,
  variant = "default",
}: CharityMarkerProps) {
  const dotColor = {
    default: "bg-primary",
    "high-urgency": "bg-destructive",
    medium: "bg-amber-500",
  }[variant];

  return (
    <MapMarker longitude={longitude} latitude={latitude}>
      <MarkerContent
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-md",
          dotColor
        )}
      />
      <MarkerPopup closeButton>
        <CharityPopup
          charity={charity}
          amount={amount}
          distributionCount={distributionCount}
          urgencyScore={urgencyScore}
        />
      </MarkerPopup>
    </MapMarker>
  );
}
