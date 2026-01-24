import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_city", ["city"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled")),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    startDate: v.number(),
    lastDistributionDate: v.union(v.number(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  charities: defineTable({
    name: v.string(),
    description: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    category: v.string(),
    verificationStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    adminNotes: v.union(v.string(), v.null()),
    website: v.union(v.string(), v.null()),
    contactEmail: v.union(v.string(), v.null()),
    createdAt: v.number(),
    approvedAt: v.union(v.number(), v.null()),
    approvedBy: v.union(v.id("users"), v.null()),
  })
    .index("by_city", ["city"])
    .index("by_verificationStatus", ["verificationStatus"]),

  needsData: defineTable({
    charityId: v.id("charities"),
    urgencyScore: v.number(),
    fundingGap: v.number(),
    category: v.string(),
    lastUpdated: v.number(),
    source: v.union(v.literal("manual"), v.literal("api"), v.literal("calculated")),
    metadata: v.any(),
  })
    .index("by_charityId", ["charityId"]),

  distributions: defineTable({
    subscriptionId: v.id("subscriptions"),
    charityId: v.id("charities"),
    amount: v.number(),
    distributionDate: v.number(),
    weekStartDate: v.number(),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_weekStartDate", ["weekStartDate"])
    .index("by_charityId", ["charityId"]),

  reports: defineTable({
    userId: v.id("users"),
    weekStartDate: v.number(),
    totalDistributed: v.number(),
    charitiesSupported: v.number(),
    distributionBreakdown: v.array(
      v.object({
        charityId: v.id("charities"),
        amount: v.number(),
        reason: v.string(),
      })
    ),
    generatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_weekStartDate", ["weekStartDate"]),
});
