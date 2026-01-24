/**
 * Geocoding utilities for converting addresses to coordinates.
 * MVP: In-memory cache; optionally integrate Mapbox/Google Geocoding API.
 */

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
};

const cache = new Map<string, GeocodeResult>();

/** Build a cache key from address parts */
function cacheKey(parts: { city?: string; state?: string; zip?: string; street?: string }): string {
  return [parts.street, parts.city, parts.state, parts.zip].filter(Boolean).join(", ").toLowerCase();
}

/**
 * Geocode an address to lat/lng.
 * Uses a small static map of US cities for MVP; extend with Mapbox/Google API for production.
 */
export async function geocodeAddress(address: {
  city?: string;
  state?: string;
  zip?: string;
  street?: string;
}): Promise<GeocodeResult | null> {
  const key = cacheKey(address);
  const cached = cache.get(key);
  if (cached) return cached;

  // MVP: static coordinates for common city/state/zip patterns
  const staticMap: Record<string, GeocodeResult> = {
    "new york, ny, 10001": { latitude: 40.7506, longitude: -73.9971, formattedAddress: "New York, NY" },
    "los angeles, ca, 90001": { latitude: 34.0522, longitude: -118.2437, formattedAddress: "Los Angeles, CA" },
    "chicago, il, 60601": { latitude: 41.8781, longitude: -87.6298, formattedAddress: "Chicago, IL" },
    "houston, tx, 77001": { latitude: 29.7604, longitude: -95.3698, formattedAddress: "Houston, TX" },
    "phoenix, az, 85001": { latitude: 33.4484, longitude: -112.074, formattedAddress: "Phoenix, AZ" },
    "philadelphia, pa, 19101": { latitude: 39.9526, longitude: -75.1652, formattedAddress: "Philadelphia, PA" },
    "san antonio, tx, 78201": { latitude: 29.4241, longitude: -98.4936, formattedAddress: "San Antonio, TX" },
    "san diego, ca, 92101": { latitude: 32.7157, longitude: -117.1611, formattedAddress: "San Diego, CA" },
    "dallas, tx, 75201": { latitude: 32.7767, longitude: -96.797, formattedAddress: "Dallas, TX" },
    "austin, tx, 78701": { latitude: 30.2672, longitude: -97.7431, formattedAddress: "Austin, TX" },
    "detroit, mi, 48201": { latitude: 42.3314, longitude: -83.0458, formattedAddress: "Detroit, MI" },
    "boston, ma, 02101": { latitude: 42.3601, longitude: -71.0589, formattedAddress: "Boston, MA" },
    "seattle, wa, 98101": { latitude: 47.6062, longitude: -122.3321, formattedAddress: "Seattle, WA" },
    "denver, co, 80201": { latitude: 39.7392, longitude: -104.9903, formattedAddress: "Denver, CO" },
    "atlanta, ga, 30301": { latitude: 33.749, longitude: -84.388, formattedAddress: "Atlanta, GA" },
  };

  const lookup = [address.city, address.state, address.zip].filter(Boolean).join(", ").toLowerCase().replace(/\s+/g, " ").trim();
  let result = staticMap[lookup] ?? null;
  if (!result && address.city && address.state) {
    const cityState = `${address.city}, ${address.state}`.toLowerCase();
    result = Object.entries(staticMap).find(([k]) => k.startsWith(cityState))?.[1] ?? null;
  }
  if (result) {
    cache.set(key, result);
    return result;
  }

  // Fallback: use state center or US center if we have at least state
  const stateCenters: Record<string, GeocodeResult> = {
    ny: { latitude: 43.2994, longitude: -74.2179, formattedAddress: "New York" },
    ca: { latitude: 36.7783, longitude: -119.4179, formattedAddress: "California" },
    tx: { latitude: 31.9686, longitude: -99.9018, formattedAddress: "Texas" },
    il: { latitude: 40.6331, longitude: -89.3985, formattedAddress: "Illinois" },
    fl: { latitude: 27.6648, longitude: -81.5158, formattedAddress: "Florida" },
  };
  const state = address.state?.toLowerCase().replace(/\s/g, "");
  if (state && stateCenters[state]) {
    const res = stateCenters[state];
    cache.set(key, res);
    return res;
  }

  // Default: US center
  const fallback: GeocodeResult = { latitude: 39.8283, longitude: -98.5795, formattedAddress: "United States" };
  cache.set(key, fallback);
  return fallback;
}

/**
 * Geocode multiple addresses. Returns array of results (null for failed).
 */
export async function geocodeAddresses(
  addresses: Array<{ city?: string; state?: string; zip?: string; street?: string }>
): Promise<(GeocodeResult | null)[]> {
  return Promise.all(addresses.map((a) => geocodeAddress(a)));
}

/** Clear geocode cache (useful for testing). */
export function clearGeocodeCache(): void {
  cache.clear();
}
