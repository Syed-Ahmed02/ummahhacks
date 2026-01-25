import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicCampaignHeader } from "@/components/campaigns/PublicCampaignHeader";
import { CampaignProgress } from "@/components/campaigns/CampaignProgress";
import { DonationList } from "@/components/campaigns/DonationList";
import { DonationForm } from "@/components/campaigns/DonationForm";
import { ShareButtons } from "@/components/campaigns/ShareButtons";
import { PrivacyNotice } from "@/components/campaigns/PrivacyNotice";
import { PublicCampaignPageClient } from "./client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // In a real implementation, you'd fetch the campaign here
  // For now, return basic metadata
  return {
    title: "Campaign",
    description: "Help support this utility bill campaign",
  };
}

export default async function PublicCampaignPage({ params }: Props) {
  const { slug } = await params;

  return <PublicCampaignPageClient slug={slug} />;
}
