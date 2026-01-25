import type { Charity, Distribution, WeekReport } from "./types";

export const mockCharities: Charity[] = [
  {
    id: "c1",
    name: "Community Food Bank",
    description: "Emergency food distribution",
    city: "Toronto",
    state: "ON",
    zip: "M5H 2N2",
    category: "Food Security",
    status: "approved",
    latitude: 43.6532,
    longitude: -79.3832,
  },
  {
    id: "c2",
    name: "Hope Shelter",
    description: "Emergency housing and support",
    city: "Vancouver",
    state: "BC",
    zip: "V6B 1A1",
    category: "Housing",
    status: "approved",
    latitude: 49.2827,
    longitude: -123.1207,
  },
  {
    id: "c3",
    name: "Neighbor Health Clinic",
    description: "Free primary care",
    city: "Montreal",
    state: "QC",
    zip: "H3A 0G4",
    category: "Healthcare",
    status: "approved",
    latitude: 45.5017,
    longitude: -73.5673,
  },
  {
    id: "c4",
    name: "Youth Learning Center",
    description: "After-school programs",
    city: "Calgary",
    state: "AB",
    zip: "T2P 1J1",
    category: "Education",
    status: "approved",
    latitude: 51.0447,
    longitude: -114.0719,
  },
  {
    id: "c5",
    name: "City Mission",
    description: "Meals and outreach",
    city: "Ottawa",
    state: "ON",
    zip: "K1A 0A6",
    category: "Food Security",
    status: "approved",
    latitude: 45.4215,
    longitude: -75.6972,
  },
];

export const mockDistributions: Distribution[] = [
  { id: "d1", charityId: "c1", charityName: "Community Food Bank", amount: 240, weekId: "w1", distributedAt: "2025-01-20T00:00:00Z" },
  { id: "d2", charityId: "c2", charityName: "Hope Shelter", amount: 180, weekId: "w1", distributedAt: "2025-01-20T00:00:00Z" },
  { id: "d3", charityId: "c3", charityName: "Neighbor Health Clinic", amount: 150, weekId: "w1", distributedAt: "2025-01-20T00:00:00Z" },
  { id: "d4", charityId: "c4", charityName: "Youth Learning Center", amount: 120, weekId: "w1", distributedAt: "2025-01-20T00:00:00Z" },
  { id: "d5", charityId: "c5", charityName: "City Mission", amount: 110, weekId: "w1", distributedAt: "2025-01-20T00:00:00Z" },
  { id: "d6", charityId: "c1", charityName: "Community Food Bank", amount: 250, weekId: "w2", distributedAt: "2025-01-13T00:00:00Z" },
  { id: "d7", charityId: "c2", charityName: "Hope Shelter", amount: 170, weekId: "w2", distributedAt: "2025-01-13T00:00:00Z" },
];

export const mockWeekReports: WeekReport[] = [
  {
    id: "w1",
    weekStart: "2025-01-20",
    weekEnd: "2025-01-26",
    totalDistributed: 800,
    charityCount: 5,
    topCharity: { name: "Community Food Bank", amount: 240 },
  },
  {
    id: "w2",
    weekStart: "2025-01-13",
    weekEnd: "2025-01-19",
    totalDistributed: 420,
    charityCount: 2,
    topCharity: { name: "Community Food Bank", amount: 250 },
  },
];

export const mockStats = {
  totalDonated: 1220,
  charitiesSupported: 5,
  weeksActive: 2,
  livesImpacted: 340,
  mealsProvided: 1200,
};
