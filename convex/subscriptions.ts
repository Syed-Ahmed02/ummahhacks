import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new subscription record (contribution)
 */
export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    poolId: v.id("communityPools"),
    weeklyAmount: v.number(),
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
      poolId: args.poolId,
      weeklyAmount: args.weeklyAmount,
      status: "active",
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeCustomerId: args.stripeCustomerId,
      totalContributed: 0,
      startDate: args.startDate,
      createdAt: now,
      updatedAt: now,
    });

    // Update pool contributor count
    const pool = await ctx.db.get(args.poolId);
    if (pool) {
      await ctx.db.patch(args.poolId, {
        totalContributors: pool.totalContributors + 1,
        weeklyContributions: pool.weeklyContributions + args.weeklyAmount,
        updatedAt: now,
      });
    }

    return subscriptionId;
  },
});

/**
 * Update subscription status or amount
 */
export const updateSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    weeklyAmount: v.optional(v.number()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled"))
    ),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const updates: {
      weeklyAmount?: number;
      status?: "active" | "paused" | "cancelled";
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    // Track old values for pool update
    const oldAmount = subscription.weeklyAmount;
    const wasActive = subscription.status === "active";

    if (args.weeklyAmount !== undefined) updates.weeklyAmount = args.weeklyAmount;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.subscriptionId, updates);

    // Update pool if amount or status changed
    const pool = await ctx.db.get(subscription.poolId);
    if (pool) {
      const newAmount = args.weeklyAmount ?? oldAmount;
      const isActive = (args.status ?? subscription.status) === "active";

      let poolUpdates: {
        weeklyContributions?: number;
        totalContributors?: number;
        updatedAt: number;
      } = { updatedAt: Date.now() };

      // Handle amount change for active subscriptions
      if (wasActive && isActive && args.weeklyAmount !== undefined) {
        poolUpdates.weeklyContributions =
          pool.weeklyContributions - oldAmount + newAmount;
      }

      // Handle status change
      if (wasActive && !isActive) {
        poolUpdates.totalContributors = pool.totalContributors - 1;
        poolUpdates.weeklyContributions = pool.weeklyContributions - oldAmount;
      } else if (!wasActive && isActive) {
        poolUpdates.totalContributors = pool.totalContributors + 1;
        poolUpdates.weeklyContributions = pool.weeklyContributions + newAmount;
      }

      await ctx.db.patch(subscription.poolId, poolUpdates);
    }

    return await ctx.db.get(args.subscriptionId);
  },
});

/**
 * Record a contribution (called after successful Stripe payment)
 */
export const recordContribution = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Update subscription total
    await ctx.db.patch(args.subscriptionId, {
      totalContributed: subscription.totalContributed + args.amount,
      updatedAt: Date.now(),
    });

    // Update pool funds
    const pool = await ctx.db.get(subscription.poolId);
    if (pool) {
      await ctx.db.patch(subscription.poolId, {
        totalFundsAvailable: pool.totalFundsAvailable + args.amount,
        updatedAt: Date.now(),
      });
    }

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
 * Get active subscription for a user
 */
export const getActiveSubscription = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return subscriptions.find((s) => s.status === "active") ?? null;
  },
});

/**
 * Get all subscriptions in a pool
 */
export const getPoolSubscriptions = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();
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

    const wasActive = subscription.status === "active";

    await ctx.db.patch(args.subscriptionId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    // Update pool if subscription was active
    if (wasActive) {
      const pool = await ctx.db.get(subscription.poolId);
      if (pool) {
        await ctx.db.patch(subscription.poolId, {
          totalContributors: pool.totalContributors - 1,
          weeklyContributions:
            pool.weeklyContributions - subscription.weeklyAmount,
          updatedAt: Date.now(),
        });
      }
    }

    return await ctx.db.get(args.subscriptionId);
  },
});
