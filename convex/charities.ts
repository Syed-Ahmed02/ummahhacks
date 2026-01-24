import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new charity (admin only - add auth check in production)
 */
export const createCharity = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    category: v.string(),
    website: v.optional(v.union(v.string(), v.null())),
    contactEmail: v.optional(v.union(v.string(), v.null())),
    adminNotes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const charityId = await ctx.db.insert("charities", {
      name: args.name,
      description: args.description,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      category: args.category,
      verificationStatus: "pending",
      website: args.website ?? null,
      contactEmail: args.contactEmail ?? null,
      adminNotes: args.adminNotes ?? null,
      createdAt: now,
      approvedAt: null,
      approvedBy: null,
    });

    return charityId;
  },
});

/**
 * Update charity details
 */
export const updateCharity = mutation({
  args: {
    charityId: v.id("charities"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    category: v.optional(v.string()),
    website: v.optional(v.union(v.string(), v.null())),
    contactEmail: v.optional(v.union(v.string(), v.null())),
    adminNotes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const charity = await ctx.db.get(args.charityId);
    if (!charity) {
      throw new Error("Charity not found");
    }

    const updates: {
      name?: string;
      description?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      category?: string;
      website?: string | null;
      contactEmail?: string | null;
      adminNotes?: string | null;
    } = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.city !== undefined) updates.city = args.city;
    if (args.state !== undefined) updates.state = args.state;
    if (args.zipCode !== undefined) updates.zipCode = args.zipCode;
    if (args.category !== undefined) updates.category = args.category;
    if (args.website !== undefined) updates.website = args.website;
    if (args.contactEmail !== undefined) updates.contactEmail = args.contactEmail;
    if (args.adminNotes !== undefined) updates.adminNotes = args.adminNotes;

    await ctx.db.patch(args.charityId, updates);
    return await ctx.db.get(args.charityId);
  },
});

/**
 * Approve a charity (admin only)
 */
export const approveCharity = mutation({
  args: {
    charityId: v.id("charities"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const charity = await ctx.db.get(args.charityId);
    if (!charity) {
      throw new Error("Charity not found");
    }

    await ctx.db.patch(args.charityId, {
      verificationStatus: "approved",
      approvedAt: Date.now(),
      approvedBy: args.approvedBy,
    });

    return await ctx.db.get(args.charityId);
  },
});

/**
 * Reject a charity (admin only)
 */
export const rejectCharity = mutation({
  args: {
    charityId: v.id("charities"),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const charity = await ctx.db.get(args.charityId);
    if (!charity) {
      throw new Error("Charity not found");
    }

    await ctx.db.patch(args.charityId, {
      verificationStatus: "rejected",
      adminNotes: args.adminNotes ?? charity.adminNotes,
    });

    return await ctx.db.get(args.charityId);
  },
});

/**
 * Get a single charity
 */
export const getCharity = query({
  args: {
    charityId: v.id("charities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.charityId);
  },
});

/**
 * Get approved charities in a city
 */
export const getCharitiesByCity = query({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    const allCharities = await ctx.db
      .query("charities")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .collect();

    return allCharities.filter((charity) => charity.verificationStatus === "approved");
  },
});

/**
 * Get all pending charities (admin)
 */
export const getPendingCharities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("charities")
      .withIndex("by_verificationStatus", (q) => q.eq("verificationStatus", "pending"))
      .collect();
  },
});

/**
 * Get all charities with optional filters
 */
export const getAllCharities = query({
  args: {
    verificationStatus: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))
    ),
    category: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let charities = await ctx.db.query("charities").collect();

    if (args.verificationStatus) {
      charities = charities.filter((c) => c.verificationStatus === args.verificationStatus);
    }

    if (args.category) {
      charities = charities.filter((c) => c.category === args.category);
    }

    if (args.city) {
      charities = charities.filter((c) => c.city === args.city);
    }

    return charities;
  },
});
