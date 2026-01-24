---
name: Stripe Payments Integration
overview: Set up Stripe subscriptions, checkout flow, webhook handling, and payment management for weekly recurring donations.
todos:
  - id: stripe-config
    content: Create lib/stripe.ts with Stripe client setup and helper functions
    status: pending
  - id: checkout-page
    content: Create subscribe page with amount selection and Stripe Checkout integration
    status: pending
  - id: checkout-api
    content: Create API route for creating Stripe Checkout sessions
    status: pending
  - id: webhook-handler
    content: Create webhook handler for subscription lifecycle events
    status: pending
  - id: subscription-page
    content: Create subscription management page with status and controls
    status: pending
  - id: cancel-api
    content: Create API route for canceling subscriptions
    status: pending
  - id: update-api
    content: Create API route for updating subscription amounts
    status: pending
  - id: payment-method
    content: Create payment method management page and Customer Portal integration
    status: pending
  - id: status-component
    content: Create reusable SubscriptionStatus component
    status: pending
  - id: test-webhooks
    content: Test webhook handling with Stripe CLI and verify Convex updates
    status: pending
isProject: false
---

# Stripe Payments Integration

## Overview

This plan covers Stripe integration for weekly subscription payments, checkout flow, webhook handling, and subscription management. Stripe packages are already installed.

## Stripe Configuration

### File: `lib/stripe.ts`

Stripe client setup:

- Server-side Stripe client initialization
- Client-side Stripe.js initialization
- Helper functions for common operations

## Subscription Creation

### File: `app/(dashboard)/subscribe/page.tsx`

Subscription setup page with:

- Amount selection (default $15/week)
- Stripe Checkout integration
- Redirect to Stripe hosted checkout
- Success/cancel handling

**Flow:**

1. User selects weekly amount
2. Create Stripe Checkout Session with:

   - Recurring weekly billing
   - Success URL with session ID
   - Cancel URL

3. Redirect to Stripe Checkout
4. On return, verify and create subscription in Convex

### File: `app/api/stripe/create-checkout/route.ts`

API route to create Stripe Checkout Session:

- Create customer if needed
- Create subscription with weekly interval
- Return session URL

## Webhook Handling

### File: `app/api/stripe/webhook/route.ts`

Handle Stripe webhook events:

**Events to handle:**

- `checkout.session.completed` - Create subscription in Convex
- `customer.subscription.created` - Update subscription status
- `customer.subscription.updated` - Update subscription (amount, status)
- `customer.subscription.deleted` - Cancel subscription
- `invoice.payment_succeeded` - Record successful payment
- `invoice.payment_failed` - Handle failed payment

**Implementation:**

- Verify webhook signature
- Parse event type
- Update Convex database accordingly
- Return 200 status

## Subscription Management

### File: `app/(dashboard)/subscription/page.tsx`

Subscription management page showing:

- Current subscription status
- Weekly amount
- Next billing date
- Payment method
- Cancel/pause options

### File: `app/api/stripe/cancel-subscription/route.ts`

API route to cancel subscription:

- Cancel in Stripe
- Update status in Convex
- Handle proration if needed

### File: `app/api/stripe/update-subscription/route.ts`

API route to update subscription amount:

- Update in Stripe
- Update in Convex
- Handle proration

## Payment Method Management

### File: `app/(dashboard)/subscription/payment-method/page.tsx`

Page to manage payment methods:

- View current payment method
- Update payment method via Stripe Customer Portal
- Add new payment method

### File: `app/api/stripe/create-portal-session/route.ts`

Create Stripe Customer Portal session for self-service:

- Payment method updates
- Billing history
- Invoice downloads

## Subscription Status Component

### File: `components/subscription/SubscriptionStatus.tsx`

Reusable component showing:

- Active/Paused/Cancelled badge
- Next billing date
- Weekly amount
- Quick actions

## Stripe Connect (Future)

### File: `app/api/stripe/transfer/route.ts`

Placeholder for Stripe Connect integration:

- Transfer funds to charity accounts
- For MVP, can simulate transfers
- Track in Convex distributions table

## Environment Variables

```
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Dependencies

- Requires Convex plan for subscription data storage
- Requires Auth plan for user identification
- Uses existing shadcn/ui components for UI

## Stripe Product Setup

**Product Configuration:**

- Product name: "Community Investment"
- Billing: Recurring
- Interval: Weekly
- Currency: USD
- Amount: Variable (user selects)

## Implementation Steps

1. Create `lib/stripe.ts` with Stripe client configuration
2. Create subscription checkout page
3. Create API route for checkout session creation
4. Create webhook handler for Stripe events
5. Create subscription management page
6. Create API routes for cancel/update subscription
7. Create payment method management page
8. Create Customer Portal integration
9. Create subscription status component
10. Test webhook handling with Stripe CLI
11. Test full subscription flow end-to-end