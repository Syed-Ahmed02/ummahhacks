import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Record a fund distribution
 */
export const createDistribution = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    charityId: v.id("charities"),
    amount: v.number(),
    distributionDate: v.number(),
    weekStartDate: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const distributionId = await ctx.db.insert("distributions", {
      subscriptionId: args.subscriptionId,
      charityId: args.charityId,
      amount: args.amount,
      distributionDate: args.distributionDate,
      weekStartDate: args.weekStartDate,
      reason: args.reason,
      createdAt: now,
    });

    return distributionId;
  },
});

/**
 * Get all distributions for a subscription
 */
export const getDistributionsBySubscription = query({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("distributions")
      .withIndex("by_subscriptionId", (q) => q.eq("subscriptionId", args.subscriptionId))
      .collect();
  },
});

/**
 * Get all distributions for a user (across all their subscriptions)
 */
export const getDistributionsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all subscriptions for the user
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const subscriptionIds = new Set(subscriptions.map((s) => s._id));

    // Get all distributions
    const allDistributions = await ctx.db.query("distributions").collect();

    // Filter to distributions for this user's subscriptions
    return allDistributions.filter((d) => subscriptionIds.has(d.subscriptionId));
  },
});

/**
 * Get all distributions to a specific charity
 */
export const getDistributionsByCharity = query({
  args: {
    charityId: v.id("charities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("distributions")
      .withIndex("by_charityId", (q) => q.eq("charityId", args.charityId))
      .collect();
  },
});

/**
 * Get distributions for a specific week
 */
export const getDistributionsByWeek = query({
  args: {
    weekStartDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("distributions")
      .withIndex("by_weekStartDate", (q) => q.eq("weekStartDate", args.weekStartDate))
      .collect();
  },
});
