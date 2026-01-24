"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Map as MapView, MapClusterLayer, MapControls, MapPopup } from "@/components/ui/map";
import { LoadingOverlay } from "@/components/shared/LoadingSpinner";
import { CharityPopup } from "./CharityPopup";
import { geocodeAddress } from "@/lib/geocoding";
import type { Charity } from "@/lib/types";
import type { Distribution } from "@/lib/types";
import { cn } from "@/lib/utils";

const MapClient = dynamic(() => Promise.resolve(MapView), { ssr: false });

export type CharityWithCoords = Charity & {
  latitude: number;
  longitude: number;
};

type CharityProjectsMapProps = {
  charities: Charity[];
  distributions?: Distribution[];
  timeRange?: { start: string; end: string };
  onCharityClick?: (charity: Charity) => void;
  /** Optional href for "View details" in popup (e.g. /admin/charities/:id) */
  getDetailHref?: (charity: Charity) => string | undefined;
  height?: number | string;
  className?: string;
};

function buildGeoJson(
  items: Array<{ id: string; name: string; latitude: number; longitude: number; category?: string; amount?: number }>
): GeoJSON.FeatureCollection<GeoJSON.Point, { id: string; name: string; category?: string; amount?: number }> {
  return {
    type: "FeatureCollection",
    features: items.map((c) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [c.longitude, c.latitude] as [number, number],
      },
      properties: {
        id: c.id,
        name: c.name,
        category: c.category,
        amount: c.amount,
      },
    })),
  };
}

function defaultCenter(): [number, number] {
  return [-98.5795, 39.8283];
}

export function CharityProjectsMap({
  charities,
  distributions = [],
  timeRange,
  onCharityClick,
  getDetailHref,
  height = 400,
  className,
}: CharityProjectsMapProps) {
  const [withCoords, setWithCoords] = useState<CharityWithCoords[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{
    charity: Charity;
    lng: number;
    lat: number;
    amount?: number;
    distCount?: number;
  } | null>(null);

  const geoJson = useMemo(() => {
    if (!withCoords?.length) return null;
    const items = withCoords.map((c) => {
      const dists = distributions.filter((d) => d.charityId === c.id);
      const amount = dists.reduce((s, d) => s + d.amount, 0);
      return {
        id: c.id,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        category: c.category,
        amount: amount || undefined,
      };
    });
    return buildGeoJson(items);
  }, [withCoords, distributions]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const run = async () => {
      const results: CharityWithCoords[] = [];
      for (const c of charities) {
        if (cancelled) return;
        if (c.latitude != null && c.longitude != null) {
          results.push({ ...c, latitude: c.latitude, longitude: c.longitude });
          continue;
        }
        const res = await geocodeAddress({
          city: c.city,
          state: c.state,
          zip: c.zip,
          street: c.street,
        });
        if (res) results.push({ ...c, latitude: res.latitude, longitude: res.longitude });
      }
      if (!cancelled) {
        setWithCoords(results);
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [charities]);

  const handlePointClick = useCallback(
    (feature: GeoJSON.Feature<GeoJSON.Point, { id: string; name: string; category?: string; amount?: number }>, coords: [number, number]) => {
      const id = feature.properties?.id;
      const charity = withCoords?.find((c) => c.id === id) ?? charities.find((c) => c.id === id);
      if (!charity) return;
      const dists = distributions.filter((d) => d.charityId === id);
      const amount = dists.reduce((s, d) => s + d.amount, 0);
      setSelected({
        charity: { ...charity, latitude: coords[1], longitude: coords[0] },
        lng: coords[0],
        lat: coords[1],
        amount: amount || undefined,
        distCount: dists.length || undefined,
      });
      onCharityClick?.(charity);
    },
    [charities, withCoords, distributions, onCharityClick]
  );

  const center = useMemo((): [number, number] => {
    if (!withCoords?.length) return defaultCenter();
    const lng = withCoords.reduce((s, c) => s + c.longitude, 0) / withCoords.length;
    const lat = withCoords.reduce((s, c) => s + c.latitude, 0) / withCoords.length;
    return [lng, lat];
  }, [withCoords]);

  if (loading && !withCoords?.length) {
    return (
      <div className={cn("relative w-full overflow-hidden rounded-lg border border-border", className)} style={{ height }}>
        <LoadingOverlay message="Loading map…" />
      </div>
    );
  }

  if (!geoJson || !withCoords?.length) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        <p className="text-sm">No charity locations to display.</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border border-border", className)} style={{ height }}>
      <MapClient
        center={center}
        zoom={3}
      >
        <MapClusterLayer
          data={geoJson}
          clusterColors={["#22c55e", "#eab308", "#ef4444"]}
          pointColor="#16a34a"
          onPointClick={handlePointClick}
        />
        {selected && (
          <MapPopup
            longitude={selected.lng}
            latitude={selected.lat}
            onClose={() => setSelected(null)}
            closeButton
          >
            <CharityPopup
              charity={selected.charity}
              amount={selected.amount}
              distributionCount={selected.distCount}
              detailHref={getDetailHref?.(selected.charity)}
            />
          </MapPopup>
        )}
        <MapControls showZoom showLocate />
      </MapClient>
    </div>
  );
}
