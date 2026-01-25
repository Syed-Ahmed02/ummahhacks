"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { PublicCampaignHeader } from "@/components/campaigns/PublicCampaignHeader";
import { CampaignProgress } from "@/components/campaigns/CampaignProgress";
import { DonationList } from "@/components/campaigns/DonationList";
import { DonationForm } from "@/components/campaigns/DonationForm";
import { ShareButtons } from "@/components/campaigns/ShareButtons";
import { ShareModal } from "@/components/campaigns/ShareModal";
import { PrivacyNotice } from "@/components/campaigns/PrivacyNotice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { filterCampaignData } from "@/lib/campaigns/privacy";
import type { CampaignData } from "@/lib/campaigns/privacy";
import { formatCurrency } from "@/lib/constants/canada";
import {
  CalendarClock,
  DollarSign,
  HeartHandshake,
  MapPin,
  Share2,
  Target,
} from "lucide-react";

type PublicCampaignPageClientProps = {
  slug: string;
};

export function PublicCampaignPageClient({ slug }: PublicCampaignPageClientProps) {
  const router = useRouter();
  const campaign = useQuery(api.campaigns.getCampaignBySlug, { slug });
  const donations = useQuery(
    api.campaigns.getCampaignDonations,
    campaign?._id ? { campaignId: campaign._id, limit: 10 } : "skip"
  );

  const [isProcessingDonation, setIsProcessingDonation] = React.useState(false);
  const donateSectionRef = React.useRef<HTMLDivElement | null>(null);
  const [heroImage, setHeroImage] = React.useState<string | null>(null);
  const [shareCopied, setShareCopied] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);

  const DEFAULT_CAMPAIGN_IMAGE = "/default-campaign-image.png";

  // Set hero image from campaign or use fallback
  React.useEffect(() => {
    if (campaign?.heroImageUrl) {
      setHeroImage(campaign.heroImageUrl);
    } else {
      // Use default fallback from public folder
      setHeroImage(DEFAULT_CAMPAIGN_IMAGE);
    }
  }, [campaign?.heroImageUrl]);

  if (campaign === undefined || donations === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign || !campaign.isActive) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground">
              This campaign doesn't exist or is no longer active.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter campaign data for public view
  const filteredCampaign = filterCampaignData(campaign as CampaignData, {
    userId: null,
    isOwner: false,
    isAdmin: false,
  });

  const locationLabel = filteredCampaign.user?.city
    ? filteredCampaign.user.province
      ? `${filteredCampaign.user.city}, ${filteredCampaign.user.province}`
      : filteredCampaign.user.city
    : "Your community";

  const campaignUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const donationCount = campaign.donationCount ?? donations?.length ?? 0;

  const handleScrollToDonate = () => {
    donateSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShareClick = () => {
    setShareOpen(true);
  };

  const handleDonate = async (data: {
    amount: number;
    donorName?: string;
    donorEmail: string;
    isAnonymous: boolean;
    message?: string;
  }) => {
    setIsProcessingDonation(true);
    try {
      const response = await fetch("/api/stripe/campaign-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign._id,
          amount: data.amount,
          donorName: data.donorName,
          donorEmail: data.donorEmail,
          isAnonymous: data.isAnonymous,
          message: data.message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process donation");
      }

      const { clientSecret, donationId } = await response.json();

      // Redirect to Stripe Checkout
      // In a real implementation, you'd use Stripe.js to handle the payment
      // For now, we'll show a success message
      router.push(`/campaigns/${slug}/donation/success?donation_id=${donationId}`);
    } catch (error) {
      setIsProcessingDonation(false);
      throw error;
    }
  };

  return (
    <div className="bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-wide text-primary">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  Utility Relief Campaign
                </span>
                <span className="text-muted-foreground">
                  Supporting families in need
                </span>
              </div>

              <div className="space-y-3">
                <PublicCampaignHeader campaign={filteredCampaign} />
                {/* Progress moved near the top for immediate visibility */}
                <CampaignProgress
                  currentAmount={campaign.currentAmount ?? 0}
                  goalAmount={campaign.goalAmount ?? 0}
                  donationCount={donationCount}
                  onRefetch={() => router.refresh()}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="gap-2 px-6 shadow-sm"
                  onClick={handleScrollToDonate}
                >
                  <DollarSign className="size-4" />
                  Donate Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 px-6"
                  onClick={handleShareClick}
                >
                  <Share2 className="size-4" />
                  Share Campaign
                </Button>
              </div>

              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                <StatCard
                  icon={<DollarSign className="size-4 text-green-600" />}
                  label="Raised"
                  value={formatCurrency(campaign.currentAmount ?? 0)}
                />
                <StatCard
                  icon={<Target className="size-4 text-sky-600" />}
                  label="Goal"
                  value={formatCurrency(campaign.goalAmount ?? 0)}
                />
                <StatCard
                  icon={<HeartHandshake className="size-4 text-amber-600" />}
                  label="Donations"
                  value={`${donationCount}+`}
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage || ""}
                  alt="Community relief"
                  className="h-full w-full object-cover"
                  onError={() => setHeroImage(DEFAULT_CAMPAIGN_IMAGE)}
                />
              </div>
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                <CalendarClock className="size-4 text-primary" />
                <span>Urgent Assistance Needed</span>
              </div>
              <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                <MapPin className="size-4 text-primary" />
                <span>{locationLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-12">
        <div className="space-y-6">
          <PrivacyNotice campaignType={filteredCampaign.campaignType} />

          {/* Progress shown above in hero; removed from here */}

          <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]" ref={donateSectionRef}>
            <div className="space-y-6">
              <DonationForm
                campaignId={filteredCampaign._id}
                minAmount={1}
                onDonate={handleDonate}
                isProcessing={isProcessingDonation}
              />
            </div>
            <div className="space-y-6">
              <DonationList
                donations={(donations || []).map((d) => ({
                  ...d,
                  donorName: d.donorName,
                  isAnonymousDonation: d.isAnonymousDonation,
                  amount: d.amount,
                  message: d.message,
                  paidAt: d.paidAt,
                }))}
                campaign={filteredCampaign}
              />
            </div>
          </div>

          <Card id="share">
            <CardContent className="p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Share this campaign</h3>
                  <span className="text-sm text-muted-foreground">Every share helps reach the goal</span>
                </div>
                <ShareButtons
                  url={campaignUrl}
                  title={filteredCampaign.title}
                  description={filteredCampaign.description}
                />
              </div>
            </CardContent>
          </Card>
          <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} url={campaignUrl} />
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

