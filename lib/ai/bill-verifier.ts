/**
 * Bill verification using AI vision models
 * 
 * Analyzes uploaded utility bill images to:
 * 1. Extract key data (provider, amount, due date, etc.)
 * 2. Verify authenticity and detect potential fraud
 * 3. Assess urgency based on shutoff date
 * 4. Provide recommendation for approval workflow
 */

import { generateObject } from "ai";
import { z } from "zod";
import { geminiVision } from "./openrouter";
import { getAllUtilityProviders } from "@/lib/constants/canada";

/**
 * Schema for bill analysis results
 */
export const BillAnalysisSchema = z.object({
  authenticityScore: z.number().min(0).max(100).describe(
    "Confidence score (0-100) that this is a genuine, unaltered utility bill"
  ),
  urgencyLevel: z.enum(["critical", "high", "medium"]).describe(
    "Urgency based on shutoff date: critical (<7 days), high (<14 days), medium (>14 days)"
  ),
  extractedData: z.object({
    provider: z.string().describe("Name of the utility provider"),
    amount: z.number().describe("Total amount due in CAD"),
    dueDate: z.string().describe("Payment due date (YYYY-MM-DD format)"),
    accountNumber: z.string().describe("Customer account number"),
    customerName: z.string().describe("Name on the account"),
    serviceAddress: z.string().describe("Service address on the bill"),
  }),
  flaggedIssues: z.array(z.string()).describe(
    "List of potential issues or concerns found during analysis"
  ),
  recommendation: z.enum(["approve", "reject", "manual_review"]).describe(
    "Recommendation: approve (score >85, no flags), reject (score <50 or major fraud indicators), manual_review (otherwise)"
  ),
});

export type BillAnalysis = z.infer<typeof BillAnalysisSchema>;

/**
 * Get the AI prompt for bill verification
 */
function getBillVerificationPrompt(): string {
  const providers = getAllUtilityProviders();
  
  return `You are an expert bill verification agent for a Canadian community assistance program that helps families facing utility shut-offs.

Your task is to analyze this utility bill image and provide a detailed assessment.

## VERIFICATION CRITERIA

### 1. Authenticity (Score 0-100)
- Check for official letterhead and branding
- Verify consistent formatting and typography
- Look for proper bill structure (header, account info, charges, due date)
- Check for signs of image manipulation (inconsistent fonts, pixelation around text, misaligned elements)
- Verify the document looks like an official Canadian utility bill

### 2. Data Extraction
Extract the following information accurately:
- Provider name (common Canadian providers: ${providers.slice(0, 20).join(", ")}, etc.)
- Total amount due (in CAD)
- Due date or shutoff date
- Account number
- Customer name
- Service address

### 3. Urgency Assessment
Based on the due date or disconnection notice date:
- **critical**: Less than 7 days until shutoff/disconnection
- **high**: 7-14 days until shutoff/disconnection
- **medium**: More than 14 days

### 4. Fraud Detection
Flag any of these issues:
- Text appears edited or manipulated
- Amount seems unusually high for typical utility bills
- Inconsistent fonts or formatting
- Missing expected bill elements
- Date inconsistencies
- Document appears to be a screenshot of a screenshot
- Signs of photoshopping or digital alteration
- Bill from a non-existent provider

### 5. Recommendation
- **approve**: Authenticity score > 85 AND no flagged issues
- **reject**: Authenticity score < 50 OR clear evidence of fraud/manipulation
- **manual_review**: All other cases (needs human verification)

## IMPORTANT NOTES
- This is for Canadian utility bills (amounts in CAD)
- Be thorough but fair - genuine bills may have some quality issues from scanning
- When in doubt, recommend manual_review rather than rejecting
- Extract dates in YYYY-MM-DD format
- If a field cannot be determined, use "UNKNOWN" for text fields or 0 for numbers

Analyze the provided bill image now.`;
}

/**
 * Verify a utility bill image using AI vision
 * 
 * @param imageUrl - URL or base64 data URI of the bill image
 * @returns Analysis results including authenticity, extracted data, and recommendation
 */
export async function verifyBill(imageUrl: string): Promise<BillAnalysis> {
  const result = await generateObject({
    model: geminiVision,
    schema: BillAnalysisSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: imageUrl,
          },
          {
            type: "text",
            text: getBillVerificationPrompt(),
          },
        ],
      },
    ],
  });

  return result.object;
}

/**
 * Calculate urgency level from a shutoff date
 * 
 * @param shutoffDate - Unix timestamp of the shutoff date
 * @returns Urgency level
 */
export function calculateUrgencyLevel(shutoffDate: number): "critical" | "high" | "medium" {
  const now = Date.now();
  const daysUntilShutoff = Math.ceil((shutoffDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilShutoff < 7) return "critical";
  if (daysUntilShutoff < 14) return "high";
  return "medium";
}

/**
 * Determine verification status from AI analysis
 * 
 * @param analysis - The AI analysis result
 * @returns Verification status for database
 */
export function getVerificationStatusFromAnalysis(
  analysis: BillAnalysis
): "verified" | "rejected" | "needs_review" {
  switch (analysis.recommendation) {
    case "approve":
      return "verified";
    case "reject":
      return "rejected";
    case "manual_review":
    default:
      return "needs_review";
  }
}

/**
 * Parse a date string from AI extraction to Unix timestamp
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Unix timestamp or null if invalid
 */
export function parseDateToTimestamp(dateString: string): number | null {
  if (!dateString || dateString === "UNKNOWN") return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  
  return date.getTime();
}
