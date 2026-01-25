import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    city: v.string(),
    province: v.string(),
    postalCode: v.string(),
    role: v.union(v.literal("contributor"), v.literal("recipient")),
    // Charity preferences - which utility types the user wants to support
    charityPreferences: v.optional(
      v.object({
        excludedUtilityTypes: v.array(
          v.union(
            v.literal("electric"),
            v.literal("water"),
            v.literal("gas"),
            v.literal("heating")
          )
        ),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_city", ["city"])
    .index("by_role", ["role"]),

  communityPools: defineTable({
    city: v.string(),
    province: v.string(),
    postalCodes: v.array(v.string()),
    totalContributors: v.number(),
    weeklyContributions: v.number(),
    totalFundsAvailable: v.number(),
    totalFamiliesHelped: v.number(),
    totalAmountDistributed: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_city_province", ["city", "province"]),

  billSubmissions: defineTable({
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

    // AI Verification
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

    // Admin Review
    adminReviewedBy: v.union(v.id("users"), v.null()),
    adminReviewedAt: v.union(v.number(), v.null()),
    adminNotes: v.union(v.string(), v.null()),

    // Payment
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("paid"),
      v.literal("declined")
    ),
    paymentAmount: v.union(v.number(), v.null()),
    paidAt: v.union(v.number(), v.null()),
    paymentReference: v.union(v.string(), v.null()),

    // Recipient tracking (rolling 12-month window)
    assistanceCountThisYear: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_poolId", ["poolId"])
    .index("by_verificationStatus", ["verificationStatus"])
    .index("by_paymentStatus", ["paymentStatus"])
    .index("by_shutoffDate", ["shutoffDate"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    poolId: v.id("communityPools"),
    weeklyAmount: v.number(), // Amount per interval (kept as weeklyAmount for backwards compatibility)
    interval: v.optional(
      v.union(v.literal("week"), v.literal("month"), v.literal("year"))
    ), // Payment interval - defaults to "week" for existing records
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("cancelled")
    ),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    totalContributed: v.number(),
    startDate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"])
    .index("by_userId", ["userId"])
    .index("by_poolId", ["poolId"])
    .index("by_status", ["status"]),

  // One-time donations (not recurring)
  oneTimeDonations: defineTable({
    userId: v.id("users"),
    poolId: v.id("communityPools"),
    amount: v.number(),
    stripePaymentIntentId: v.string(),
    stripeCustomerId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_poolId", ["poolId"])
    .index("by_stripePaymentIntentId", ["stripePaymentIntentId"])
    .index("by_status", ["status"]),

  payments: defineTable({
    billSubmissionId: v.id("billSubmissions"),
    poolId: v.id("communityPools"),
    amount: v.number(),
    utilityProvider: v.string(),
    paymentMethod: v.union(
      v.literal("cheque"),
      v.literal("bank_transfer"),
      v.literal("online")
    ),
    processedBy: v.id("users"),
    processedAt: v.number(),
    confirmationNumber: v.union(v.string(), v.null()),
    createdAt: v.number(),
  })
    .index("by_billSubmissionId", ["billSubmissionId"])
    .index("by_poolId", ["poolId"]),

  impactReports: defineTable({
    poolId: v.id("communityPools"),
    weekStartDate: v.number(),
    weekEndDate: v.number(),
    totalContributions: v.number(),
    totalFamiliesHelped: v.number(),
    billsPaid: v.array(
      v.object({
        utilityType: v.string(),
        amount: v.number(),
        city: v.string(),
      })
    ),
    contributorCount: v.number(),
    generatedAt: v.number(),
  })
    .index("by_poolId", ["poolId"])
    .index("by_weekStartDate", ["weekStartDate"]),
});
