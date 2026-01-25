/**
 * API Route: /api/verify-bill
 * 
 * Receives a bill image URL and runs AI verification analysis.
 * Returns authenticity score, extracted data, and approval recommendation.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  verifyBill, 
  getVerificationStatusFromAnalysis,
  type BillAnalysis 
} from "@/lib/ai/bill-verifier";

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

interface VerifyBillRequest {
  imageUrl: string;
  billId?: string;
}

interface VerifyBillResponse {
  success: boolean;
  analysis?: BillAnalysis;
  verificationStatus?: "verified" | "rejected" | "needs_review";
  billId?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyBillResponse>> {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: VerifyBillRequest = await request.json();
    const { imageUrl, billId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Run AI verification
    const analysis = await verifyBill(imageUrl);
    
    // Determine verification status based on AI recommendation
    const verificationStatus = getVerificationStatusFromAnalysis(analysis);

    return NextResponse.json({
      success: true,
      analysis,
      verificationStatus,
      billId,
    });
  } catch (error) {
    console.error("Bill verification failed:", error);
    
    // Handle specific AI errors
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { success: false, error: "AI service is temporarily unavailable. Please try again." },
          { status: 503 }
        );
      }
      if (error.message.includes("invalid image")) {
        return NextResponse.json(
          { success: false, error: "Could not process the image. Please upload a clearer image." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
