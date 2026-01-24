---
name: UI Components and Pages
overview: Build all frontend UI components, pages, and user interfaces for the community investment platform.
todos:
  - id: landing-page
    content: Redesign landing page with hero, how it works, and call-to-action sections
    status: pending
  - id: dashboard-layout
    content: Create dashboard layout with navigation sidebar and header
    status: pending
  - id: dashboard-page
    content: Build main dashboard with stats cards, subscription status, and recent distributions
    status: pending
  - id: reports-list
    content: Create reports list page with filtering and report cards
    status: pending
  - id: report-detail
    content: Create individual report detail page with breakdown and impact metrics
    status: pending
  - id: admin-charities
    content: Build admin charity management pages (list, detail, approval)
    status: pending
  - id: admin-needs
    content: Create admin needs data management page and form
    status: pending
  - id: shared-components
    content: Create shared reusable components (LocationInput, ImpactBadge, etc.)
    status: pending
  - id: navigation
    content: Build navigation components (sidebar, header, user menu)
    status: pending
  - id: polish-ui
    content: Add loading states, error handling, and responsive design polish
    status: pending
isProject: false
---

# UI Components and Pages

## Overview

This plan covers all frontend UI development including landing page, dashboard, admin panels, reports, and reusable components. Uses Next.js 16 App Router and existing shadcn/ui components.

## Landing Page

### File: `app/page.tsx`

Main landing page redesign with:

**Sections:**

- Hero section with tagline
- How it works
- Benefits/features
- Call-to-action
- Footer

### File: `components/landing/Hero.tsx`

Hero section component:

- Main headline: "Don't just donate. Invest where your community needs it most."
- Subheadline explaining the concept
- Primary CTA button (Start Investing)
- Secondary CTA (Learn More)

### File: `components/landing/HowItWorks.tsx`

Step-by-step explanation:

1. Subscribe for weekly amount
2. AI monitors community needs
3. Funds distributed automatically
4. Receive weekly impact report

### File: `components/landing/Features.tsx`

Key features grid:

- Set it and forget it
- AI-powered distribution
- Transparent reporting
- Local impact

## Dashboard

### File: `app/(dashboard)/page.tsx`

Main user dashboard showing:

- Welcome message
- Subscription status card
- Impact statistics
- Recent distributions
- Quick actions

### File: `components/dashboard/StatsCard.tsx`

Statistics display component:

- Total donated
- Charities supported
- Weeks active
- Impact metrics

### File: `components/dashboard/SubscriptionStatus.tsx`

Subscription status card:

- Current status (active/paused/cancelled)
- Weekly amount
- Next billing date
- Manage subscription link

### File: `components/dashboard/RecentDistributions.tsx`

Recent distributions list:

- Last 5 distributions
- Charity name
- Amount
- Date
- Link to full report

### File: `components/dashboard/QuickActions.tsx`

Quick action buttons:

- Manage subscription
- View reports
- Update profile

## Reports

### File: `app/(dashboard)/reports/page.tsx`

Reports list page:

- All weekly reports
- Date range filter
- Total impact summary
- Report cards

### File: `app/(dashboard)/reports/[weekId]/page.tsx`

Individual report detail page:

- Week date range
- Total distributed
- Distribution breakdown
- Charity details
- AI explanations
- Impact metrics

### File: `components/reports/ReportCard.tsx`

Report card component for list view:

- Week date
- Total amount
- Number of charities
- Preview of top charity

### File: `components/reports/DistributionBreakdown.tsx`

Visual breakdown of distributions:

- Chart/graph of allocations
- List of charities with amounts
- AI explanations for each

### File: `components/reports/ImpactMetrics.tsx`

Impact metrics display:

- Lives impacted (estimated)
- Meals provided (estimated)
- Other impact calculations

## Subscription Pages

### File: `app/(dashboard)/subscribe/page.tsx`

Subscription creation page (covered in Stripe plan).

### File: `app/(dashboard)/subscription/page.tsx`

Subscription management page (covered in Stripe plan).

## Admin Panel

### File: `app/(dashboard)/admin/layout.tsx`

Admin layout with:

- Admin navigation sidebar
- Role verification
- Admin-only access

### File: `app/(dashboard)/admin/charities/page.tsx`

Charity management list:

- All charities table
- Filter by status (pending/approved/rejected)
- Search functionality
- Create new charity button

### File: `app/(dashboard)/admin/charities/[id]/page.tsx`

Charity detail/approval page:

- Charity information display
- Approval/rejection actions
- Edit charity details
- View needs data
- View distribution history

### File: `components/admin/CharityForm.tsx`

Charity creation/edit form:

- Name, description
- Location (city, state, zip)
- Category
- Contact information
- Website

### File: `components/admin/CharityTable.tsx`

Charities table component:

- Sortable columns
- Status badges
- Action buttons
- Pagination

### File: `app/(dashboard)/admin/needs/page.tsx`

Needs data management:

- List of all needs
- Filter by charity/city
- Manual entry form
- Bulk import (future)

### File: `components/admin/NeedsForm.tsx`

Needs entry form:

- Charity selector
- Urgency score (0-100)
- Funding gap amount
- Category
- Notes

## Shared Components

### File: `components/shared/LocationInput.tsx`

Reusable location input:

- City, state, zip code fields
- Validation
- Auto-complete (optional)

### File: `components/shared/ImpactBadge.tsx`

Badge showing impact metrics:

- Reusable across pages
- Customizable metrics

### File: `components/shared/LoadingSpinner.tsx`

Loading state component.

### File: `components/shared/ErrorBoundary.tsx`

Error boundary for graceful error handling.

## Navigation

### File: `components/navigation/DashboardNav.tsx`

Dashboard navigation sidebar:

- Dashboard
- Reports
- Subscription
- Profile
- Admin (if admin)

### File: `components/navigation/Header.tsx`

Top header bar:

- Logo
- User menu
- Notifications (future)

## Layouts

### File: `app/(dashboard)/layout.tsx`

Dashboard layout wrapper:

- Navigation sidebar
- Header
- Main content area
- Footer (optional)

## Styling

- Use existing Tailwind CSS setup
- Leverage shadcn/ui components
- Maintain consistent design system
- Responsive design for mobile

## Dependencies

- Requires Auth plan for protected routes
- Requires Convex plan for data queries
- Requires Stripe plan for subscription UI
- Uses existing shadcn/ui component library

## Implementation Steps

1. Redesign landing page with hero and features
2. Create dashboard layout and navigation
3. Build main dashboard page with stats and recent activity
4. Create reports list and detail pages
5. Build admin charity management pages
6. Create admin needs management page
7. Create shared reusable components
8. Add loading and error states
9. Implement responsive design
10. Polish UI/UX and add animations