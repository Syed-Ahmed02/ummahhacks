"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { CampaignTypeSelector, type CampaignType } from "@/components/campaigns/CampaignTypeSelector";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { PrivacySettings } from "@/components/campaigns/PrivacySettings";
import { CampaignPreview } from "@/components/campaigns/CampaignPreview";
import { CampaignImageUploader } from "@/components/campaigns/CampaignImageUploader";
import type { UtilityType } from "@/components/request/UtilityTypeSelector";

type Step = "bill" | "details" | "type" | "privacy" | "image" | "preview" | "success";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const userBills = useQuery(
    api.bills.getUserBills,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const createCampaign = useMutation(api.campaigns.createCampaign);

  const [step, setStep] = useState<Step>("bill");
  const [billSubmissionId, setBillSubmissionId] = useState<Id<"billSubmissions"> | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [campaignType, setCampaignType] = useState<CampaignType | undefined>(undefined);
  const [utilityType, setUtilityType] = useState<UtilityType | null>(null);
  const [utilityProvider, setUtilityProvider] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [shutoffDate, setShutoffDate] = useState("");
  const [showRecipientName, setShowRecipientName] = useState(true);
  const [showRecipientLocation, setShowRecipientLocation] = useState(true);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [heroImageStorageId, setHeroImageStorageId] = useState<string | null>(null);
  const [heroImagePreviewUrl, setHeroImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<Id<"campaigns"> | null>(null);

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

  if (convexUser.role !== "recipient") {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Only Recipients Can Create Campaigns</h2>
            <p className="text-muted-foreground mb-4">
              Campaigns are for recipients who need help with utility bills.
            </p>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBillSelect = (billId: Id<"billSubmissions">) => {
    setBillSubmissionId(billId);
    // Pre-fill form with bill data
    const bill = userBills?.find((b) => b._id === billId);
    if (bill) {
      console.log("Bill selected:", bill); // Debug log
      setUtilityType(bill.utilityType);
      setUtilityProvider(bill.utilityProvider);
      setAmountDue(bill.amountDue.toString());
      // Handle both timestamp (number) and Date formats
      const shutoffTime = typeof bill.shutoffDate === "number" 
        ? bill.shutoffDate 
        : new Date(bill.shutoffDate).getTime();
      const shutoffDateStr = new Date(shutoffTime).toISOString().split("T")[0];
      setShutoffDate(shutoffDateStr);
      setGoalAmount(bill.amountDue.toString());
      console.log("Form prefilled with:", {
        utilityType: bill.utilityType,
        utilityProvider: bill.utilityProvider,
        amountDue: bill.amountDue.toString(),
        shutoffDate: shutoffDateStr,
        goalAmount: bill.amountDue.toString(),
      }); // Debug log
    } else {
      console.warn("Bill not found in userBills array");
    }
    setStep("details");
  };

  const handleNext = () => {
    setError(null);
    if (step === "bill") {
      if (!billSubmissionId) {
        // Allow creating campaign without linking to bill
        setStep("details");
      } else {
        setStep("details");
      }
    } else if (step === "details") {
      if (!title.trim() || !description.trim() || !goalAmount || !utilityType || !utilityProvider || !amountDue || !shutoffDate) {
        setError("Please fill in all required fields");
        return;
      }
      setStep("type");
    } else if (step === "type") {
      if (!campaignType) {
        setError("Please select a campaign type");
        return;
      }
      setStep("privacy");
    } else if (step === "privacy") {
      setStep("image");
    } else if (step === "image") {
      setStep("preview");
    }
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("bill");
    } else if (step === "type") {
      setStep("details");
    } else if (step === "privacy") {
      setStep("type");
    } else if (step === "image") {
      setStep("privacy");
    } else if (step === "preview") {
      setStep("image");
    }
  };

  const handleSubmit = async () => {
    if (!campaignType || !utilityType) {
      setError("Please complete all steps");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const goalAmountNum = parseFloat(goalAmount);
      const amountDueNum = parseFloat(amountDue);
      const shutoffDateNum = new Date(shutoffDate).getTime();

      if (isNaN(goalAmountNum) || goalAmountNum <= 0) {
        throw new Error("Goal amount must be greater than 0");
      }

      if (isNaN(amountDueNum) || amountDueNum <= 0) {
        throw new Error("Amount due must be greater than 0");
      }

      if (isNaN(shutoffDateNum)) {
        throw new Error("Invalid shutoff date");
      }

      const campaignId = await createCampaign({
        userId: convexUser._id,
        billSubmissionId: billSubmissionId ?? undefined,
        title: title.trim(),
        description: description.trim(),
        goalAmount: goalAmountNum,
        campaignType,
        utilityType,
        utilityProvider: utilityProvider.trim(),
        amountDue: amountDueNum,
        shutoffDate: shutoffDateNum,
        showRecipientName,
        showRecipientLocation,
        showBillDetails,
        heroImageStorageId: heroImageStorageId ?? undefined,
      });

      setCreatedCampaignId(campaignId);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success" && createdCampaignId) {
    const campaign = useQuery(api.campaigns.getCampaignById, {
      campaignId: createdCampaignId,
    });

    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Campaign Created Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your campaign is now live and ready to share.
            </p>
            {campaign && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Your campaign link:</p>
                  <code className="text-sm font-mono break-all">
                    {typeof window !== "undefined" && `${window.location.origin}/campaigns/${campaign.shareableSlug}`}
                  </code>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push(`/campaigns/${campaign.shareableSlug}`)}>
                    View Campaign
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/my-campaigns")}>
                    My Campaigns
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Campaign</h1>
        <p className="text-muted-foreground">
          Create a fundraising campaign for your utility bill
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "bill" && (
        <Card>
          <CardHeader>
            <CardTitle>Link to Bill Submission (Optional)</CardTitle>
            <CardDescription>
              You can link this campaign to an existing bill submission, or create a standalone campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userBills && userBills.length > 0 ? (
              <div className="space-y-2">
                {userBills.map((bill) => (
                  <button
                    key={bill._id}
                    type="button"
                    onClick={() => handleBillSelect(bill._id)}
                    className="w-full text-left p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {bill.utilityType.charAt(0).toUpperCase() + bill.utilityType.slice(1)} - {bill.utilityProvider}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${bill.amountDue.toFixed(2)} • Due: {new Date(bill.shutoffDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No bill submissions found. You can still create a campaign.
              </p>
            )}
            <Button onClick={() => setStep("details")} className="w-full">
              Continue Without Linking
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "details" && (
        <div className="space-y-4">
          {billSubmissionId && userBills && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="size-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-green-900">
                    ✓ Bill linked and form prefilled
                  </p>
                  <p className="text-sm text-green-800">
                    {userBills.find((b) => b._id === billSubmissionId) && (
                      <>
                        {userBills.find((b) => b._id === billSubmissionId)!.utilityType.charAt(0).toUpperCase() + 
                         userBills.find((b) => b._id === billSubmissionId)!.utilityType.slice(1)} - {userBills.find((b) => b._id === billSubmissionId)!.utilityProvider} (${userBills.find((b) => b._id === billSubmissionId)!.amountDue.toFixed(2)})
                      </>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBillSubmissionId(null);
                    setUtilityType(null);
                    setUtilityProvider("");
                    setAmountDue("");
                    setShutoffDate("");
                    setGoalAmount("");
                  }}
                  className="ml-auto"
                >
                  Change Bill
                </Button>
              </CardContent>
            </Card>
          )}
          <CampaignForm
            title={title}
            description={description}
            goalAmount={goalAmount}
            utilityType={utilityType}
            utilityProvider={utilityProvider}
            amountDue={amountDue}
            shutoffDate={shutoffDate}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onGoalAmountChange={setGoalAmount}
            onUtilityTypeChange={setUtilityType}
            onUtilityProviderChange={setUtilityProvider}
            onAmountDueChange={setAmountDue}
            onShutoffDateChange={setShutoffDate}
          />
        </div>
      )}

      {step === "type" && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Campaign Type</CardTitle>
            <CardDescription>
              Select whether your campaign will be public or anonymous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignTypeSelector
              onSelect={setCampaignType}
              selectedType={campaignType}
            />
          </CardContent>
        </Card>
      )}

      {step === "privacy" && campaignType && (
        <PrivacySettings
          campaignType={campaignType}
          showRecipientName={showRecipientName}
          showRecipientLocation={showRecipientLocation}
          showBillDetails={showBillDetails}
          onShowRecipientNameChange={setShowRecipientName}
          onShowRecipientLocationChange={setShowRecipientLocation}
          onShowBillDetailsChange={setShowBillDetails}
        />
      )}

      {step === "image" && (
        <CampaignImageUploader
          imageStorageId={heroImageStorageId}
          imagePreviewUrl={heroImagePreviewUrl}
          onImageChange={(storageId, previewUrl) => {
            setHeroImageStorageId(storageId);
            setHeroImagePreviewUrl(previewUrl);
          }}
        />
      )}

      {step === "preview" && campaignType && utilityType && (
        <CampaignPreview
          title={title}
          description={description}
          goalAmount={parseFloat(goalAmount) || 0}
          campaignType={campaignType}
          utilityType={utilityType}
          utilityProvider={utilityProvider}
          amountDue={parseFloat(amountDue) || 0}
          shutoffDate={shutoffDate}
          showRecipientName={showRecipientName}
          showRecipientLocation={showRecipientLocation}
          showBillDetails={showBillDetails}
          imagePreviewUrl={heroImagePreviewUrl}
        />
      )}

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === "bill" || isSubmitting}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        {step === "preview" ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Campaign
                <ArrowRight className="size-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={isSubmitting}>
            Next
            <ArrowRight className="size-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
