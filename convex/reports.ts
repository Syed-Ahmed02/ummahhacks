import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a weekly report for a user
 */
export const generateReport = mutation({
  args: {
    userId: v.id("users"),
    weekStartDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all distributions for this user in this week
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const subscriptionIds = new Set(subscriptions.map((s) => s._id));

    // Get distributions for this week
    const weekDistributions = await ctx.db
      .query("distributions")
      .withIndex("by_weekStartDate", (q) => q.eq("weekStartDate", args.weekStartDate))
      .collect();

    // Filter to this user's distributions
    const userDistributions = weekDistributions.filter((d) =>
      subscriptionIds.has(d.subscriptionId)
    );

    // Calculate totals
    const totalDistributed = userDistributions.reduce((sum, d) => sum + d.amount, 0);
    const uniqueCharities = new Set(userDistributions.map((d) => d.charityId));
    const charitiesSupported = uniqueCharities.size;

    // Build distribution breakdown
    const distributionBreakdown = userDistributions.map((d) => ({
      charityId: d.charityId,
      amount: d.amount,
      reason: d.reason,
    }));

    // Check if report already exists
    const existingReports = await ctx.db
      .query("reports")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const existingReport = existingReports.find(
      (r) => r.weekStartDate === args.weekStartDate
    );

    const reportData = {
      userId: args.userId,
      weekStartDate: args.weekStartDate,
      totalDistributed,
      charitiesSupported,
      distributionBreakdown,
      generatedAt: Date.now(),
    };

    if (existingReport) {
      await ctx.db.patch(existingReport._id, reportData);
      return existingReport._id;
    } else {
      return await ctx.db.insert("reports", reportData);
    }
  },
});

/**
 * Get all reports for a user
 */
export const getUserReports = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get a specific report
 */
export const getReport = query({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reportId);
  },
});

/**
 * Get user's latest report
 */
export const getLatestReport = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (reports.length === 0) {
      return null;
    }

    // Sort by generatedAt descending and return the most recent
    return reports.sort((a, b) => b.generatedAt - a.generatedAt)[0];
  },
});
