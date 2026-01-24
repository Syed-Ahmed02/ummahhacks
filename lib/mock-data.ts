import type { Charity, Distribution, WeekReport } from "./types";

export const mockCharities: Charity[] = [
  {
    id: "c1",
    name: "Community Food Bank",
    description: "Emergency food distribution",
    city: "New York",
    state: "NY",
    zip: "10001",
    category: "Food Security",
    status: "approved",
    latitude: 40.7506,
    longitude: -73.9971,
  },
  {
    id: "c2",
    name: "Hope Shelter",
    description: "Emergency housing and support",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
    category: "Housing",
    status: "approved",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: "c3",
    name: "Neighbor Health Clinic",
    description: "Free primary care",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    category: "Healthcare",
    status: "approved",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: "c4",
    name: "Youth Learning Center",
    description: "After-school programs",
    city: "Houston",
    state: "TX",
    zip: "77001",
    category: "Education",
    status: "approved",
    latitude: 29.7604,
    longitude: -95.3698,
  },
  {
    id: "c5",
    name: "City Mission",
    description: "Meals and outreach",
    city: "Philadelphia",
    state: "PA",
    zip: "19101",
    category: "Food Security",
    status: "approved",
    latitude: 39.9526,
    longitude: -75.1652,
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
