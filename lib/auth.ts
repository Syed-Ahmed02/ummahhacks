import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type UserRole = "contributor" | "recipient" | null;

/**
 * Require authentication for a route.
 * Redirects to sign-in if user is not authenticated.
 * @returns The authenticated user's Clerk ID
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}

/**
 * Require admin role for a route.
 * Redirects to dashboard if user is not an admin.
 * @returns The authenticated admin user's Clerk ID
 */
export async function requireAdmin(): Promise<string> {
  const userId = await requireAuth();
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard");
  }

  return userId;
}

/**
 * Require contributor role for a route.
 * Redirects to dashboard if user is not a contributor.
 * @returns The authenticated contributor user's Clerk ID
 */
export async function requireContributor(): Promise<string> {
  const userId = await requireAuth();
  const user = await currentUser();

  if (!user || user.publicMetadata?.appRole !== "contributor") {
    redirect("/dashboard");
  }

  return userId;
}

/**
 * Require recipient role for a route.
 * Redirects to dashboard if user is not a recipient.
 * @returns The authenticated recipient user's Clerk ID
 */
export async function requireRecipient(): Promise<string> {
  const userId = await requireAuth();
  const user = await currentUser();

  if (!user || user.publicMetadata?.appRole !== "recipient") {
    redirect("/dashboard");
  }

  return userId;
}

/**
 * Get the current user's application role (contributor or recipient).
 * Returns null if not set or not authenticated.
 */
export async function getUserRole(): Promise<UserRole> {
  const user = await currentUser();
  if (!user) return null;
  
  const role = user.publicMetadata?.appRole;
  if (role === "contributor" || role === "recipient") {
    return role;
  }
  return null;
}

/**
 * Get the current Clerk user.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

/**
 * Check if the current user is an admin.
 * @returns Boolean indicating if user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}

/**
 * Check if the current user is a contributor.
 * @returns Boolean indicating if user is a contributor
 */
export async function isContributor(): Promise<boolean> {
  const user = await currentUser();
  return user?.publicMetadata?.appRole === "contributor";
}

/**
 * Check if the current user is a recipient.
 * @returns Boolean indicating if user is a recipient
 */
export async function isRecipient(): Promise<boolean> {
  const user = await currentUser();
  return user?.publicMetadata?.appRole === "recipient";
}

/**
 * Get the current user's Clerk ID.
 * Returns null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
