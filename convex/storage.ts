import { mutation } from "./_generated/server";

/**
 * Generate an upload URL for file storage (bill documents)
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a URL for a stored file
 */
export const getFileUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // This is a placeholder - in real usage, pass the storage ID
    return null;
  },
});
