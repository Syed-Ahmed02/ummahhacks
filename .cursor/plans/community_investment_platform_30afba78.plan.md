---
name: Community Investment Platform
overview: Build a subscription-based donation platform with AI-driven portfolio management that automatically distributes weekly contributions to local charities based on real-time community needs.
todos:
  - id: setup-schema
    content: Create Convex schema.ts with all table definitions (users, subscriptions, charities, needsData, distributions, reports)
    status: pending
  - id: auth-setup
    content: Set up Clerk authentication with middleware, create sign-in/sign-up pages, and user onboarding flow
    status: pending
  - id: user-management
    content: Create Convex user functions and sync Clerk user data to Convex database
    status: pending
  - id: stripe-integration
    content: Set up Stripe client, create subscription checkout flow, and webhook handler for subscription events
    status: pending
  - id: subscription-ui
    content: Build subscription creation page and subscription management dashboard
    status: pending
  - id: charity-admin
    content: Create admin panel for charity registration, approval workflow, and charity management
    status: pending
  - id: needs-tracking
    content: Build needs data entry system and structure for external API integrations
    status: pending
  - id: portfolio-manager
    content: Implement AI Portfolio Manager algorithm with distribution logic and AI explanation generation
    status: pending
  - id: scheduled-distributions
    content: Create Convex scheduled function for weekly fund distribution and report generation
    status: pending
  - id: reports-system
    content: Build weekly report generation, user reports dashboard, and individual report view pages
    status: pending
  - id: user-dashboard
    content: Create main user dashboard with stats, recent distributions, and subscription status
    status: pending
  - id: landing-page
    content: Design and build compelling landing page with hero, how it works, and call-to-action
    status: pending
isProject: false
---

# Community Investment Platform - Implementation Plan

## Architecture Overview

The platform consists of:

- **Frontend**: Next.js 16 with App Router, shadcn/ui components
- **Backend**: Convex for database and serverless functions
- **Authentication**: Clerk (already installed)
- **Payments**: Stripe subscriptions with weekly billing
- **AI Engine**: Portfolio Manager that analyzes needs and distributes funds

## Database Schema (Convex)

### Core Tables

**users** (extends Clerk user data)

- `clerkId`: string (primary key)
- `email`: string
- `city`: string
- `state`: string
- `zipCode`: string
- `createdAt`: timestamp

**subscriptions**

- `userId`: Id<"users">
- `amount`: number (weekly amount in cents)
- `status`: "active" | "paused" | "cancelled"
- `stripeSubscriptionId`: string
- `stripeCustomerId`: string
- `startDate`: timestamp
- `lastDistributionDate`: timestamp | null

**charities**

- `name`: string
- `description`: string
- `city`: string
- `state`: string
- `zipCode`: string
- `category`: string (e.g., "shelter", "food", "education")
- `verificationStatus`: "pending" | "approved" | "rejected"
- `adminNotes`: string | null
- `website`: string | null
- `contactEmail`: string | null
- `createdAt`: timestamp
- `approvedAt`: timestamp | null

**needsData** (tracks community needs)

- `charityId`: Id<"charities">
- `urgencyScore`: number (0-100)
- `fundingGap`: number (amount needed in cents)
- `category`: string
- `lastUpdated`: timestamp
- `source`: "manual" | "api" | "calculated"
- `metadata`: object (flexible for different data sources)

**distributions** (fund allocation records)

- `subscriptionId`: Id<"subscriptions">
- `charityId`: Id<"charities">
- `amount`: number (in cents)
- `distributionDate`: timestamp
- `weekStartDate`: timestamp
- `reason`: string (AI explanation)

**reports** (weekly user reports)

- `userId`: Id<"users">
- `weekStartDate`: timestamp
- `totalDistributed`: number
- `charitiesSupported`: number
- `distributionBreakdown`: array of { charityId, amount, reason }
- `generatedAt`: timestamp

## Implementation Components

### 1. Authentication & User Setup

**Files to create:**

