# Community Invest - Utility Insurance Pivot Implementation Plan

## Overview

Transform "Community Invest" from a charity-giving platform into a **neighborhood utility insurance** platform where Canadian communities pool funds to prevent utility shut-offs for families in crisis.

---

## Concept Summary

> A subscription-based "utility insurance" for your neighborhood. You contribute a small amount weekly (e.g., $10), and the funds are pooled to automatically pay off overdue electric, water, and heating bills for local families facing immediate shut-off.
>
> Instead of giving cash to individuals (which carries risk), our AI Verification Agent scans uploaded "Final Notice" bills to verify their authenticity, urgency, and account status. Once approved, the app pays the utility provider directly. The money never touches the recipient's bank account—ensuring 100% of your donation keeps the lights on or water running for a neighbor in crisis.

---

## Key Decisions

| Aspect | Decision |
|--------|----------|
| **Name** | Keep "Community Invest" |
| **User Roles** | Mutually exclusive: Contributor OR Recipient |
| **Geography** | Any Canadian location (provinces, postal codes) |
| **AI Provider** | Google Gemini Pro Vision via OpenRouter + Vercel AI SDK |
| **AI Verification** | Full analysis (authenticity, fraud detection, OCR) |
| **Community** | Location-based, community-first view |
| **Submissions** | Self-submission only |
| **Contributions** | Flexible weekly amounts |
| **Recipient Limits** | 2-3 times per rolling 12-month window with increasing scrutiny |
| **Priority** | Urgency-based (closest to shutoff first) |
| **Payments** | Manual admin processing |
| **Transparency** | Public pool stats (anonymized) |
| **File Storage** | Convex file storage |

---

## Phase 1: Database Schema Transformation

### 1.1 Update `convex/schema.ts`

#### Modify `users` table

```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  city: v.string(),
  province: v.string(),          // Renamed from "state"
  postalCode: v.string(),        // Renamed from "zipCode"
  role: v.union(v.literal("contributor"), v.literal("recipient")),  // NEW: Mutually exclusive
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_city", ["city"])
  .index("by_role", ["role"]),
```

#### Add `communityPools` table

```typescript
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
})
  .index("by_city_province", ["city", "province"]),
```

#### Add `billSubmissions` table

```typescript
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
```

#### Modify `subscriptions` table

```typescript
subscriptions: defineTable({
  userId: v.id("users"),
  poolId: v.id("communityPools"),
  weeklyAmount: v.number(),
  status: v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled")),
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
```

#### Add `payments` table

```typescript
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
```

#### Repurpose `reports` → `impactReports`

```typescript
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
```

#### Tables to Remove

- `charities`
- `needsData`
- `distributions`

### 1.2 Create Convex Functions

#### New files to create

| File | Purpose |
|------|---------|
| `convex/pools.ts` | Pool CRUD, aggregation queries, find/create pool by location |
| `convex/bills.ts` | Bill submission, status updates, urgency queue queries |
| `convex/payments.ts` | Payment processing mutations, history queries |
| `convex/ai.ts` | Convex action to call AI verification API |
| `convex/impact.ts` | Impact report generation and queries |

#### Files to modify

| File | Changes |
|------|---------|
| `convex/users.ts` | Add role field handling, province/postalCode renaming |
| `convex/subscriptions.ts` | Link to pools, track totalContributed |

#### Files to delete

- `convex/charities.ts`
- `convex/needs.ts`
- `convex/distributions.ts`

---

## Phase 2: AI Verification System

### 2.1 Install OpenRouter Provider

```bash
pnpm add @openrouter/ai-sdk-provider
```

### 2.2 Environment Variables

```env
OPENROUTER_API_KEY=your_key_here
```

### 2.3 Create AI Verification Module

#### `lib/ai/openrouter.ts`

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const geminiVision = openrouter("google/gemini-pro-vision");
```

#### `lib/ai/bill-verifier.ts`

Core verification function that:

1. **OCR Extraction**: Extract provider name, amount, due date, account #, service address, customer name
2. **Authenticity Scoring**: Analyze format consistency, official letterhead, layout patterns
3. **Fraud Detection**: Check for amount manipulation, date tampering, image artifacts
4. **Urgency Calculation**: Calculate days until shutoff → critical (<7 days) / high (<14 days) / medium (>14 days)

```typescript
import { generateObject } from "ai";
import { z } from "zod";
import { geminiVision } from "./openrouter";

