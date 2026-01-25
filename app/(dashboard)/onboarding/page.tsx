"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationForm, type LocationFormData } from "@/components/onboarding/LocationForm";
import { RoleSelector, type Role } from "@/components/onboarding/RoleSelector";
import {
  ContributionSetup,
  type ContributionData,
} from "@/components/onboarding/ContributionSetup";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ArrowLeft, ArrowRight } from "lucide-react";

type OnboardingStep = "role" | "location" | "confirmation" | "contribution";

type OnboardingData = {
  role?: Role;
  location?: LocationFormData;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded: clerkLoaded } = useUser();
  const [step, setStep] = useState<OnboardingStep>("role");
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user already exists in Convex
  const existingUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const createUser = useMutation(api.users.createUser);
  const getOrCreatePool = useMutation(api.pools.getOrCreatePool);

  // Redirect to dashboard if user already completed onboarding
  useEffect(() => {
    if (existingUser) {
      router.replace("/dashboard");
    }
  }, [existingUser, router]);

  const handleRoleSelect = (role: Role) => {
    setOnboardingData((prev) => ({ ...prev, role }));
  };

  const handleRoleContinue = () => {
    if (onboardingData.role) {
      setStep("location");
    }
  };

  const handleLocationSubmit = async (data: LocationFormData) => {
    setOnboardingData((prev) => ({ ...prev, location: data }));
    setStep("confirmation");
  };

  const handleConfirmation = async () => {
    if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
      setError("Unable to get user information. Please try signing in again.");
      return;
    }

    if (!onboardingData.role || !onboardingData.location) {
      setError("Please complete all steps before continuing.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        city: onboardingData.location.city,
        province: onboardingData.location.province,
        postalCode: onboardingData.location.postalCode,
        role: onboardingData.role,
      });

      await getOrCreatePool({
        city: onboardingData.location.city,
        province: onboardingData.location.province,
        postalCode: onboardingData.location.postalCode,
      });

      // If contributor, go to contribution step; otherwise, go to dashboard
      if (onboardingData.role === "contributor") {
        setStep("contribution");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to create user:", err);
      setError("Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContributionSkip = () => {
    router.push("/dashboard");
  };

  const handleContributionContinue = async (data: ContributionData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: data.amount,
          paymentType: data.paymentType,
          interval: data.interval,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error("Failed to create checkout session:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === "location") {
      setStep("role");
    } else if (step === "confirmation") {
      setStep("location");
    }
    // Note: Can't go back from contribution step since user is already created
  };

  // Get steps for indicator based on role
  const getSteps = () => {
    if (onboardingData.role === "contributor") {
      return ["role", "location", "confirmation", "contribution"];
    }
    return ["role", "location", "confirmation"];
  };

  const steps = getSteps();
  const currentStepIndex = steps.indexOf(step);

  // Get step description
  const getStepDescription = () => {
    switch (step) {
      case "role":
        return "How would you like to participate?";
      case "location":
        return "Where are you located?";
      case "confirmation":
        return "Confirm your details";
      case "contribution":
        return "Set up your contribution";
      default:
        return "";
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
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to Community Invest
          </h1>
          <p className="mt-2 text-muted-foreground">{getStepDescription()}</p>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-colors ${
                  step === s
                    ? "bg-foreground"
                    : currentStepIndex > i
                      ? "bg-muted-foreground"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === "role" && (
            <div className="space-y-6">
              <RoleSelector
                onSelect={handleRoleSelect}
                selectedRole={onboardingData.role}
              />
              <Button
                onClick={handleRoleContinue}
                disabled={!onboardingData.role}
                className="w-full gap-2"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Location Detection */}
          {step === "location" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We&apos;ll use your location to connect you with your local community pool.
              </p>
              <LocationForm
                initialData={onboardingData.location}
                onSubmit={handleLocationSubmit}
                submitLabel="Continue"
              />
              <Button
                variant="ghost"
                onClick={handleBack}
                className="w-full gap-2"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirmation" && onboardingData.role && onboardingData.location && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Your Role
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {onboardingData.role === "contributor"
                      ? "Contributor - Help neighbors with utility bills"
                      : "Recipient - Get help with urgent utility bills"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {onboardingData.location.city}, {onboardingData.location.province}
                    {onboardingData.location.postalCode && ` ${onboardingData.location.postalCode}`}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  {onboardingData.role === "contributor" ? (
                    <>
                      As a contributor, you&apos;ll join your local community pool and help 
                      neighbors facing utility shut-offs. Your contributions go directly 
                      to utility providers.
                    </>
                  ) : (
                    <>
                      As a recipient, you can submit urgent utility bills for assistance.
                      Our AI verifies bills and approved payments go directly to your 
                      utility provider.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleConfirmation}
                  disabled={isSubmitting}
                  className="w-full gap-2"
                >
                  {isSubmitting
                    ? "Creating account..."
                    : onboardingData.role === "contributor"
                      ? "Continue"
                      : "Complete Setup"}
                  {!isSubmitting && <ArrowRight className="size-4" />}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="w-full gap-2"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Contribution Setup (Contributors only) */}
          {step === "contribution" && (
            <ContributionSetup
              onSkip={handleContributionSkip}
              onContinue={handleContributionContinue}
              isLoading={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
