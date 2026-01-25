---
name: Authentication Setup
overview: Set up Clerk authentication, user onboarding, protected routes, and user profile management.
todos:
  - id: clerk-middleware
    content: Create middleware.ts for route protection and authentication redirects
    status: completed
  - id: auth-pages
    content: Create sign-in and sign-up pages using Clerk components
    status: completed
  - id: onboarding-flow
    content: Build onboarding page with location form and Convex integration
    status: completed
  - id: dashboard-layout
    content: Create dashboard layout with authentication checks and navigation
    status: completed
  - id: profile-page
    content: Create user profile page with location editing
    status: completed
  - id: admin-protection
    content: Create admin layout and role checking utilities
    status: completed
  - id: auth-helpers
    content: Create lib/auth.ts with requireAuth and requireAdmin helpers
    status: completed
  - id: user-hook
    content: Create useUser hook combining Clerk and Convex user data
    status: completed
  - id: clerk-webhook
    content: Set up Clerk webhook handler for user sync (optional)
    status: completed
isProject: false
---

# Authentication Setup

## Overview

This plan covers Clerk authentication integration, user onboarding flow, protected routes, and user profile management. Clerk is already installed in the project.

## Clerk Configuration

### File: `proxy.ts` (root)

Set up Clerk middleware for route protection:

- Protect all `/dashboard/*` routes
- Allow public access to landing page and auth pages
- Handle authentication redirects

### File: `lib/clerk.ts`

Clerk client utilities and helpers.

## Authentication Pages

### File: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`

Clerk sign-in page with custom styling to match brand.

### File: `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

Clerk sign-up page with custom styling.

## User Onboarding

### File: `app/(dashboard)/onboarding/page.tsx`

Post-signup onboarding flow to capture:

- City
- State
- Zip code

**Features:**

- Redirect if user already completed onboarding
- Form validation
- Save to Convex via `createUser` mutation
- Redirect to dashboard after completion

### File: `components/onboarding/LocationForm.tsx`

Reusable location input form component.

## Protected Route Layout

### File: `app/(dashboard)/layout.tsx`

Dashboard layout with:

- Clerk authentication check
- Redirect to sign-in if not authenticated
- Check for onboarding completion
- Navigation sidebar/header

## User Profile Management

### File: `app/(dashboard)/profile/page.tsx`

User profile page showing:

- Current location
- Edit location form
- Account settings link to Clerk

### File: `components/profile/LocationEditor.tsx`

Component for editing user location.

## Admin Role Protection

### File: `lib/auth.ts`

Helper functions:

- `requireAuth()` - Ensure user is authenticated
- `requireAdmin()` - Ensure user has admin role
- `getCurrentUser()` - Get current Clerk user

### File: `app/(dashboard)/admin/layout.tsx`

Admin layout that:

- Checks for admin role via Clerk
- Redirects non-admins
- Provides admin navigation

## Clerk Webhooks (Optional)

### File: `app/api/clerk/webhook/route.ts`

Handle Clerk webhook events:

- `user.created` - Sync new user to Convex
- `user.updated` - Update user in Convex
- `user.deleted` - Handle user deletion

## Integration with Convex

### User Sync

When user signs up:

1. User completes Clerk sign-up
2. Redirect to onboarding
3. Onboarding saves to Convex via `createUser` mutation
4. Store Clerk user ID for future lookups

### User Context

Create React context or hook to access:

- Current user from Clerk
- User data from Convex
- Loading states

### File: `hooks/useUser.ts`

Custom hook combining Clerk and Convex user data.

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET= (optional)
```

## Dependencies

- Requires Convex plan for user data storage
- Uses existing shadcn/ui components for forms

## Implementation Steps

1. Create `middleware.ts` for route protection
2. Create Clerk sign-in and sign-up pages
3. Create onboarding flow page and components
4. Create dashboard layout with auth checks
5. Create user profile page
6. Create admin layout with role checks
7. Create auth helper utilities
8. Create user hook combining Clerk + Convex data
9. Set up Clerk webhook handler (optional)
10. Test authentication flow end-to-end
