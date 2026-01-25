"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LocationForm, type LocationFormData } from "@/components/onboarding/LocationForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded: clerkLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user already exists in Convex
  const existingUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const createUser = useMutation(api.users.createUser);

  // Redirect to dashboard if user already completed onboarding
  useEffect(() => {
    if (existingUser) {
      router.replace("/dashboard");
    }
  }, [existingUser, router]);

  const handleSubmit = async (data: LocationFormData) => {
    if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
      setError("Unable to get user information. Please try signing in again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to create user:", err);
      setError("Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth and existing user
  if (!clerkLoaded || existingUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If existingUser is not null, we're redirecting
  if (existingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to Community Invest
          </h1>
          <p className="mt-2 text-muted-foreground">
            We'll use your location to connect you with local charities making an impact in your community.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <LocationForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
