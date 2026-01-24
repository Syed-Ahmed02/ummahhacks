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
    state: v.string(),
    zipCode: v.string(),
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
      state: args.state,
      zipCode: args.zipCode,
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
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: {
      city?: string;
      state?: string;
      zipCode?: string;
      email?: string;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.city !== undefined) updates.city = args.city;
    if (args.state !== undefined) updates.state = args.state;
    if (args.zipCode !== undefined) updates.zipCode = args.zipCode;
    if (args.email !== undefined) updates.email = args.email;

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
