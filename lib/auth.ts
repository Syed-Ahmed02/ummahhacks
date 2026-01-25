import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
 * Get the current user's Clerk ID.
 * Returns null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