const BillAnalysisSchema = z.object({
  authenticityScore: z.number().min(0).max(100),
  urgencyLevel: z.enum(["critical", "high", "medium"]),
  extractedData: z.object({
    provider: z.string(),
    amount: z.number(),
    dueDate: z.string(),
    accountNumber: z.string(),
    customerName: z.string(),
    serviceAddress: z.string(),
  }),
  flaggedIssues: z.array(z.string()),
  recommendation: z.enum(["approve", "reject", "manual_review"]),
});

export async function verifyBill(imageUrl: string) {
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
            text: `Analyze this utility bill image for a community assistance program.

You must verify:
1. This is a legitimate utility bill (electric, water, gas, or heating)
2. Extract all key information accurately
3. Check for signs of manipulation or fraud
4. Assess urgency based on shutoff/due date

Provide:
- authenticityScore (0-100): How confident you are this is a real, unaltered bill
- urgencyLevel: "critical" (<7 days to shutoff), "high" (<14 days), "medium" (>14 days)
- extractedData: All key fields from the bill
- flaggedIssues: Any concerns (e.g., "image appears edited", "unusual formatting")
- recommendation: "approve" (score >90, no flags), "reject" (score <50 or major flags), "manual_review" (otherwise)

This is a Canadian utility bill. Common providers include Hydro One, Toronto Hydro, BC Hydro, ATCO, Hydro-Québec, etc.`,
          },
        ],
      },
    ],
  });

  return result.object;
}
```

### 2.4 API Route

#### `app/api/verify-bill/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyBill } from "@/lib/ai/bill-verifier";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl, billId } = await request.json();

  try {
    const analysis = await verifyBill(imageUrl);
    return NextResponse.json({ analysis, billId });
  } catch (error) {
    console.error("Bill verification failed:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
```

### 2.5 Convex Action

#### `convex/ai.ts`

```typescript
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const verifyBillAction = action({
  args: {
    billId: v.id("billSubmissions"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Call the API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/verify-bill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: args.imageUrl, billId: args.billId }),
    });

    const result = await response.json();

    // Update the bill with analysis results
    await ctx.runMutation(api.bills.updateVerificationStatus, {
      billId: args.billId,
      verificationStatus: result.analysis.recommendation === "approve" 
        ? "verified" 
        : result.analysis.recommendation === "reject"
        ? "rejected"
        : "needs_review",
      aiConfidenceScore: result.analysis.authenticityScore,
      aiAnalysis: result.analysis,
    });

    return result.analysis;
  },
});
```

---

## Phase 3: User Role System

### 3.1 Update Onboarding Flow

#### Modify `app/(dashboard)/onboarding/page.tsx`

Add multi-step onboarding:

1. **Step 1: Role Selection**
   - "I want to help my neighbors" → Contributor
   - "I need help with my utility bills" → Recipient

2. **Step 2: Location Detection** (existing functionality)

3. **Step 3: Confirmation**

#### New component: `components/onboarding/RoleSelector.tsx`

```typescript
type Role = "contributor" | "recipient";

type RoleSelectorProps = {
  onSelect: (role: Role) => void;
  selectedRole?: Role;
};

export function RoleSelector({ onSelect, selectedRole }: RoleSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RoleCard
        role="contributor"
        title="I want to help"
        description="Contribute weekly to help neighbors facing utility shut-offs"
        icon={Heart}
        selected={selectedRole === "contributor"}
        onSelect={() => onSelect("contributor")}
      />
      <RoleCard
        role="recipient"
        title="I need help"
        description="Get assistance with urgent utility bills"
        icon={Lightbulb}
        selected={selectedRole === "recipient"}
        onSelect={() => onSelect("recipient")}
      />
    </div>
  );
}
```

### 3.2 Update Auth Helpers

#### Modify `lib/auth.ts`

```typescript
/**
 * Require contributor role for a route.
 */
export async function requireContributor(): Promise<string> {
  const userId = await requireAuth();
  // Check Convex user role
  // Redirect to dashboard if not contributor
  return userId;
}

/**
 * Require recipient role for a route.
 */
export async function requireRecipient(): Promise<string> {
  const userId = await requireAuth();
  // Check Convex user role
  // Redirect to dashboard if not recipient
  return userId;
}

/**
 * Get the current user's role.
 */
