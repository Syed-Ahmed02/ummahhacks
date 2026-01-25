"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharityPreferences } from "@/components/settings/CharityPreferences";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ExternalLink, User, CreditCard } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  // Get Convex user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

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
          Unable to load settings. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your preferences and account settings.
        </p>
      </div>

      {/* Charity Preferences (Contributors only) */}
      {convexUser.role === "contributor" && (
        <CharityPreferences
          userId={convexUser._id}
          initialPreferences={convexUser.charityPreferences}
        />
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <h2 className="font-medium text-foreground">Quick Links</h2>
          <p className="text-sm text-muted-foreground">
            Access other account settings and management pages.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            render={<Link href="/dashboard/profile" />}
            nativeButton={false}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <User className="size-4" />
            Manage Profile & Location
            <ExternalLink className="size-3 ml-auto opacity-50" />
          </Button>

          {convexUser.role === "contributor" && (
            <Button
              render={<Link href="/subscription" />}
              nativeButton={false}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <CreditCard className="size-4" />
              Manage Subscription & Billing
              <ExternalLink className="size-3 ml-auto opacity-50" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            {convexUser.role === "contributor" ? (
              <>
                Your charity preferences determine which types of utility assistance
                your contributions will support. By default, all utility types are
                enabled. You can opt out of specific categories if you prefer.
              </>
            ) : (
              <>
                As a recipient, you can submit utility bills for assistance. Visit your
                profile to update your location or switch roles.
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
