"use node";

/**
 * Convex AI Actions
 * 
 * Server-side actions for AI-powered bill verification.
 * These actions run in a Node.js environment and can call external APIs.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Verify a bill using AI and update the database with results.
 * 
 * This action:
 * 1. Sets the bill status to "analyzing"
 * 2. Fetches the bill image from Convex storage
 * 3. Calls the AI verification API
 * 4. Updates the bill with the analysis results
 */
export const verifyBill = action({
  args: {
    billId: v.id("billSubmissions"),
  },
  handler: async (ctx, args) => {
    // First, update status to "analyzing"
    await ctx.runMutation(api.bills.updateVerificationStatus, {
      billId: args.billId,
      verificationStatus: "analyzing",
      aiConfidenceScore: null,
      aiAnalysis: null,
    });

    // Get the bill to retrieve the storage ID
    const bill = await ctx.runQuery(api.bills.getBill, {
      billId: args.billId,
    });

    if (!bill) {
      throw new Error("Bill not found");
    }

    // Get the image URL from Convex storage
    const imageUrl = await ctx.storage.getUrl(bill.documentStorageId);
    
    if (!imageUrl) {
      // Mark as needs_review if we can't get the image
      await ctx.runMutation(api.bills.updateVerificationStatus, {
        billId: args.billId,
        verificationStatus: "needs_review",
        aiConfidenceScore: null,
        aiAnalysis: {
          authenticityScore: 0,
          urgencyLevel: "medium" as const,
          extractedData: {
            provider: "UNKNOWN",
            amount: 0,
            dueDate: "UNKNOWN",
            accountNumber: "UNKNOWN",
            customerName: "UNKNOWN",
            serviceAddress: "UNKNOWN",
          },
          flaggedIssues: ["Could not retrieve bill image for analysis"],
          recommendation: "manual_review" as const,
        },
      });
      return { success: false, error: "Could not retrieve bill image" };
    }

    try {
      // Call the verification API
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const response = await fetch(`${appUrl}/api/verify-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Note: In production, you'd want to use a service-to-service auth token here
        },
        body: JSON.stringify({
          imageUrl,
          billId: args.billId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.analysis) {
        throw new Error(result.error || "Verification failed");
      }

      // Determine verification status based on AI recommendation
      let verificationStatus: "verified" | "rejected" | "needs_review";
      switch (result.analysis.recommendation) {
        case "approve":
          verificationStatus = "verified";
          break;
        case "reject":
          verificationStatus = "rejected";
          break;
        default:
          verificationStatus = "needs_review";
      }

      // Update the bill with the analysis results
      await ctx.runMutation(api.bills.updateVerificationStatus, {
        billId: args.billId,
        verificationStatus,
        aiConfidenceScore: result.analysis.authenticityScore,
        aiAnalysis: {
          authenticityScore: result.analysis.authenticityScore,
          urgencyLevel: result.analysis.urgencyLevel,
          extractedData: result.analysis.extractedData,
          flaggedIssues: result.analysis.flaggedIssues,
          recommendation: result.analysis.recommendation,
        },
      });

      return {
        success: true,
        analysis: result.analysis,
        verificationStatus,
      };
    } catch (error) {
      console.error("Bill verification failed:", error);

      // Mark as needs_review on error
      await ctx.runMutation(api.bills.updateVerificationStatus, {
        billId: args.billId,
        verificationStatus: "needs_review",
        aiConfidenceScore: null,
        aiAnalysis: {
          authenticityScore: 0,
          urgencyLevel: "medium" as const,
          extractedData: {
            provider: "UNKNOWN",
            amount: bill.amountDue,
            dueDate: "UNKNOWN",
            accountNumber: bill.accountNumber,
            customerName: "UNKNOWN",
            serviceAddress: "UNKNOWN",
          },
          flaggedIssues: [
            "AI verification failed - manual review required",
            error instanceof Error ? error.message : "Unknown error",
          ],
          recommendation: "manual_review" as const,
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Trigger verification for a newly submitted bill.
 * 
 * This is a convenience action that can be called immediately after bill submission.
 * It schedules the verification to run asynchronously.
 */
export const triggerVerification = action({
  args: {
    billId: v.id("billSubmissions"),
  },
  handler: async (ctx, args) => {
    // Schedule the verification action to run
    await ctx.scheduler.runAfter(0, api.ai.verifyBill, {
      billId: args.billId,
    });

    return { scheduled: true, billId: args.billId };
  },
});