export async function getUserRole(): Promise<"contributor" | "recipient" | null> {
  // Query Convex for user role
}
```

### 3.3 Role-Based Navigation

#### Modify `components/navigation/DashboardNav.tsx`

Dynamic navigation based on role:

**Contributor Navigation:**
- Dashboard (pool status, impact)
- Impact Reports
- Subscription
- Profile

**Recipient Navigation:**
- My Requests
- Submit Bill
- Profile

**Admin Navigation (via Clerk metadata):**
- Bill Review Queue
- Payments
- Pool Management

```typescript
const contributorNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Impact Reports", icon: FileBarChart },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const recipientNavItems: NavItem[] = [
  { href: "/my-requests", label: "My Requests", icon: FileText },
  { href: "/request-help", label: "Submit Bill", icon: Upload },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const adminNavItems: NavItem[] = [
  { href: "/admin/bills", label: "Bill Review", icon: ClipboardCheck },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/pools", label: "Pools", icon: Users },
];
```

---

## Phase 4: Landing Page Redesign

### 4.1 Update Hero Section

#### Modify `components/landing/Hero.tsx`

**New content:**

- **Badge**: "Neighborhood utility insurance"
- **Headline**: "Keep Your Neighbors' Lights On"
- **Subhead**: "A small weekly contribution pools with your community to pay urgent utility bills before disconnection. 100% goes directly to the utility provider—never to personal accounts."
- **CTAs**: 
  - Primary: "Start Contributing" → `/sign-up?role=contributor`
  - Secondary: "I Need Help" → `/sign-up?role=recipient`

### 4.2 Update How It Works

#### Modify `components/landing/HowItWorks.tsx`

**New 3-step flow:**

| Step | Title | Description | Icon |
|------|-------|-------------|------|
| 1 | Subscribe Weekly | Choose your contribution ($5-$50+/week). Your funds pool with neighbors in your community. | CreditCard |
| 2 | AI Verifies Bills | Families upload "Final Notice" bills. Our AI verifies authenticity, checks for fraud, and assesses urgency. | Brain/Shield |
| 3 | Direct Payment | Approved bills are paid directly to utility providers. Money never touches recipient bank accounts. | Zap/CheckCircle |

### 4.3 Update Features Section

#### Modify `components/landing/Features.tsx`

**New features:**

| Feature | Title | Description | Icon |
|---------|-------|-------------|------|
| 1 | 100% Direct Payment | Every dollar goes straight to utility companies. Recipients never handle the money. | ShieldCheck |
| 2 | AI Fraud Protection | Advanced verification catches altered bills, duplicate requests, and suspicious patterns. | Brain |
| 3 | Community Transparency | See exactly how your pool is helping—weekly reports show impact without compromising privacy. | Eye |
| 4 | Privacy First | Recipients remain anonymous. Contributors see impact, not identities. | Lock |
| 5 | Urgency-Based Priority | Bills closest to shut-off get paid first. Critical needs are never waiting in line. | Clock |
| 6 | Rolling Assistance Limits | Fair access—families can receive help 2-3 times per year, ensuring the pool helps more people. | RefreshCw |

### 4.4 Add Trust Section

#### New: `components/landing/TrustSection.tsx`

**Content:**

**"Why utility bills?"**
- Immediate, verifiable need
- Clear documentation (official bills)
- Direct impact (prevents disconnection)
- No ambiguity about where money goes

**"Why not cash?"**
- Ensures funds actually help
- Prevents potential misuse
- Builds community trust
- 100% accountability

**Canadian utility context:**
- Mention common providers by region
- Winter heating urgency in Canada
- Provincial utility regulations

### 4.5 Update CTA Section

#### Modify `components/landing/CtaSection.tsx`

**Two distinct paths:**

**For Contributors:**
- Headline: "Join your community pool"
- Subtext: "Starting at $5/week, help keep your neighbors' lights on."
- CTA: "Start Contributing"

**For Recipients:**
- Headline: "Facing a shut-off notice?"
- Subtext: "Upload your bill. Get verified. Get help."
- CTA: "Get Help Now"

---

## Phase 5: Contributor Dashboard

### 5.1 Main Dashboard

#### Modify `app/(dashboard)/dashboard/page.tsx`

**New layout for contributors:**

```
┌─────────────────────────────────────────────────────────┐
│  Pool Status Card                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Pool Balance│ │ Contributors│ │ Families    │       │
│  │ $2,450      │ │ 127         │ │ Helped: 18  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────────┤
│  Your Contributions                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ This week: $25    │   Total: $650   │ Since: Jan│   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Recent Bills Paid (Anonymized)                        │
│  • Electric bill - Toronto - $245 - 2 days ago         │
│  • Gas bill - Ottawa - $180 - 3 days ago               │
│  • Water bill - Toronto - $89 - 5 days ago             │
├─────────────────────────────────────────────────────────┤
│  This Week's Impact                                     │
│  3 families helped │ $514 distributed │ 0 disconnections│
└─────────────────────────────────────────────────────────┘
```

#### New components

| Component | Purpose |
|-----------|---------|
| `components/dashboard/PoolStatusCard.tsx` | Pool health visualization with key metrics |
| `components/dashboard/ContributionStats.tsx` | Personal giving history and totals |
| `components/dashboard/RecentBillsPaid.tsx` | Anonymized feed of recent help |
| `components/dashboard/WeeklyImpact.tsx` | This week's community impact summary |

### 5.2 Impact Reports

#### Modify `app/(dashboard)/reports/page.tsx`

**Weekly impact reports showing:**

- Total contributions collected
- Number of bills paid
- Families helped
- Utility type breakdown (pie/bar chart)
- Average days before shutoff when paid
- Pool efficiency metrics

---

## Phase 6: Recipient Flow

### 6.1 Request Help Page

#### New: `app/(dashboard)/request-help/page.tsx`

**Multi-step submission wizard:**

**Step 1: Utility Type**
- Select: Electric, Water, Gas, Heating
- Component: `components/request/UtilityTypeSelector.tsx`

**Step 2: Upload Bill**
- Drag-and-drop or click to upload
- Support: PDF, JPG, PNG
- Preview uploaded image
- Component: `components/request/BillUploader.tsx`

**Step 3: Review Extracted Data**
- Show AI-extracted information
- Allow corrections if needed
- Display urgency assessment
- Component: `components/request/ExtractionPreview.tsx`

**Step 4: Confirmation**
- Summary of submission
- Expected timeline
- What happens next
- Component: `components/request/SubmissionSuccess.tsx`

### 6.2 My Requests Page

#### New: `app/(dashboard)/my-requests/page.tsx`

**List of submitted bills with:**

- Status badges with colors:
  - `pending` (gray) - Awaiting review
  - `analyzing` (blue) - AI processing
  - `verified` (green) - Approved, awaiting payment
  - `needs_review` (yellow) - Under admin review
  - `paid` (emerald) - Payment sent
  - `rejected` (red) - Not approved
  - `declined` (red) - Payment declined

- Timeline view of each request
- View AI analysis details (if available)
- Eligibility indicator showing remaining assistance (X of 3 remaining this year)

#### Components

| Component | Purpose |
|-----------|---------|
| `components/requests/RequestCard.tsx` | Individual bill submission card |
| `components/requests/StatusTimeline.tsx` | Visual status progression |
| `components/requests/EligibilityBanner.tsx` | Shows remaining assistance allowance |

### 6.3 Eligibility Logic (Rolling 12-Month Window)

```typescript
// Check eligibility for new submission
async function checkEligibility(userId: Id<"users">) {
  const twelveMonthsAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  
  const paidBills = await ctx.db
    .query("billSubmissions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .filter((q) => 
      q.and(
        q.eq(q.field("paymentStatus"), "paid"),
        q.gte(q.field("paidAt"), twelveMonthsAgo)
      )
    )
    .collect();
  
  const assistanceCount = paidBills.length;
  const maxAssistance = 3;
  
  return {
    eligible: assistanceCount < maxAssistance,
    remainingAssistance: maxAssistance - assistanceCount,
    assistanceCount,
    nextEligibleDate: assistanceCount >= maxAssistance 
      ? getNextEligibleDate(paidBills) 
      : null,
  };
}
```

---

## Phase 7: Admin Dashboard

### 7.1 Bill Review Queue

#### New: `app/(dashboard)/admin/bills/page.tsx`

**Features:**

- Filter by status: `needs_review`, `pending`, `verified`, `all`
- Sort by urgency (shutoff date ascending)
- Quick actions: Approve / Reject / View Details
- Bulk actions for efficiency

**Component: `components/admin/BillReviewQueue.tsx`**

```
┌─────────────────────────────────────────────────────────────────┐
│  Bill Review Queue                     Filter: [Needs Review ▼] │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔴 CRITICAL │ Electric │ $342 │ Shutoff: 3 days         │   │
│  │ AI Score: 78% │ Flags: "Unusual format"                 │   │
│  │ [View Details] [Approve] [Reject]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🟡 HIGH │ Gas │ $189 │ Shutoff: 10 days                 │   │
│  │ AI Score: 85% │ Flags: None                             │   │
│  │ [View Details] [Approve] [Reject]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Bill Review Detail

