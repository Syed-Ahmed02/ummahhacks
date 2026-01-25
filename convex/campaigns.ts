import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a random suffix if needed
 */
function generateUniqueSlug(baseSlug: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Create a new campaign
 */
export const createCampaign = mutation({
  args: {
    userId: v.id("users"),
    billSubmissionId: v.optional(v.id("billSubmissions")),
    title: v.string(),
    description: v.string(),
    goalAmount: v.number(),
    campaignType: v.union(v.literal("public"), v.literal("anonymous")),
    utilityType: v.union(
      v.literal("electric"),
      v.literal("water"),
      v.literal("gas"),
      v.literal("heating")
    ),
    utilityProvider: v.string(),
    amountDue: v.number(),
    shutoffDate: v.number(),
    showRecipientName: v.boolean(),
    showRecipientLocation: v.boolean(),
    showBillDetails: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is a recipient
    if (user.role !== "recipient") {
      throw new Error("Only recipients can create campaigns");
    }

    // If billSubmissionId is provided, verify it exists and belongs to user
    if (args.billSubmissionId) {
      const bill = await ctx.db.get(args.billSubmissionId);
      if (!bill) {
        throw new Error("Bill submission not found");
      }
      if (bill.userId !== args.userId) {
        throw new Error("Bill submission does not belong to user");
      }
    }

    // Generate unique slug
    const baseSlug = generateSlug(args.title);
    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("campaigns")
        .withIndex("by_shareableSlug", (q) => q.eq("shareableSlug", slug))
        .first();

      if (!existing) {
        break; // Slug is unique
      }

      slug = generateUniqueSlug(baseSlug);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique slug");
    }

    // Set privacy defaults based on campaign type
    const showRecipientName =
      args.campaignType === "public" ? args.showRecipientName : false;
    const showRecipientLocation =
      args.campaignType === "public"
        ? args.showRecipientLocation
        : args.showRecipientLocation; // Can still show city for anonymous
    const showBillDetails =
      args.campaignType === "public" ? args.showBillDetails : false;

    const now = Date.now();

    const campaignId = await ctx.db.insert("campaigns", {
      userId: args.userId,
      billSubmissionId: args.billSubmissionId ?? null,
      title: args.title,
      description: args.description,
      goalAmount: args.goalAmount,
      currentAmount: 0,
      currency: "CAD",
      campaignType: args.campaignType,
      isActive: true,
      isCompleted: false,
      shareableSlug: slug,
      utilityType: args.utilityType,
      utilityProvider: args.utilityProvider,
      amountDue: args.amountDue,
      shutoffDate: args.shutoffDate,
      showRecipientName,
      showRecipientLocation,
      showBillDetails,
      donationCount: 0,
      lastDonationAt: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    });

    return campaignId;
  },
});

/**
 * Generate unique shareable slug (helper for frontend)
 */
export const generateCampaignSlug = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const baseSlug = generateSlug(args.title);
    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("campaigns")
        .withIndex("by_shareableSlug", (q) => q.eq("shareableSlug", slug))
        .first();

      if (!existing) {
        return slug;
      }

      slug = generateUniqueSlug(baseSlug);
      attempts++;
    }

    return generateUniqueSlug(baseSlug);
  },
});

/**
 * Get campaign by slug (public query - respects privacy)
 */
export const getCampaignBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_shareableSlug", (q) => q.eq("shareableSlug", args.slug))
      .first();

    if (!campaign) {
      return null;
    }

    // Get user info for display
    const user = await ctx.db.get(campaign.userId);

    return {
      ...campaign,
      user: user
        ? {
            city: user.city,
            province: user.province,
            email: campaign.campaignType === "public" ? user.email : undefined,
          }
        : null,
    };
  },
});

/**
 * Get campaign by ID (for owner/admin - full data)
 */
export const getCampaignById = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      return null;
    }

    const user = await ctx.db.get(campaign.userId);
    const bill = campaign.billSubmissionId
      ? await ctx.db.get(campaign.billSubmissionId)
      : null;

    return {
      ...campaign,
      user,
      bill,
    };
  },
});

/**
 * Get user's campaigns
 */
export const getUserCampaigns = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return campaigns.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get all active campaigns (public browse)
 */
export const getActiveCampaigns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Only show campaigns that are not completed
    campaigns = campaigns.filter((c) => !c.isCompleted);

    // Sort by most recent donation or creation
    campaigns.sort((a, b) => (b.lastDonationAt ?? b.createdAt) - (a.lastDonationAt ?? a.createdAt));

    if (args.limit) campaigns = campaigns.slice(0, args.limit);

    return campaigns;
  },
});

/**
 * Update campaign
 */
