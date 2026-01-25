import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new user from Clerk authentication data
 */
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    city: v.string(),
    province: v.string(),
    postalCode: v.string(),
    role: v.union(v.literal("contributor"), v.literal("recipient")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      throw new Error("User with this Clerk ID already exists");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      city: args.city,
      province: args.province,
      postalCode: args.postalCode,
      role: args.role,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

/**
 * Update user profile information
 */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    city: v.optional(v.string()),
    province: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("contributor"), v.literal("recipient"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: {
      city?: string;
      province?: string;
      postalCode?: string;
      email?: string;
      role?: "contributor" | "recipient";
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.city !== undefined) updates.city = args.city;
    if (args.province !== undefined) updates.province = args.province;
    if (args.postalCode !== undefined) updates.postalCode = args.postalCode;
    if (args.email !== undefined) updates.email = args.email;
    if (args.role !== undefined) updates.role = args.role;

    await ctx.db.patch(args.userId, updates);
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by Clerk ID
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

/**
 * Get user by Convex ID
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

/**
 * Get users by role
 */
export const getUsersByRole = query({
  args: {
    role: v.union(v.literal("contributor"), v.literal("recipient")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

/**
 * Get users by city
 */
export const getUsersByCity = query({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .collect();
  },
});
