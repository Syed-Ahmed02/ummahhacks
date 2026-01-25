import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Process a payment for an approved bill
 */
export const processPayment = mutation({
  args: {
    billSubmissionId: v.id("billSubmissions"),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("cheque"),
      v.literal("bank_transfer"),
      v.literal("online")
    ),
    processedBy: v.id("users"),
    confirmationNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bill = await ctx.db.get(args.billSubmissionId);
    if (!bill) {
      throw new Error("Bill submission not found");
    }

    if (bill.paymentStatus !== "approved") {
      throw new Error("Bill is not approved for payment");
    }

    const pool = await ctx.db.get(bill.poolId);
    if (!pool) {
      throw new Error("Pool not found");
    }

    if (pool.totalFundsAvailable < args.amount) {
      throw new Error("Insufficient funds in pool");
    }

    const now = Date.now();

    // Create payment record
    const paymentId = await ctx.db.insert("payments", {
      billSubmissionId: args.billSubmissionId,
      poolId: bill.poolId,
      amount: args.amount,
      utilityProvider: bill.utilityProvider,
      paymentMethod: args.paymentMethod,
      processedBy: args.processedBy,
      processedAt: now,
      confirmationNumber: args.confirmationNumber ?? null,
      createdAt: now,
    });

    // Update bill submission
    await ctx.db.patch(args.billSubmissionId, {
      paymentStatus: "paid",
      paymentAmount: args.amount,
      paidAt: now,
      paymentReference: args.confirmationNumber ?? null,
      updatedAt: now,
    });

    // Update pool
    await ctx.db.patch(bill.poolId, {
      totalFundsAvailable: pool.totalFundsAvailable - args.amount,
      totalAmountDistributed: pool.totalAmountDistributed + args.amount,
      totalFamiliesHelped: pool.totalFamiliesHelped + 1,
      updatedAt: now,
    });

    return paymentId;
  },
});

/**
 * Get payment by ID
 */
export const getPayment = query({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

/**
 * Get payment for a bill
 */
export const getPaymentByBill = query({
  args: {
    billSubmissionId: v.id("billSubmissions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_billSubmissionId", (q) =>
        q.eq("billSubmissionId", args.billSubmissionId)
      )
      .first();
  },
});

/**
 * Get all payments for a pool
 */
export const getPoolPayments = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();
  },
});

/**
 * Get recent payments (for admin dashboard)
 */
export const getRecentPayments = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db.query("payments").collect();

    // Sort by processed date descending
    payments.sort((a, b) => b.processedAt - a.processedAt);

    const limit = args.limit ?? 20;
    return payments.slice(0, limit);
  },
});

/**
 * Get payment statistics for a pool
 */
export const getPaymentStats = query({
  args: {
    poolId: v.id("communityPools"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let payments = await ctx.db
      .query("payments")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    // Filter by date range if provided
    if (args.startDate) {
      payments = payments.filter((p) => p.processedAt >= args.startDate!);
    }
    if (args.endDate) {
      payments = payments.filter((p) => p.processedAt <= args.endDate!);
    }

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = payments.length;

    // Group by payment method
    const byMethod = payments.reduce(
      (acc, p) => {
        acc[p.paymentMethod] = (acc[p.paymentMethod] ?? 0) + p.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by utility provider
    const byProvider = payments.reduce(
      (acc, p) => {
        acc[p.utilityProvider] = (acc[p.utilityProvider] ?? 0) + p.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalAmount,
      totalPayments,
      byMethod,
      byProvider,
    };
  },
});
