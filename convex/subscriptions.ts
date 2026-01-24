import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new subscription record
 */
export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    startDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (existing) {
      throw new Error("Subscription with this Stripe ID already exists");
    }

    const now = Date.now();
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      amount: args.amount,
      status: "active",
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeCustomerId: args.stripeCustomerId,
      startDate: args.startDate,
      lastDistributionDate: null,
      createdAt: now,
      updatedAt: now,
    });

    return subscriptionId;
  },
});

/**
 * Update subscription status or amount
 */
export const updateSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    amount: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled"))),
    lastDistributionDate: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const updates: {
      amount?: number;
      status?: "active" | "paused" | "cancelled";
      lastDistributionDate?: number | null;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.status !== undefined) updates.status = args.status;
    if (args.lastDistributionDate !== undefined)
      updates.lastDistributionDate = args.lastDistributionDate;

    await ctx.db.patch(args.subscriptionId, updates);
    return await ctx.db.get(args.subscriptionId);
  },
});

/**
 * Get subscription by Stripe subscription ID
 */
export const getSubscriptionByStripeId = query({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();
  },
});

/**
 * Get all subscriptions for a user
 */
export const getUserSubscriptions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get all active subscriptions in a city
 */
export const getActiveSubscriptionsByCity = query({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    // First get all users in the city
    const users = await ctx.db
      .query("users")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .collect();

    if (users.length === 0) {
      return [];
    }

    // Get all active subscriptions for these users
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filter subscriptions to only those belonging to users in the city
    const userIds = new Set(users.map((u) => u._id));
    return subscriptions.filter((sub) => userIds.has(sub.userId));
  },
});

/**
 * Cancel a subscription
 */
export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await ctx.db.patch(args.subscriptionId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.subscriptionId);
  },
});
