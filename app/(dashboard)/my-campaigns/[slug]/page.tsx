"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignProgress } from "@/components/campaigns/CampaignProgress";
import { DonationList } from "@/components/campaigns/DonationList";
import { ShareButtons } from "@/components/campaigns/ShareButtons";
import {
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/constants/canada";

type CampaignDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [resolvedParams, setResolvedParams] = React.useState<{ slug: string } | null>(null);

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const campaign = useQuery(
    api.campaigns.getCampaignBySlug,
    resolvedParams ? { slug: resolvedParams.slug } : "skip"
  );

  const donations = useQuery(
    api.campaigns.getCampaignDonations,
    campaign?._id ? { campaignId: campaign._id } : "skip"
  );

  const completeCampaign = useMutation(api.campaigns.completeCampaign);

  const [isCompleting, setIsCompleting] = React.useState(false);

  if (!isClerkLoaded || !resolvedParams) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (convexUser === undefined || campaign === undefined || donations === undefined) {
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

  if (!campaign) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This campaign doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push("/my-campaigns")}>Back to Campaigns</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user owns this campaign
  const isAdmin = clerkUser?.publicMetadata?.role === "admin";
  if (campaign.userId !== convexUser._id && !isAdmin) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to view this campaign.
            </p>
            <Button onClick={() => router.push("/my-campaigns")}>Back to Campaigns</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const campaignUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/campaigns/${campaign.shareableSlug}`
      : "";

  const handleComplete = async () => {
    if (!confirm("Are you sure you want to mark this campaign as completed?")) {
      return;
    }

    setIsCompleting(true);
    try {
      await completeCampaign({ campaignId: campaign._id });
    } catch (error) {
      console.error("Failed to complete campaign:", error);
      alert("Failed to complete campaign");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={campaign.campaignType === "anonymous" ? "secondary" : "default"}>
              {campaign.campaignType === "anonymous" ? "Anonymous" : "Public"}
            </Badge>
            {campaign.isCompleted && (
              <Badge variant="default" className="bg-green-500">
                Completed
              </Badge>
            )}
          </div>
        </div>
        <p className="text-muted-foreground whitespace-pre-wrap">{campaign.description}</p>
      </div>

      <div className="space-y-6">
        <CampaignProgress
          currentAmount={campaign.currentAmount}
          goalAmount={campaign.goalAmount}
          donationCount={campaign.donationCount}
        />

        <Card>
          <CardHeader>
            <CardTitle>Campaign Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Utility Type</p>
                <p className="font-medium">
                  {campaign.utilityType.charAt(0).toUpperCase() + campaign.utilityType.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utility Provider</p>
                <p className="font-medium">{campaign.utilityProvider}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="font-medium">{formatCurrency(campaign.amountDue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shutoff Date</p>
                <p className="font-medium">
                  {new Date(campaign.shutoffDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {campaign.billSubmissionId && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Linked to bill submission</p>
                  <Button variant="link" size="sm" asChild>
                    <Link href={`/my-requests`}>
                      View Bill
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <DonationList
          donations={(donations || []).map((d) => ({
            ...d,
            donorName: d.donorName,
            isAnonymousDonation: d.isAnonymousDonation,
            amount: d.amount,
            message: d.message,
            paidAt: d.paidAt,
          }))}
          campaign={{
            ...campaign,
            campaignType: campaign.campaignType,
            showRecipientName: campaign.showRecipientName,
            showRecipientLocation: campaign.showRecipientLocation,
            showBillDetails: campaign.showBillDetails,
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Share Campaign</CardTitle>
            <CardDescription>
              Share your campaign link to reach more donors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Campaign URL</p>
              <code className="text-sm font-mono break-all">{campaignUrl}</code>
            </div>
            <ShareButtons
              url={campaignUrl}
              title={campaign.title}
              description={campaign.description}
            />
            <Button variant="outline" asChild>
              <Link href={`/campaigns/${campaign.shareableSlug}`} target="_blank">
                <ExternalLink className="size-4 mr-2" />
                View Public Page
              </Link>
            </Button>
          </CardContent>
        </Card>

        {!campaign.isCompleted && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                variant="outline"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4 mr-2" />
                    Mark as Completed
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

