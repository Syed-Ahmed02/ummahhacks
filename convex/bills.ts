import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit a new bill for verification
 */
export const submitBill = mutation({
  args: {
    userId: v.id("users"),
    poolId: v.id("communityPools"),
    utilityType: v.union(
      v.literal("electric"),
      v.literal("water"),
      v.literal("gas"),
      v.literal("heating")
    ),
    utilityProvider: v.string(),
    accountNumber: v.string(),
    amountDue: v.number(),
    originalDueDate: v.number(),
    shutoffDate: v.number(),
    documentStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Check eligibility (rolling 12-month window)
    const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

    const paidBills = await ctx.db
      .query("billSubmissions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const recentPaidBills = paidBills.filter(
      (b) => b.paymentStatus === "paid" && b.paidAt && b.paidAt > twelveMonthsAgo
    );

    if (recentPaidBills.length >= 3) {
      throw new Error(
        "Maximum assistance limit reached. You can receive help up to 3 times per year."
      );
    }

    const now = Date.now();
    return await ctx.db.insert("billSubmissions", {
      userId: args.userId,
      poolId: args.poolId,
      utilityType: args.utilityType,
      utilityProvider: args.utilityProvider,
      accountNumber: args.accountNumber,
      amountDue: args.amountDue,
      originalDueDate: args.originalDueDate,
      shutoffDate: args.shutoffDate,
      documentStorageId: args.documentStorageId,
      verificationStatus: "pending",
      aiConfidenceScore: null,
      aiAnalysis: null,
      adminReviewedBy: null,
      adminReviewedAt: null,
      adminNotes: null,
      paymentStatus: "pending",
      paymentAmount: null,
      paidAt: null,
      paymentReference: null,
      assistanceCountThisYear: recentPaidBills.length,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update verification status after AI analysis
 */
export const updateVerificationStatus = mutation({
  args: {
    billId: v.id("billSubmissions"),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("analyzing"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("needs_review")
    ),
    aiConfidenceScore: v.union(v.number(), v.null()),
    aiAnalysis: v.union(
      v.object({
        authenticityScore: v.number(),
        urgencyLevel: v.union(
          v.literal("critical"),
          v.literal("high"),
          v.literal("medium")
        ),
        extractedData: v.object({
          provider: v.string(),
          amount: v.number(),
          dueDate: v.string(),
          accountNumber: v.string(),
          customerName: v.string(),
          serviceAddress: v.string(),
        }),
        flaggedIssues: v.array(v.string()),
        recommendation: v.union(
          v.literal("approve"),
          v.literal("reject"),
          v.literal("manual_review")
        ),
      }),
      v.null()
    ),
  },
  handler: async (ctx, args) => {
    const bill = await ctx.db.get(args.billId);
    if (!bill) {
      throw new Error("Bill submission not found");
    }

    await ctx.db.patch(args.billId, {
      verificationStatus: args.verificationStatus,
      aiConfidenceScore: args.aiConfidenceScore,
      aiAnalysis: args.aiAnalysis,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.billId);
  },
});

/**
 * Admin review of a bill
 */
export const adminReviewBill = mutation({
  args: {
    billId: v.id("billSubmissions"),
    adminUserId: v.id("users"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bill = await ctx.db.get(args.billId);
    if (!bill) {
      throw new Error("Bill submission not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.billId, {
      verificationStatus:
        args.decision === "approved" ? "verified" : "rejected",
      paymentStatus: args.decision === "approved" ? "approved" : "declined",
      adminReviewedBy: args.adminUserId,
      adminReviewedAt: now,
      adminNotes: args.notes ?? null,
      updatedAt: now,
    });

    return await ctx.db.get(args.billId);
  },
});

/**
 * Get bill by ID
 */
export const getBill = query({
  args: {
    billId: v.id("billSubmissions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.billId);
  },
});

/**
 * Get all bills for a user
 */
export const getUserBills = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("billSubmissions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get bills by verification status (for admin queue)
 */
export const getBillsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("analyzing"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("needs_review")
    ),
  },
  handler: async (ctx, args) => {
    const bills = await ctx.db
      .query("billSubmissions")
      .withIndex("by_verificationStatus", (q) =>
        q.eq("verificationStatus", args.status)
      )
      .collect();

    // Sort by shutoff date (most urgent first)
    return bills.sort((a, b) => a.shutoffDate - b.shutoffDate);
  },
});

/**
 * Get bills awaiting payment
 */
export const getBillsAwaitingPayment = query({
  args: {},
  handler: async (ctx) => {
    const bills = await ctx.db
      .query("billSubmissions")
      .withIndex("by_paymentStatus", (q) => q.eq("paymentStatus", "approved"))
      .collect();

    // Sort by shutoff date (most urgent first)
    return bills.sort((a, b) => a.shutoffDate - b.shutoffDate);
  },
});

/**
 * Get bills for a pool
 */
export const getPoolBills = query({
  args: {
    poolId: v.id("communityPools"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("billSubmissions")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();
  },
});

/**
 * Check user eligibility
 */
export const checkEligibility = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

    const paidBills = await ctx.db
      .query("billSubmissions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const recentPaidBills = paidBills.filter(
      (b) => b.paymentStatus === "paid" && b.paidAt && b.paidAt > twelveMonthsAgo
    );

    const assistanceCount = recentPaidBills.length;
    const maxAssistance = 3;

    // Find next eligible date if at max
    let nextEligibleDate: number | null = null;
    if (assistanceCount >= maxAssistance && recentPaidBills.length > 0) {
      const sortedBills = recentPaidBills.sort(
        (a, b) => (a.paidAt ?? 0) - (b.paidAt ?? 0)
      );
      const oldestPaidAt = sortedBills[0].paidAt;
      if (oldestPaidAt) {
        nextEligibleDate = oldestPaidAt + 365 * 24 * 60 * 60 * 1000;
      }
    }

    return {
      eligible: assistanceCount < maxAssistance,
      remainingAssistance: maxAssistance - assistanceCount,
      assistanceCount,
      nextEligibleDate,
    };
  },
});

/**
 * Get recent paid bills (anonymized) for dashboard
 */
export const getRecentPaidBills = query({
  args: {
    poolId: v.id("communityPools"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const bills = await ctx.db
      .query("billSubmissions")
      .withIndex("by_poolId", (q) => q.eq("poolId", args.poolId))
      .collect();

    const paidBills = bills.filter((b) => b.paymentStatus === "paid");

    // Sort by paid date descending
    paidBills.sort((a, b) => (b.paidAt ?? 0) - (a.paidAt ?? 0));

    // Return anonymized data
    const limit = args.limit ?? 10;
    return paidBills.slice(0, limit).map((b) => ({
      utilityType: b.utilityType,
      amount: b.paymentAmount,
      paidAt: b.paidAt,
    }));
  },
});
