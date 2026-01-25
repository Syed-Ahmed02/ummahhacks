import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a weekly impact report for a pool
 */
export const generateReport = mutation({
  args: {
    poolId: v.id("communityPools"),
    weekStartDate: v.number(),
    weekEndDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all payments in this week for this pool
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    const weekPayments = payments.filter(
      (p) =>
        p.processedAt >= args.weekStartDate && p.processedAt <= args.weekEndDate
    );

    // Get bill details for each payment
    const billsPaid: { utilityType: string; amount: number; city: string }[] =
      [];
    for (const payment of weekPayments) {
      const bill = await ctx.db.get(payment.billSubmissionId);
      if (bill) {
        const user = await ctx.db.get(bill.userId);
        billsPaid.push({
          utilityType: bill.utilityType,
          amount: payment.amount,
          city: user?.city ?? "Unknown",
        });
      }
    }

    // Get contributor count
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    const activeContributors = subscriptions.filter(
      (s) => s.status === "active"
    ).length;

    // Calculate totals
    const totalContributions = weekPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalFamiliesHelped = weekPayments.length;

    // Check if report already exists
    const existingReports = await ctx.db
      .query("impactReports")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    const existingReport = existingReports.find(
      (r) => r.weekStartDate === args.weekStartDate
    );

    const reportData = {
      poolId: args.poolId,
      weekStartDate: args.weekStartDate,
      weekEndDate: args.weekEndDate,
      totalContributions,
      totalFamiliesHelped,
      billsPaid,
      contributorCount: activeContributors,
      generatedAt: Date.now(),
    };

    if (existingReport) {
      await ctx.db.patch(existingReport._id, reportData);
      return existingReport._id;
    } else {
      return await ctx.db.insert("impactReports", reportData);
    }
  },
});

/**
 * Get impact report by ID
 */
export const getReport = query({
  args: {
    reportId: v.id("impactReports"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reportId);
  },
});

/**
 * Get all reports for a pool
 */
export const getPoolReports = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("impactReports")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    // Sort by week start date descending
    return reports.sort((a, b) => b.weekStartDate - a.weekStartDate);
  },
});

/**
 * Get latest report for a pool
 */
export const getLatestReport = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("impactReports")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    if (reports.length === 0) {
      return null;
    }

    // Return most recent by week start date
    return reports.sort((a, b) => b.weekStartDate - a.weekStartDate)[0];
  },
});

/**
 * Get aggregate impact stats across all time
 */
export const getAggregateStats = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    const pool = await ctx.db.get(args.poolId);
    if (!pool) {
      return null;
    }

    const reports = await ctx.db
      .query("impactReports")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    // Calculate aggregate stats from reports
    const totalWeeksActive = reports.length;

    // Utility type breakdown
    const utilityBreakdown: Record<string, number> = {};
    for (const report of reports) {
      for (const bill of report.billsPaid) {
        utilityBreakdown[bill.utilityType] =
          (utilityBreakdown[bill.utilityType] ?? 0) + bill.amount;
      }
    }

    return {
      totalFundsDistributed: pool.totalAmountDistributed,
      totalFamiliesHelped: pool.totalFamiliesHelped,
      totalContributors: pool.totalContributors,
      currentPoolBalance: pool.totalFundsAvailable,
      totalWeeksActive,
      utilityBreakdown,
    };
  },
});

/**
 * Get this week's impact for a pool
 */
export const getThisWeeksImpact = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    // Calculate this week's start (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartTimestamp = weekStart.getTime();

    // Get payments this week
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    const thisWeekPayments = payments.filter(
      (p) => p.processedAt >= weekStartTimestamp
    );

    const totalDistributed = thisWeekPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    const familiesHelped = thisWeekPayments.length;

    return {
      totalDistributed,
      familiesHelped,
      weekStartDate: weekStartTimestamp,
    };
  },
});
