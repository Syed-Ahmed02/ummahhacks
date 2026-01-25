import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new one-time donation record
 */
export const createOneTimeDonation = mutation({
  args: {
    userId: v.id("users"),
    poolId: v.id("communityPools"),
    amount: v.number(),
    stripePaymentIntentId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if donation already exists
    const existing = await ctx.db
      .query("oneTimeDonations")
      .withIndex("by_stripePaymentIntentId", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .first();

    if (existing) {
      throw new Error("Donation with this Payment Intent ID already exists");
    }

    const donationId = await ctx.db.insert("oneTimeDonations", {
      userId: args.userId,
      poolId: args.poolId,
      amount: args.amount,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCustomerId: args.stripeCustomerId,
      status: "pending",
      createdAt: Date.now(),
    });

    return donationId;
  },
});

/**
 * Mark a one-time donation as succeeded and update pool funds
 */
export const recordOneTimeDonationSuccess = mutation({
  args: {
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("oneTimeDonations")
      .withIndex("by_stripePaymentIntentId", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .first();

    if (!donation) {
      throw new Error("Donation not found");
    }

    // Update donation status
    await ctx.db.patch(donation._id, {
      status: "succeeded",
    });

    // Update pool funds
    const pool = await ctx.db.get(donation.poolId);
    if (pool) {
      await ctx.db.patch(donation.poolId, {
        totalFundsAvailable: pool.totalFundsAvailable + donation.amount,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.get(donation._id);
  },
});

/**
 * Mark a one-time donation as failed
 */
export const recordOneTimeDonationFailure = mutation({
  args: {
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("oneTimeDonations")
      .withIndex("by_stripePaymentIntentId", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .first();

    if (!donation) {
      throw new Error("Donation not found");
    }

    await ctx.db.patch(donation._id, {
      status: "failed",
    });

    return await ctx.db.get(donation._id);
  },
});

/**
 * Get one-time donation by Stripe Payment Intent ID
 */
export const getOneTimeDonationByPaymentIntentId = query({
  args: {
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("oneTimeDonations")
      .withIndex("by_stripePaymentIntentId", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .first();
  },
});

/**
 * Get all one-time donations for a user
 */
export const getUserOneTimeDonations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("oneTimeDonations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get all one-time donations for a pool
 */
export const getPoolOneTimeDonations = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("oneTimeDonations")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();
  },
});

/**
 * Get user's total one-time donation amount
 */
export const getUserTotalOneTimeDonations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const donations = await ctx.db
      .query("oneTimeDonations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return donations
      .filter((d) => d.status === "succeeded")
      .reduce((sum, d) => sum + d.amount, 0);
  },
});
