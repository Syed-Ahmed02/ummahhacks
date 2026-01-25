"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Combined user data from Clerk and Convex
 */
export type CombinedUser = {
  // Clerk data
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  isAdmin: boolean;
  // Convex data
  convexId: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  role: "contributor" | "recipient" | null;
  createdAt: number | null;
  hasCompletedOnboarding: boolean;
};

/**
 * Hook that combines Clerk and Convex user data.
 * 
 * @returns Combined user object with loading and error states
 */
export function useUser() {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();

  // Get Convex user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Determine loading state
  const isLoading = !clerkLoaded || (clerkUser && convexUser === undefined);

  // Build combined user object
  const user: CombinedUser | null = clerkUser
    ? {
        // Clerk data
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        fullName: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
        isAdmin: clerkUser.publicMetadata?.role === "admin",
        // Convex data
        convexId: convexUser?._id ?? null,
        city: convexUser?.city ?? null,
        province: convexUser?.province ?? null,
        postalCode: convexUser?.postalCode ?? null,
        role: convexUser?.role ?? null,
        createdAt: convexUser?.createdAt ?? null,
        hasCompletedOnboarding: !!convexUser,
      }
    : null;

  return {
    user,
    isLoading,
    isSignedIn: isSignedIn ?? false,
    clerkUser,
    convexUser,
  };
}
