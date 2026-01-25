"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UtilityTypeSelector,
  type UtilityType,
} from "@/components/request/UtilityTypeSelector";
import { BillUploader } from "@/components/request/BillUploader";
import { formatCurrency, UTILITY_PROVIDERS, type ProvinceCode } from "@/lib/constants/canada";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

type Step = "utility" | "upload" | "details" | "review" | "success";

export default function SubmitBillPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  // Query to get the Convex user
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Query to get user's pool (based on their location)
  const userPool = useQuery(
    api.pools.getPoolByLocation,
    convexUser ? { city: convexUser.city, province: convexUser.province } : "skip"
  );

  // Check eligibility
  const eligibility = useQuery(
    api.bills.checkEligibility,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const submitBill = useMutation(api.bills.submitBill);
  const triggerVerification = useAction(api.ai.triggerVerification);

  // Form state
  const [step, setStep] = useState<Step>("utility");
  const [utilityType, setUtilityType] = useState<UtilityType | null>(null);
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);
  const [utilityProvider, setUtilityProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [originalDueDate, setOriginalDueDate] = useState("");
  const [shutoffDate, setShutoffDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading states
  if (!isClerkLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clerkUser) {
    router.push("/sign-in");
    return null;
  }

  if (convexUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!convexUser) {
    router.push("/onboarding");
    return null;
  }

  // Only recipients can submit bills
  if (convexUser.role !== "recipient") {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Contributors Cannot Submit Bills</h2>
            <p className="text-muted-foreground mb-4">
              Only recipients can submit utility bills for assistance. If you need help with your
              utility bills, please update your role in your profile settings.
            </p>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check eligibility
  if (eligibility && !eligibility.eligible) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Assistance Limit Reached</h2>
            <p className="text-muted-foreground mb-4">
              You have received the maximum of 3 bill payments in the past 12 months.
              {eligibility.nextEligibleDate && (
                <>
                  {" "}
                  You will be eligible again on{" "}
                  {new Date(eligibility.nextEligibleDate).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  .
                </>
              )}
            </p>
            <Button onClick={() => router.push("/my-requests")}>View My Requests</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get providers for user's province
  const provinceProviders = convexUser.province
    ? UTILITY_PROVIDERS[convexUser.province as ProvinceCode]
    : null;

  const getProvidersForType = () => {
    if (!provinceProviders || !utilityType) return [];
    return provinceProviders[utilityType] || [];
  };

  const handleSubmit = async () => {
    if (!convexUser || !userPool || !storageId || !utilityType) {
      setError("Missing required information");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const billId = await submitBill({
        userId: convexUser._id,
        poolId: userPool._id,
        utilityType,
        utilityProvider,
        accountNumber,
        amountDue: parseFloat(amountDue),
        originalDueDate: new Date(originalDueDate).getTime(),
        shutoffDate: new Date(shutoffDate).getTime(),
        documentStorageId: storageId,
      });

      // Trigger AI verification asynchronously (don't block on it)
      triggerVerification({ billId }).catch(console.error);

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedFromUtility = utilityType !== null;
  const canProceedFromUpload = storageId !== null;
  const canProceedFromDetails =
    utilityProvider && accountNumber && amountDue && originalDueDate && shutoffDate;

  const renderStep = () => {
    switch (step) {
      case "utility":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Select Utility Type</h2>
              <p className="text-muted-foreground text-sm mb-4">
                What type of utility bill do you need help with?
              </p>
            </div>
            <UtilityTypeSelector selected={utilityType} onSelect={setUtilityType} />
            <div className="flex justify-end">
              <Button onClick={() => setStep("upload")} disabled={!canProceedFromUtility}>
                Continue
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Upload Your Bill</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Upload a photo or scan of your utility bill. Make sure the bill clearly shows
                the amount due, due date, and account information.
              </p>
            </div>
            <BillUploader
              onUploadComplete={setStorageId}
              onError={(err) => setError(err)}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("utility")}>
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button onClick={() => setStep("details")} disabled={!canProceedFromUpload}>
                Continue
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Bill Details</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Please enter the details from your utility bill.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Utility Provider</Label>
                <select
                  id="provider"
                  value={utilityProvider}
                  onChange={(e) => setUtilityProvider(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select provider...</option>
                  {getProvidersForType().map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {utilityProvider === "other" && (
                  <Input
                    placeholder="Enter provider name"
                    onChange={(e) => setUtilityProvider(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Account Number</Label>
                <Input
                  id="account"
                  placeholder="Enter your account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Due (CAD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Original Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={originalDueDate}
                    onChange={(e) => setOriginalDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shutoffDate">Shutoff/Disconnect Date</Label>
                  <Input
                    id="shutoffDate"
                    type="date"
                    value={shutoffDate}
                    onChange={(e) => setShutoffDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button onClick={() => setStep("review")} disabled={!canProceedFromDetails}>
                Review
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Review Your Request</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Please review your information before submitting.
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utility Type</span>
                  <span className="font-medium capitalize">{utilityType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{utilityProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-medium">{accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Due</span>
                  <span className="font-medium">{formatCurrency(parseFloat(amountDue))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">
                    {new Date(originalDueDate).toLocaleDateString("en-CA")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shutoff Date</span>
                  <span className="font-medium">
                    {new Date(shutoffDate).toLocaleDateString("en-CA")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {eligibility && (
              <div className="rounded-lg border border-border p-4 text-sm">
                <p>
                  After this request, you will have{" "}
                  <span className="font-medium">
                    {eligibility.remainingAssistance - 1} of 3
                  </span>{" "}
                  assistance requests remaining this year.
                </p>
              </div>
            )}

            {error && (
              <div className="border border-destructive/50 text-destructive rounded-lg p-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("details")}>
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <CheckCircle className="size-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your bill has been submitted for verification. We'll review it and notify you
              once it's been processed. This usually takes 1-2 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.push("/my-requests")}>
                View My Requests
              </Button>
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
          </div>
        );
    }
  };

  // Progress indicator
  const steps: Step[] = ["utility", "upload", "details", "review"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-2xl font-bold">Submit a Utility Bill</h1>
        <p className="text-muted-foreground">
          Get help paying your utility bill from your community pool.
        </p>
      </div>

      {step !== "success" && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span className="capitalize">{step}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">{renderStep()}</CardContent>
      </Card>
    </div>
  );
}
