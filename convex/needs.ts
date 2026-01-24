import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create or update need data for a charity
 */
export const createNeed = mutation({
  args: {
    charityId: v.id("charities"),
    urgencyScore: v.number(),
    fundingGap: v.number(),
    category: v.string(),
    source: v.union(v.literal("manual"), v.literal("api"), v.literal("calculated")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if need already exists for this charity
    const existing = await ctx.db
      .query("needsData")
      .withIndex("by_charityId", (q) => q.eq("charityId", args.charityId))
      .first();

    const now = Date.now();
    const needData = {
      charityId: args.charityId,
      urgencyScore: Math.max(0, Math.min(100, args.urgencyScore)), // Clamp 0-100
      fundingGap: args.fundingGap,
      category: args.category,
      lastUpdated: now,
      source: args.source,
      metadata: args.metadata ?? {},
    };

    if (existing) {
      await ctx.db.patch(existing._id, needData);
      return existing._id;
    } else {
      return await ctx.db.insert("needsData", needData);
    }
  },
});

/**
 * Update need urgency and funding gap
 */
export const updateNeed = mutation({
  args: {
    needId: v.id("needsData"),
    urgencyScore: v.optional(v.number()),
    fundingGap: v.optional(v.number()),
    category: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const need = await ctx.db.get(args.needId);
    if (!need) {
      throw new Error("Need data not found");
    }

    const updates: {
      urgencyScore?: number;
      fundingGap?: number;
      category?: string;
      metadata?: any;
      lastUpdated: number;
    } = {
      lastUpdated: Date.now(),
    };

    if (args.urgencyScore !== undefined) {
      updates.urgencyScore = Math.max(0, Math.min(100, args.urgencyScore));
    }
    if (args.fundingGap !== undefined) updates.fundingGap = args.fundingGap;
    if (args.category !== undefined) updates.category = args.category;
    if (args.metadata !== undefined) updates.metadata = args.metadata;

    await ctx.db.patch(args.needId, updates);
    return await ctx.db.get(args.needId);
  },
});

/**
 * Get needs for a specific charity
 */
export const getNeedsByCharity = query({
  args: {
    charityId: v.id("charities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("needsData")
      .withIndex("by_charityId", (q) => q.eq("charityId", args.charityId))
      .collect();
  },
});

/**
 * Get all needs for charities in a city
 */
export const getNeedsByCity = query({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all approved charities in the city
    const charities = await ctx.db
      .query("charities")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .collect();

    const approvedCharities = charities.filter((c) => c.verificationStatus === "approved");
    const charityIds = new Set(approvedCharities.map((c) => c._id));

    // Get all needs data
    const allNeeds = await ctx.db.query("needsData").collect();

    // Filter to only needs for charities in this city
    return allNeeds.filter((need) => charityIds.has(need.charityId));
  },
});

/**
 * Get needs with urgency score above threshold
 */
export const getActiveNeeds = query({
  args: {
    urgencyThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.urgencyThreshold ?? 50;
    const allNeeds = await ctx.db.query("needsData").collect();

    return allNeeds.filter((need) => need.urgencyScore >= threshold);
  },
});
