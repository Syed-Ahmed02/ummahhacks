---
name: Convex Backend Setup
overview: Set up Convex database schema, backend functions, and scheduled jobs for the community investment platform.
todos:
  - id: create-schema
    content: Create convex/schema.ts with all table definitions, types, and indexes
    status: pending
  - id: user-functions
    content: Create convex/users.ts with user CRUD operations and Clerk ID lookups
    status: pending
  - id: subscription-functions
    content: Create convex/subscriptions.ts with subscription management and queries
    status: pending
  - id: charity-functions
    content: Create convex/charities.ts with charity CRUD, approval workflow, and city-based queries
    status: pending
  - id: needs-functions
    content: Create convex/needs.ts with needs data management and urgency tracking
    status: pending
  - id: distribution-functions
    content: Create convex/distributions.ts with distribution record management
    status: pending
  - id: report-functions
    content: Create convex/reports.ts with report generation and retrieval
    status: pending
  - id: portfolio-manager
    content: Create convex/portfolioManager.ts with distribution calculation algorithm (AI integration comes later)
    status: pending
  - id: scheduled-jobs
    content: Create convex/scheduled.ts with weekly cron jobs for distribution and reports
  - id: charity-coordinates
    content: Add latitude/longitude fields to charity schema and functions for map integration
    status: pending
isProject: false
---

# Convex Backend Setup

## Overview

This plan covers all Convex backend infrastructure including database schema, serverless functions, and scheduled jobs. Convex serves as the real-time database and backend for the platform.

## Database Schema

### File: `convex/schema.ts`

Define all tables with proper types:

**users**

- `_id`: Id<"users">
- `clerkId`: string (unique, indexed)
- `email`: string
- `city`: string
- `state`: string
- `zipCode`: string
- `createdAt`: number (timestamp)
- `updatedAt`: number (timestamp)

**subscriptions**

- `_id`: Id<"subscriptions">
- `userId`: Id<"users">
- `amount`: number (weekly amount in cents)
- `status`: "active" | "paused" | "cancelled"
- `stripeSubscriptionId`: string (unique, indexed)
- `stripeCustomerId`: string
- `startDate`: number (timestamp)
- `lastDistributionDate`: number | null
- `createdAt`: number
- `updatedAt`: number

**charities**

- `_id`: Id<"charities">
- `name`: string
- `description`: string
- `city`: string
- `state`: string
- `zipCode`: string
- `latitude`: number | null (for map display)
- `longitude`: number | null (for map display)
- `category`: string
- `verificationStatus`: "pending" | "approved" | "rejected"
- `adminNotes`: string | null
- `website`: string | null
- `contactEmail`: string | null
- `createdAt`: number
- `approvedAt`: number | null
- `approvedBy`: Id<"users"> | null

**needsData**

- `_id`: Id<"needsData">
- `charityId`: Id<"charities">
- `urgencyScore`: number (0-100)
- `fundingGap`: number (amount needed in cents)
- `category`: string
- `lastUpdated`: number
- `source`: "manual" | "api" | "calculated"
- `metadata`: v.any() (flexible JSON for different data sources)

**distributions**

- `_id`: Id<"distributions">
- `subscriptionId`: Id<"subscriptions">
- `charityId`: Id<"charities">
- `amount`: number (in cents)
- `distributionDate`: number
- `weekStartDate`: number
- `reason`: string (AI explanation)
- `createdAt`: number

**reports**

- `_id`: Id<"reports">
- `userId`: Id<"users">
- `weekStartDate`: number
- `totalDistributed`: number
- `charitiesSupported`: number
- `distributionBreakdown`: v.array(v.object({ charityId: v.id("charities"), amount: v.number(), reason: v.string() }))
- `generatedAt`: number

## Convex Functions

### File: `convex/users.ts`

**Functions:**

- `createUser` (mutation) - Create user from Clerk data
- `updateUser` (mutation) - Update user profile (location, etc.)
- `getUserByClerkId` (query) - Get user by Clerk ID
- `getUserById` (query) - Get user by Convex ID
- `getUserByEmail` (query) - Get user by email

### File: `convex/subscriptions.ts`

**Functions:**