- `app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Clerk sign-in page
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Clerk sign-up page
- `app/(dashboard)/onboarding/page.tsx` - User location setup after sign-up
- `convex/users.ts` - User CRUD operations

**Key features:**

- Clerk middleware for protected routes
- Onboarding flow to capture user location (city/state/zip)
- Sync Clerk user data to Convex

### 2. Subscription Management

**Files to create:**

- `app/(dashboard)/subscribe/page.tsx` - Subscription setup page
- `app/(dashboard)/subscription/page.tsx` - Manage active subscription
- `app/api/stripe/webhook/route.ts` - Stripe webhook handler
- `convex/subscriptions.ts` - Subscription management functions
- `lib/stripe.ts` - Stripe client configuration

**Key features:**

- Stripe Checkout for subscription creation
- Weekly recurring billing setup
- Webhook handling for subscription events (created, updated, cancelled)
- Subscription status management in Convex

### 3. Charity Management (Admin)

**Files to create:**

- `app/(dashboard)/admin/charities/page.tsx` - Charity list and approval
- `app/(dashboard)/admin/charities/[id]/page.tsx` - Charity detail/approval
- `convex/charities.ts` - Charity CRUD and approval functions

**Key features:**

- Admin-only routes (role check via Clerk)
- Charity registration form
- Approval/rejection workflow
- Charity profile management

### 4. Community Needs Tracking

**Files to create:**

- `convex/needs.ts` - Needs data management
- `app/(dashboard)/admin/needs/page.tsx` - Manual needs input (admin)
- `lib/integrations/` - External API integrations (placeholder structure)

**Key features:**

- Manual needs entry by admins
- API integration structure for external data sources
- Urgency scoring algorithm
- Funding gap calculation

### 5. AI Portfolio Manager

**Files to create:**

- `convex/portfolioManager.ts` - Core AI distribution logic
- `convex/scheduled.ts` - Scheduled functions for weekly distribution
- `lib/ai/distribution.ts` - AI analysis functions (using AI SDK)

**Key features:**

- Algorithm to analyze all active subscriptions in a city
- Calculate optimal distribution based on:
  - Urgency scores
  - Funding gaps
  - Category diversity
  - Historical distribution patterns
- Generate distribution explanations
- Execute weekly fund distribution

**Distribution Algorithm Logic:**

1. Aggregate all active subscriptions for the week
2. Group by city
3. For each city:

   - Get all approved charities in that city
   - Get current needs data for each charity
   - Calculate distribution weights based on urgency and funding gaps
   - Allocate funds proportionally
   - Generate explanations for each allocation

### 6. Fund Distribution System

**Files to create:**

- `convex/distributions.ts` - Distribution record management
- `app/api/stripe/transfer/route.ts` - Stripe transfer to charities (or simulate)

**Key features:**

- Record all distributions in database
- Integration with Stripe Connect (for actual transfers) or simulation
- Distribution history tracking
- Weekly batch processing

### 7. Weekly Reports

**Files to create:**

- `convex/reports.ts` - Report generation
- `app/(dashboard)/reports/page.tsx` - User reports list
- `app/(dashboard)/reports/[weekId]/page.tsx` - Individual report view
- `components/reports/ReportCard.tsx` - Report display component

**Key features:**

- Automatic weekly report generation
- Email notifications (via Clerk or email service)
- Visual breakdown of distributions
- Impact metrics and stories

### 8. User Dashboard

**Files to create:**

- `app/(dashboard)/page.tsx` - Main dashboard
- `components/dashboard/StatsCard.tsx` - Statistics display
- `components/dashboard/RecentDistributions.tsx` - Recent activity
- `components/dashboard/SubscriptionStatus.tsx` - Current subscription info

**Key features:**

- Overview of subscription status
- Total impact metrics
- Recent distributions
- Quick actions (manage subscription, view reports)

### 9. Landing Page

**Files to create:**

- `app/page.tsx` - Redesigned landing page
- `components/landing/Hero.tsx` - Hero section with tagline
- `components/landing/HowItWorks.tsx` - Feature explanation
- `components/landing/Testimonials.tsx` - Social proof (optional)

**Key features:**

- Compelling hero with tagline: "Don't just donate. Invest where your community needs it most."
- Clear value proposition
- How it works section
- Call-to-action to subscribe

## Technical Implementation Details

### Stripe Integration

- Use Stripe Subscriptions API for recurring weekly payments
- Stripe webhooks for subscription lifecycle events
- Stripe Connect for eventual fund transfers to charities (MVP can simulate)

### Convex Scheduled Functions

- Weekly cron job to:

  1. Collect all active subscriptions
  2. Run portfolio manager algorithm
  3. Create distribution records
  4. Generate reports
  5. Trigger notifications

### AI Integration

- Use AI SDK with OpenAI/Anthropic to:
  - Analyze needs data and generate distribution explanations
  - Provide natural language reasoning for fund allocation
  - Generate personalized report narratives

### Location Matching

- Match user subscriptions to charities in the same city
- Support city-level geographic filtering
- Future: expand to zip code or state level

## Environment Variables Needed

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
OPENAI_API_KEY= (or ANTHROPIC_API_KEY)
```

## File Structure

```
app/
  (auth)/
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  (dashboard)/
    page.tsx
    onboarding/page.tsx
    subscribe/page.tsx
    subscription/page.tsx
    reports/
      page.tsx
      [weekId]/page.tsx
    admin/
      charities/
        page.tsx
        [id]/page.tsx
      needs/page.tsx
  api/
    stripe/
      webhook/route.ts
      transfer/route.ts
  layout.tsx
  page.tsx (landing)

convex/
  _generated/
  users.ts
  subscriptions.ts
  charities.ts
  needs.ts
  distributions.ts
  reports.ts
  portfolioManager.ts
  scheduled.ts
  schema.ts

components/
  dashboard/
    StatsCard.tsx
    RecentDistributions.tsx
    SubscriptionStatus.tsx
  reports/
    ReportCard.tsx
  landing/
    Hero.tsx
    HowItWorks.tsx
  ui/ (existing shadcn components)

lib/
  stripe.ts
  utils.ts
  ai/
    distribution.ts
  integrations/
    (placeholder for external APIs)
```

## Implementation Order

1. **Phase 1: Foundation**

   - Set up Convex schema
   - Configure Clerk authentication
   - Create user onboarding flow
   - Set up basic dashboard layout

2. **Phase 2: Subscriptions**

   - Stripe integration
   - Subscription creation flow
   - Webhook handling
   - Subscription management UI

3. **Phase 3: Charity Management**

   - Admin panel
   - Charity approval workflow
   - Needs data entry system

4. **Phase 4: AI Portfolio Manager**

   - Distribution algorithm
   - AI explanation generation
   - Scheduled weekly distribution

5. **Phase 5: Reports & Polish**

   - Report generation
   - User-facing reports UI
   - Landing page redesign
   - Email notifications (optional)

## Key Considerations

- **MVP Fund Transfers**: For MVP, can simulate transfers and track in database. Real Stripe Connect integration can be added later.
- **Data Sources**: Start with manual entry, add API integrations incrementally
- **AI Explanations**: Use AI to generate human-readable explanations for why funds were allocated to each charity
- **Scalability**: Convex handles real-time updates automatically, good for dashboard updates
- **Security**: Admin routes protected by Clerk role checks, payment data handled by Stripe