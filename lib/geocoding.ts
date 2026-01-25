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
 * Uses a small static map of Canadian cities for MVP; extend with Mapbox/Google API for production.
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

  // MVP: static coordinates for common city/province/postal code patterns
  const staticMap: Record<string, GeocodeResult> = {
    "toronto, on, m5h 2n2": { latitude: 43.6532, longitude: -79.3832, formattedAddress: "Toronto, ON" },
    "vancouver, bc, v6b 1a1": { latitude: 49.2827, longitude: -123.1207, formattedAddress: "Vancouver, BC" },
    "montreal, qc, h3a 0g4": { latitude: 45.5017, longitude: -73.5673, formattedAddress: "Montreal, QC" },
    "calgary, ab, t2p 1j1": { latitude: 51.0447, longitude: -114.0719, formattedAddress: "Calgary, AB" },
    "ottawa, on, k1a 0a6": { latitude: 45.4215, longitude: -75.6972, formattedAddress: "Ottawa, ON" },
    "edmonton, ab, t5j 2r1": { latitude: 53.5461, longitude: -113.4938, formattedAddress: "Edmonton, AB" },
    "winnipeg, mb, r3b 0r3": { latitude: 49.8951, longitude: -97.1384, formattedAddress: "Winnipeg, MB" },
    "quebec city, qc, g1k 4r1": { latitude: 46.8139, longitude: -71.2080, formattedAddress: "Quebec City, QC" },
    "hamilton, on, l8l 4x3": { latitude: 43.2557, longitude: -79.8711, formattedAddress: "Hamilton, ON" },
    "kitchener, on, n2h 5m6": { latitude: 43.4516, longitude: -80.4925, formattedAddress: "Kitchener, ON" },
    "london, on, n6a 3k7": { latitude: 42.9849, longitude: -81.2453, formattedAddress: "London, ON" },
    "halifax, ns, b3h 4r2": { latitude: 44.6488, longitude: -63.5752, formattedAddress: "Halifax, NS" },
    "victoria, bc, v8w 1n6": { latitude: 48.4284, longitude: -123.3656, formattedAddress: "Victoria, BC" },
    "saskatoon, sk, s7k 0j5": { latitude: 52.1332, longitude: -106.6700, formattedAddress: "Saskatoon, SK" },
  };

  const lookup = [address.city, address.state, address.zip].filter(Boolean).join(", ").toLowerCase().replace(/\s+/g, " ").trim();
  let result: GeocodeResult | null = staticMap[lookup] ?? null;
  if (!result && address.city && address.state) {
    const cityState = `${address.city}, ${address.state}`.toLowerCase();
    const found = Object.entries(staticMap).find(([k]) => k.startsWith(cityState));
    if (found) {
      result = found[1];
    }
  }
  if (result) {
    cache.set(key, result);
    return result;
  }

  // Fallback: use province center or Canada center if we have at least province
  const provinceCenters: Record<string, GeocodeResult> = {
    on: { latitude: 50.0000, longitude: -85.0000, formattedAddress: "Ontario" },
    qc: { latitude: 52.9399, longitude: -73.5491, formattedAddress: "Quebec" },
    bc: { latitude: 53.7267, longitude: -127.6476, formattedAddress: "British Columbia" },
    ab: { latitude: 55.0000, longitude: -115.0000, formattedAddress: "Alberta" },
    mb: { latitude: 53.7609, longitude: -98.8139, formattedAddress: "Manitoba" },
    sk: { latitude: 54.0000, longitude: -106.0000, formattedAddress: "Saskatchewan" },
    ns: { latitude: 44.6820, longitude: -63.7443, formattedAddress: "Nova Scotia" },
    nb: { latitude: 46.5653, longitude: -66.4619, formattedAddress: "New Brunswick" },
    nl: { latitude: 53.1355, longitude: -57.6604, formattedAddress: "Newfoundland and Labrador" },
    pe: { latitude: 46.5107, longitude: -63.4168, formattedAddress: "Prince Edward Island" },
  };
  const state = address.state?.toLowerCase().replace(/\s/g, "");
  if (state && provinceCenters[state]) {
    const res = provinceCenters[state];
    cache.set(key, res);
    return res;
  }

  // Default: Canada center
  const fallback: GeocodeResult = { latitude: 56.1304, longitude: -106.3468, formattedAddress: "Canada" };
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

/**
 * Reverse geocode coordinates to address.
 * Uses OpenStreetMap Nominatim API (free, no key required).
 */
export type ReverseGeocodeResult = {
  city: string;
  state: string;
  zipCode: string;
  formattedAddress?: string;
};

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    // Use OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "CommunityInvest/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data.address;

    if (!address) {
      return null;
    }

    // Extract Canadian address components
    // Nominatim uses different field names, so we need to map them
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      "";
    
    // Map Canadian provinces
    const provinceMap: Record<string, string> = {
      ontario: "ON",
      quebec: "QC",
      "british columbia": "BC",
      alberta: "AB",
      manitoba: "MB",
      saskatchewan: "SK",
      "nova scotia": "NS",
      "new brunswick": "NB",
      "newfoundland and labrador": "NL",
      "prince edward island": "PE",
      "northwest territories": "NT",
      nunavut: "NU",
      yukon: "YT",
    };

    const stateRaw =
      address.state ||
      address.province ||
      address.region ||
      "";
    
    const state = stateRaw
      ? provinceMap[stateRaw.toLowerCase()] || stateRaw.toUpperCase().slice(0, 2)
      : "";

    const zipCode = address.postcode || "";

    // Format Canadian postal code (remove spaces, ensure proper format)
    const formattedZip = zipCode
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/([A-Z]\d[A-Z])(\d[A-Z]\d)/, "$1 $2");

    return {
      city: city.trim(),
      state: state.trim(),
      zipCode: formattedZip,
      formattedAddress: data.display_name,
    };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}