export const updateCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    goalAmount: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const updates: {
      title?: string;
      description?: string;
      goalAmount?: number;
      isActive?: boolean;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.goalAmount !== undefined) updates.goalAmount = args.goalAmount;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.campaignId, updates);
    return await ctx.db.get(args.campaignId);
  },
});

/**
 * Mark campaign as completed
 */
export const completeCampaign = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.campaignId, {
      isCompleted: true,
      isActive: false,
      completedAt: now,
      updatedAt: now,
    });

    // If linked to a bill submission, mark it as campaign_funded
    if (campaign.billSubmissionId) {
      const bill = await ctx.db.get(campaign.billSubmissionId);
      if (bill) {
        // Note: We don't have a "campaign_funded" status in the schema,
        // but we can add a note or handle this differently
        // For now, we'll just leave it as is
      }
    }

    return await ctx.db.get(args.campaignId);
  },
});

/**
 * Create donation record
 */
export const createDonation = mutation({
  args: {
    campaignId: v.id("campaigns"),
    donorUserId: v.optional(v.id("users")),
    donorEmail: v.string(),
    donorName: v.optional(v.string()),
    isAnonymousDonation: v.boolean(),
    amount: v.number(),
    stripePaymentIntentId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (!campaign.isActive || campaign.isCompleted) {
      throw new Error("Campaign is not accepting donations");
    }

    const now = Date.now();

    const donationId = await ctx.db.insert("campaignDonations", {
      campaignId: args.campaignId,
      donorUserId: args.donorUserId ?? null,
      donorEmail: args.donorEmail,
      donorName: args.donorName ?? null,
      isAnonymousDonation: args.isAnonymousDonation,
      amount: args.amount,
      currency: "CAD",
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCustomerId: args.stripeCustomerId ?? null,
      paymentStatus: "pending",
      message: args.message ?? null,
      createdAt: now,
      paidAt: null,
    });

    return donationId;
  },
});

/**
 * Update donation payment status
 */
export const updateDonationStatus = mutation({
  args: {
    donationId: v.id("campaignDonations"),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db.get(args.donationId);
    if (!donation) {
      throw new Error("Donation not found");
    }

    const now = Date.now();
    const wasSucceeded = donation.paymentStatus === "succeeded";
    const isSucceeded = args.paymentStatus === "succeeded";

    await ctx.db.patch(args.donationId, {
      paymentStatus: args.paymentStatus,
      paidAt: isSucceeded ? now : donation.paidAt,
    });

    // Update campaign totals if status changed to/from succeeded
    if (wasSucceeded !== isSucceeded) {
      const campaign = await ctx.db.get(donation.campaignId);
      if (campaign) {
        const amountChange = isSucceeded
          ? donation.amount
          : -donation.amount;

        const newCurrentAmount = Math.max(
          0,
          campaign.currentAmount + amountChange
        );
        const newDonationCount = isSucceeded
          ? campaign.donationCount + 1
          : Math.max(0, campaign.donationCount - 1);

        await ctx.db.patch(donation.campaignId, {
          currentAmount: newCurrentAmount,
          donationCount: newDonationCount,
          lastDonationAt: isSucceeded ? now : campaign.lastDonationAt,
          updatedAt: now,
        });

        // Check if goal is reached
        const updatedCampaign = await ctx.db.get(donation.campaignId);
        if (
          updatedCampaign &&
          !updatedCampaign.isCompleted &&
          updatedCampaign.currentAmount >= updatedCampaign.goalAmount
        ) {
          await ctx.db.patch(donation.campaignId, {
            isCompleted: true,
            completedAt: now,
            updatedAt: now,
          });
        }
      }
    }

    return await ctx.db.get(args.donationId);
  },
});

/**
 * Get campaign donations (with privacy filtering)
 */
export const getCampaignDonations = query({
  args: {
    campaignId: v.id("campaigns"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      return [];
    }

    let donations = await ctx.db
      .query("campaignDonations")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Filter to only succeeded donations
    donations = donations.filter((d) => d.paymentStatus === "succeeded");

    // Sort by most recent first
    donations.sort((a, b) => (b.paidAt ?? b.createdAt) - (a.paidAt ?? a.createdAt));

    // Apply limit
    if (args.limit) {
      donations = donations.slice(0, args.limit);
    }

    // Apply privacy filtering
    return donations.map((donation) => {
      const filtered: typeof donation & {
        donorName?: string | null;
        donorEmail?: string;
      } = {
        ...donation,
      };

      // Hide donor name if anonymous
      if (donation.isAnonymousDonation) {
        filtered.donorName = null;
      }

      // Never show email in public queries
      // delete filtered.donorEmail;

      return filtered;
    });
  },
});

/**
 * Get donation by payment intent ID
 */
export const getDonationByPaymentIntent = query({
  args: { stripePaymentIntentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaignDonations")
      .withIndex("by_stripePaymentIntentId", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .first();
  },
});