- `createSubscription` (mutation) - Create subscription record
- `updateSubscription` (mutation) - Update subscription status/amount
- `getSubscriptionByStripeId` (query) - Get subscription by Stripe subscription ID
- `getUserSubscriptions` (query) - Get all subscriptions for a user
- `getActiveSubscriptionsByCity` (query) - Get all active subscriptions in a city
- `cancelSubscription` (mutation) - Cancel subscription

### File: `convex/charities.ts`

**Functions:**

- `createCharity` (mutation) - Create charity (admin)
- `updateCharity` (mutation) - Update charity details
- `approveCharity` (mutation) - Approve charity (admin only)
- `rejectCharity` (mutation) - Reject charity (admin only)
- `getCharity` (query) - Get single charity
- `getCharitiesByCity` (query) - Get approved charities in a city
- `getCharitiesWithCoordinates` (query) - Get charities with valid coordinates for map display
- `updateCharityCoordinates` (mutation) - Update latitude/longitude (for geocoding)
- `getPendingCharities` (query) - Get pending charities (admin)
- `getAllCharities` (query) - Get all charities with filters

### File: `convex/needs.ts`

**Functions:**

- `createNeed` (mutation) - Create/update need data for charity
- `updateNeed` (mutation) - Update need urgency/funding gap
- `getNeedsByCharity` (query) - Get needs for a charity
- `getNeedsByCity` (query) - Get all needs for charities in a city
- `getActiveNeeds` (query) - Get needs with urgency > threshold

### File: `convex/distributions.ts`

**Functions:**

- `createDistribution` (mutation) - Record a fund distribution
- `getDistributionsBySubscription` (query) - Get distributions for a subscription
- `getDistributionsByUser` (query) - Get all distributions for a user
- `getDistributionsByCharity` (query) - Get distributions to a charity
- `getDistributionsByWeek` (query) - Get distributions for a specific week

### File: `convex/reports.ts`

**Functions:**

- `generateReport` (mutation) - Generate weekly report for user
- `getUserReports` (query) - Get all reports for a user
- `getReport` (query) - Get specific report
- `getLatestReport` (query) - Get user's latest report

### File: `convex/portfolioManager.ts`

**Functions:**

- `calculateDistribution` (mutation) - Calculate optimal distribution for a city
- `distributeFunds` (mutation) - Execute fund distribution for a week
- `getDistributionPreview` (query) - Preview distribution without executing

**Distribution Algorithm:**

1. Aggregate all active subscriptions for target week
2. Group subscriptions by city
3. For each city:

   - Get approved charities in city
   - Get current needs data for each charity
   - Calculate weights: urgencyScore * fundingGap
   - Normalize weights to percentages
   - Allocate funds proportionally
   - Generate AI explanations (calls AI service)

### File: `convex/scheduled.ts`

**Scheduled Functions:**

- `weeklyDistribution` (cron: weekly on Monday) - Run portfolio manager and distribute funds
- `generateWeeklyReports` (cron: weekly after distribution) - Generate reports for all users
- `updateNeedsData` (cron: daily) - Refresh needs data from external sources (future)

## Indexes

Add indexes in `schema.ts` for performance:

- `users.clerkId` (unique)
- `subscriptions.stripeSubscriptionId` (unique)
- `subscriptions.userId`
- `subscriptions.status`
- `charities.city`
- `charities.verificationStatus`
- `needsData.charityId`
- `distributions.subscriptionId`
- `distributions.weekStartDate`
- `reports.userId`
- `reports.weekStartDate`

## Dependencies

- Requires Auth plan for user authentication context
- Requires Stripe plan for subscription webhook integration
- Requires AI plan for distribution explanations

## Environment Variables

```
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

## Implementation Steps

1. Create `convex/schema.ts` with all table definitions and indexes
2. Create `convex/users.ts` with user management functions
3. Create `convex/subscriptions.ts` with subscription functions
4. Create `convex/charities.ts` with charity management functions
5. Create `convex/needs.ts` with needs tracking functions
6. Create `convex/distributions.ts` with distribution functions
7. Create `convex/reports.ts` with report generation functions
8. Create `convex/portfolioManager.ts` with distribution algorithm
9. Create `convex/scheduled.ts` with cron jobs
10. Add coordinate fields to charity schema for map integration
11. Add functions to update and query charity coordinates
12. Test all functions with Convex dashboard