#### New: `app/(dashboard)/admin/bills/[id]/page.tsx`

**Detailed review interface:**

- Original bill image (zoomable)
- AI analysis breakdown:
  - Authenticity score gauge
  - Extracted data comparison
  - Flagged issues highlighted
  - AI recommendation
- Recipient history (anonymized):
  - Previous assistance count
  - Last assisted date
- Admin actions:
  - Approve (with optional note)
  - Reject (with required reason)
  - Request more information

**Components:**

| Component | Purpose |
|-----------|---------|
| `components/admin/BillReviewDetail.tsx` | Full bill review interface |
| `components/admin/AIAnalysisCard.tsx` | AI analysis visualization |
| `components/admin/FraudAlertBanner.tsx` | Highlight flagged issues |

### 7.3 Payment Processing

#### New: `app/(dashboard)/admin/payments/page.tsx`

**Manual payment interface:**

- List of approved bills awaiting payment (sorted by urgency)
- Payment form:
  - Payment method: Cheque / Bank Transfer / Online
  - Confirmation number
  - Amount (pre-filled, editable)
  - Notes
- Payment history with search/filter

**Components:**

| Component | Purpose |
|-----------|---------|
| `components/admin/PaymentQueue.tsx` | Bills awaiting payment |
| `components/admin/PaymentForm.tsx` | Process payment form |
| `components/admin/PaymentHistory.tsx` | Historical payments |

