/** Charity record (matches Convex schema when available) */
export type Charity = {
  id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  zip?: string;
  street?: string;
  category?: string;
  status?: "pending" | "approved" | "rejected";
  latitude?: number;
  longitude?: number;
  website?: string;
  contactEmail?: string;
};

/** Distribution of funds to a charity for a given week */
export type Distribution = {
  id: string;
  charityId: string;
  charityName: string;
  amount: number;
  weekId: string;
  distributedAt: string;
};

/** Week report summary */
export type WeekReport = {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalDistributed: number;
  charityCount: number;
  topCharity?: { name: string; amount: number };
};
