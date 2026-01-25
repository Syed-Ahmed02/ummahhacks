"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface LocationBadgeProps {
  city?: string;
  province?: string;
  isNearUser?: boolean;
  showLocation?: boolean;
}

/**
 * Display location badge for campaigns
 * Shows "Near you" if within user's area, otherwise shows city/province
 */
export function LocationBadge({
  city,
  province,
  isNearUser = false,
  showLocation = true,
}: LocationBadgeProps) {
  if (!showLocation || (!city && !isNearUser)) {
    return null;
  }

  let label = "Your community";
  if (isNearUser) {
    label = "Near you";
  } else if (city && province) {
    label = `${city}, ${province}`;
  } else if (city) {
    label = city;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 border border-blue-200">
      <MapPin className="size-4 text-blue-600" />
      <span>{label}</span>
    </div>
  );
}
