"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationEditor } from "@/components/profile/LocationEditor";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ExternalLink } from "lucide-react";

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Get Convex user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const updateUser = useMutation(api.users.updateUser);

  if (!clerkLoaded || convexUser === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!convexUser) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          Unable to load profile. Please try refreshing the page.
        </div>
      </div>
    );
  }

  const handleSwitchRole = async () => {
    if (!convexUser) return;

    setIsSwitching(true);
    setSwitchError(null);

    try {
      const nextRole = convexUser.role === "contributor" ? "recipient" : "contributor";
      await updateUser({
        userId: convexUser._id,
        role: nextRole,
      });
    } catch (error) {
      setSwitchError(error instanceof Error ? error.message : "Failed to switch role");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and location settings.
        </p>
      </div>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <h2 className="font-medium text-foreground">Account</h2>
          <p className="text-sm text-muted-foreground">
            Your account is managed by Clerk.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-foreground">
              {clerkUser?.fullName ?? clerkUser?.firstName ?? "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-foreground">
              {clerkUser?.primaryEmailAddress?.emailAddress ?? "Not set"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Open Clerk user profile in a new tab
              window.open("https://accounts.clerk.dev/user", "_blank");
            }}
          >
            <ExternalLink className="size-4 mr-2" />
            Manage Account
          </Button>
        </CardContent>
      </Card>

      {/* Role Switcher */}
      <Card>
        <CardHeader>
          <h2 className="font-medium text-foreground">Role</h2>
          <p className="text-sm text-muted-foreground">
            Switch your role to preview contributor or recipient experiences.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current role</p>
            <p className="text-foreground capitalize">{convexUser.role}</p>
          </div>
          {switchError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {switchError}
            </div>
          )}
          <Button onClick={handleSwitchRole} disabled={isSwitching} variant="outline">
            {isSwitching
              ? "Switching..."
              : `Switch to ${convexUser.role === "contributor" ? "recipient" : "contributor"}`}
          </Button>
        </CardContent>
      </Card>

      {/* Location Editor */}
      <LocationEditor
        userId={convexUser._id}
        initialData={{
          city: convexUser.city,
          province: convexUser.province,
          postalCode: convexUser.postalCode,
        }}
      />
    </div>
  );
}