### 7.4 Pool Management

#### New: `app/(dashboard)/admin/pools/page.tsx`

**Overview of all community pools:**

- List of pools with key metrics
- Pool health indicators
- Fund balances
- Geographic distribution map
- Create/merge pools

### 7.5 Remove Charity Admin

**Delete:**
- `app/(dashboard)/admin/charities/` (entire directory)
- `app/(dashboard)/admin/needs/` (entire directory)
- `components/admin/CharityForm.tsx`
- `components/admin/CharityTable.tsx`
- `components/admin/NeedsForm.tsx`

---

## Phase 8: File Cleanup

### Files to Delete

```
# Convex functions
convex/charities.ts
convex/needs.ts
convex/distributions.ts

# Admin components
components/admin/CharityForm.tsx
components/admin/CharityTable.tsx
components/admin/NeedsForm.tsx

# Map components (charity-specific)
components/map/CharityMarker.tsx
components/map/CharityPopup.tsx
components/map/CharityProjectsMap.tsx

# Dashboard components
components/dashboard/RecentDistributions.tsx

# Report components
components/reports/DistributionBreakdown.tsx
components/reports/ReportMap.tsx

# Admin pages
app/(dashboard)/admin/charities/ (entire directory)
app/(dashboard)/admin/needs/ (entire directory)

# Mock data
lib/mock-data.ts
```

### Files to Create

```
# AI
lib/ai/openrouter.ts
lib/ai/bill-verifier.ts
app/api/verify-bill/route.ts

# Convex
convex/pools.ts
convex/bills.ts
convex/payments.ts
convex/ai.ts
convex/impact.ts

# Onboarding
components/onboarding/RoleSelector.tsx

# Request help flow
app/(dashboard)/request-help/page.tsx
components/request/UtilityTypeSelector.tsx
components/request/BillUploader.tsx
components/request/ExtractionPreview.tsx
components/request/SubmissionSuccess.tsx

# My requests
app/(dashboard)/my-requests/page.tsx
components/requests/RequestCard.tsx
components/requests/StatusTimeline.tsx
components/requests/EligibilityBanner.tsx

# Dashboard
components/dashboard/PoolStatusCard.tsx
components/dashboard/ContributionStats.tsx
components/dashboard/RecentBillsPaid.tsx
components/dashboard/WeeklyImpact.tsx

# Admin
app/(dashboard)/admin/bills/page.tsx
app/(dashboard)/admin/bills/[id]/page.tsx
app/(dashboard)/admin/payments/page.tsx
app/(dashboard)/admin/pools/page.tsx
components/admin/BillReviewQueue.tsx
components/admin/BillReviewDetail.tsx
components/admin/AIAnalysisCard.tsx
components/admin/FraudAlertBanner.tsx
components/admin/PaymentQueue.tsx
components/admin/PaymentForm.tsx
components/admin/PaymentHistory.tsx

# Landing
components/landing/TrustSection.tsx
```

