import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create or get a community pool for a location
 */
export const getOrCreatePool = mutation({
  args: {
    city: v.string(),
    province: v.string(),
    postalCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if pool exists for this city/province
    const existing = await ctx.db
      .query("communityPools")
      .withIndex("by_city_province", (q) =>
        q.eq("city", args.city).eq("province", args.province)
      )
      .first();

    if (existing) {
      // Add postal code if not already in list
      if (!existing.postalCodes.includes(args.postalCode)) {
        await ctx.db.patch(existing._id, {
          postalCodes: [...existing.postalCodes, args.postalCode],
          updatedAt: Date.now(),
        });
      }
      return existing._id;
    }

    // Create new pool
    const now = Date.now();
    return await ctx.db.insert("communityPools", {
      city: args.city,
      province: args.province,
      postalCodes: [args.postalCode],
      totalContributors: 0,
      weeklyContributions: 0,
      totalFundsAvailable: 0,
      totalFamiliesHelped: 0,
      totalAmountDistributed: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Get pool by ID
 */
export const getPool = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.poolId);
  },
});

/**
 * Get pool by city and province
 */
export const getPoolByLocation = query({
  args: {
    city: v.string(),
    province: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityPools")
      .withIndex("by_city_province", (q) =>
        q.eq("city", args.city).eq("province", args.province)
      )
      .first();
  },
});

/**
 * Get all pools
 */
export const getAllPools = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("communityPools").collect();
  },
});

/**
 * Update pool after payment
 */
export const deductFromPool = mutation({
  args: {
    poolId: v.id("communityPools"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const pool = await ctx.db.get(args.poolId);
    if (!pool) {
      throw new Error("Pool not found");
    }

    if (pool.totalFundsAvailable < args.amount) {
      throw new Error("Insufficient funds in pool");
    }

    await ctx.db.patch(args.poolId, {
      totalFundsAvailable: pool.totalFundsAvailable - args.amount,
      totalAmountDistributed: pool.totalAmountDistributed + args.amount,
      totalFamiliesHelped: pool.totalFamiliesHelped + 1,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.poolId);
  },
});

/**
 * Get pool stats for dashboard
 */
export const getPoolStats = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    const pool = await ctx.db.get(args.poolId);
    if (!pool) {
      return null;
    }

    return {
      totalFundsAvailable: pool.totalFundsAvailable,
      totalContributors: pool.totalContributors,
      totalFamiliesHelped: pool.totalFamiliesHelped,
      weeklyContributions: pool.weeklyContributions,
      totalAmountDistributed: pool.totalAmountDistributed,
    };
  },
});
