/**
 * Canadian localization constants and utilities
 */

// Canadian provinces and territories
export const CANADIAN_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

export type ProvinceCode = (typeof CANADIAN_PROVINCES)[number]["code"];

// Province code to name mapping
export const PROVINCE_MAP: Record<ProvinceCode, string> = Object.fromEntries(
  CANADIAN_PROVINCES.map((p) => [p.code, p.name])
) as Record<ProvinceCode, string>;

// Province name to code mapping (lowercase for lookup)
export const PROVINCE_NAME_TO_CODE: Record<string, ProvinceCode> = {
  alberta: "AB",
  "british columbia": "BC",
  manitoba: "MB",
  "new brunswick": "NB",
  "newfoundland and labrador": "NL",
  "nova scotia": "NS",
  "northwest territories": "NT",
  nunavut: "NU",
  ontario: "ON",
  "prince edward island": "PE",
  quebec: "QC",
  saskatchewan: "SK",
  yukon: "YT",
};

/**
 * Canadian postal code format: A1A 1A1
 * - First character: Letter (A-Z, excluding D, F, I, O, Q, U)
 * - Second character: Digit (0-9)
 * - Third character: Letter (A-Z, excluding D, F, I, O, Q, U)
 * - Space (optional)
 * - Fourth character: Digit (0-9)
 * - Fifth character: Letter (A-Z, excluding D, F, I, O, Q, U)
 * - Sixth character: Digit (0-9)
 */
export const CANADIAN_POSTAL_CODE_REGEX = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

/**
 * Validate a Canadian postal code
 */
export function validatePostalCode(postalCode: string): boolean {
  return CANADIAN_POSTAL_CODE_REGEX.test(postalCode.trim());
}

/**
 * Format a Canadian postal code (A1A 1A1)
 */
export function formatPostalCode(postalCode: string): string {
  const cleaned = postalCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length !== 6) return postalCode;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
}

/**
 * Format currency in CAD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

/**
 * Format currency with explicit CAD label (for international contexts)
 */
export function formatCurrencyExplicit(amount: number): string {
  return `${formatCurrency(amount)} CAD`;
}

/**
 * Common Canadian utility providers by province
 */
export const UTILITY_PROVIDERS: Record<ProvinceCode, {
  electric: string[];
  gas: string[];
  water: string[];
  heating: string[];
}> = {
  ON: {
    electric: ["Hydro One", "Toronto Hydro", "Ottawa Hydro", "London Hydro", "Alectra Utilities", "Enwin Utilities"],
    gas: ["Enbridge Gas"],
    water: ["Municipal Water Services"],
    heating: ["Enbridge Gas", "Superior Propane"],
  },
  BC: {
    electric: ["BC Hydro", "FortisBC"],
    gas: ["FortisBC"],
    water: ["Municipal Water Services"],
    heating: ["FortisBC", "Superior Propane"],
  },
  AB: {
    electric: ["ATCO Electric", "ENMAX", "EPCOR", "FortisAlberta"],
    gas: ["ATCO Gas", "Direct Energy"],
    water: ["EPCOR Water"],
    heating: ["ATCO Gas", "Direct Energy"],
  },
  QC: {
    electric: ["Hydro-Quebec"],
    gas: ["Energir"],
    water: ["Municipal Water Services"],
    heating: ["Energir", "Superior Propane"],
  },
  MB: {
    electric: ["Manitoba Hydro"],
    gas: ["Manitoba Hydro"],
    water: ["Municipal Water Services"],
    heating: ["Manitoba Hydro"],
  },
  SK: {
    electric: ["SaskPower"],
    gas: ["SaskEnergy"],
    water: ["Municipal Water Services"],
    heating: ["SaskEnergy"],
  },
  NS: {
    electric: ["Nova Scotia Power"],
    gas: ["Heritage Gas"],
    water: ["Halifax Water"],
    heating: ["Heritage Gas", "Irving Energy"],
  },
  NB: {
    electric: ["NB Power"],
    gas: ["Enbridge Gas New Brunswick"],
    water: ["Municipal Water Services"],
    heating: ["Irving Energy"],
  },
  NL: {
    electric: ["Newfoundland Power", "Newfoundland and Labrador Hydro"],
    gas: [],
    water: ["Municipal Water Services"],
    heating: ["Irving Energy", "Superior Propane"],
  },
  PE: {
    electric: ["Maritime Electric"],
    gas: [],
    water: ["Municipal Water Services"],
    heating: ["Irving Energy", "Superior Propane"],
  },
  NT: {
    electric: ["Northwest Territories Power Corporation"],
    gas: [],
    water: ["Municipal Water Services"],
    heating: ["Superior Propane"],
  },
  NU: {
    electric: ["Qulliq Energy Corporation"],
    gas: [],
    water: ["Municipal Water Services"],
    heating: ["Qulliq Energy Corporation"],
  },
  YT: {
    electric: ["ATCO Electric Yukon", "Yukon Energy"],
    gas: [],
    water: ["Municipal Water Services"],
    heating: ["Superior Propane"],
  },
};

/**
 * Get all utility providers for a province (flattened list)
 */
export function getProvidersForProvince(provinceCode: ProvinceCode): string[] {
  const providers = UTILITY_PROVIDERS[provinceCode];
  if (!providers) return [];
  
  const all = new Set<string>();
  Object.values(providers).forEach((list) => {
    list.forEach((p) => all.add(p));
  });
  
  return Array.from(all).sort();
}

/**
 * Get all utility providers across Canada (for AI verification context)
 */
export function getAllUtilityProviders(): string[] {
  const all = new Set<string>();
  
  Object.values(UTILITY_PROVIDERS).forEach((province) => {
    Object.values(province).forEach((list) => {
      list.forEach((p) => all.add(p));
    });
  });
  
  return Array.from(all).sort();
}

/**
 * Utility types
 */
export const UTILITY_TYPES = [
  { value: "electric", label: "Electric" },
  { value: "water", label: "Water" },
  { value: "gas", label: "Gas" },
  { value: "heating", label: "Heating" },
] as const;

export type UtilityType = (typeof UTILITY_TYPES)[number]["value"];

/**
 * Weekly contribution amounts (in CAD)
 */
export const CONTRIBUTION_AMOUNTS = [5, 10, 15, 20, 25, 50] as const;

export const DEFAULT_CONTRIBUTION_AMOUNT = 10;

export const MIN_CONTRIBUTION_AMOUNT = 5;

export const MAX_CONTRIBUTION_AMOUNT = 100;

/**
 * Recipient assistance limits
 */
export const MAX_ASSISTANCE_PER_YEAR = 3;

export const ASSISTANCE_WINDOW_DAYS = 365;