---

## Phase 9: Canadian Localization

### 9.1 Geography Updates

**Terminology changes:**
- "state" → "province"
- "zipCode" → "postalCode"
- "ZIP code" → "postal code" (in UI)

**Postal code validation:**
```typescript
// Canadian postal code format: A1A 1A1
const CANADIAN_POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

function validatePostalCode(postalCode: string): boolean {
  return CANADIAN_POSTAL_CODE_REGEX.test(postalCode);
}
```

**Province list:**
```typescript
const CANADIAN_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];
```

### 9.2 Currency

- Display all amounts in CAD
- Format: `$10.00` or `$10.00 CAD` where clarity needed
- Use `Intl.NumberFormat` for consistent formatting:

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
};
```

### 9.3 Canadian Utility Providers

**Common providers by province:**

| Province | Electric | Gas | Water |
|----------|----------|-----|-------|
| Ontario | Hydro One, Toronto Hydro, Ottawa Hydro | Enbridge | Municipal |
| British Columbia | BC Hydro | FortisBC | Municipal |
| Alberta | ATCO, ENMAX, EPCOR | ATCO Gas, Direct Energy | EPCOR |
| Quebec | Hydro-Québec | Énergir | Municipal |
| Manitoba | Manitoba Hydro | Manitoba Hydro | Municipal |
| Saskatchewan | SaskPower | SaskEnergy | Municipal |

**Use in AI verification:**
- Include provider list in AI prompt for better extraction
- Validate extracted provider against known list

---

## Implementation Order

| # | Phase | Estimated Effort | Dependencies |
|---|-------|------------------|--------------|
| 1 | Schema Update (Phase 1.1) | 0.5 day | None |
| 2 | File Cleanup (Phase 8) | 0.5 day | Schema |
| 3 | Canadian Localization (Phase 9) | 0.5 day | Schema |
| 4 | Convex Functions (Phase 1.2) | 1 day | Schema |
| 5 | User Role System (Phase 3) | 1 day | Convex Functions |
| 6 | Landing Page Redesign (Phase 4) | 1 day | None (parallel) |
| 7 | AI Verification System (Phase 2) | 1.5 days | Schema, Convex |
| 8 | Recipient Flow (Phase 6) | 1.5 days | AI, Roles, Convex |
| 9 | Contributor Dashboard (Phase 5) | 1 day | Roles, Convex |
| 10 | Admin Dashboard (Phase 7) | 1.5 days | AI, Schema |

**Total Estimated Effort: ~10 days**

---

## Environment Variables Required

```env
# Existing
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=

# New
OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing Checklist

### Schema Migration
- [ ] Old tables removed without data loss concerns
- [ ] New tables created with proper indexes
- [ ] User migration handles province/postalCode rename

### AI Verification
- [ ] Gemini Pro Vision correctly extracts bill data
- [ ] Authenticity scoring is reasonable
- [ ] Fraud flags trigger on manipulated images
- [ ] Urgency calculation matches shutoff dates

### User Flows
- [ ] Onboarding captures role correctly
- [ ] Contributors see contributor dashboard
- [ ] Recipients see recipient dashboard
- [ ] Role-based navigation works

### Recipient Flow
- [ ] Bill upload works (PDF, JPG, PNG)
- [ ] AI verification triggers on upload
- [ ] Eligibility check enforces 12-month rolling limit
- [ ] Status updates reflect in My Requests

### Admin Flow
- [ ] Bill queue shows correct priority order
- [ ] AI analysis displays correctly
- [ ] Approve/Reject updates status
- [ ] Payment processing updates bill and pool

### Pool Management
- [ ] Pools auto-create based on location
- [ ] Contributions update pool balance
- [ ] Payments deduct from pool balance
- [ ] Impact reports generate correctly

---

## Future Enhancements (Out of Scope)

- Stripe integration for automated subscriptions
- SMS/email notifications for status updates
- Mobile app
- Utility provider API integrations for direct payment
- Community leaderboards
- Recurring bill detection
- Multi-language support (French for Quebec)
