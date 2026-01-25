import { Id } from "@/convex/_generated/dataModel";

export type CampaignViewer = {
  userId?: Id<"users"> | null;
  isOwner?: boolean;
  isAdmin?: boolean;
};

export type CampaignData = {
  _id: Id<"campaigns">;
  userId: Id<"users">;
  campaignType: "public" | "anonymous";
  showRecipientName: boolean;
  showRecipientLocation: boolean;
  showBillDetails: boolean;
  title: string;
  description: string;
  utilityType: string;
  utilityProvider: string;
  amountDue: number;
  shutoffDate: number;
  goalAmount?: number;
  currentAmount?: number;
  donationCount?: number;
  user?: {
    city: string;
    province: string;
    email?: string;
  } | null;
};

export type DonationData = {
  _id: Id<"campaignDonations">;
  donorName: string | null;
  isAnonymousDonation: boolean;
  amount: number;
  message: string | null;
  paidAt: number | null;
};

/**
 * Filter campaign data based on privacy settings and viewer
 */
export function filterCampaignData(
  campaign: CampaignData,
  viewer: CampaignViewer
): CampaignData {
  // Owner and admin see everything
  if (viewer.isOwner || viewer.isAdmin) {
    return campaign;
  }

  // For anonymous campaigns, filter sensitive data
  if (campaign.campaignType === "anonymous") {
    return {
      ...campaign,
      // Don't show recipient name
      user: campaign.user
        ? {
            ...campaign.user,
            email: undefined, // Never show email
          }
        : null,
    };
  }

  // Public campaigns show everything except email
  return {
    ...campaign,
    user: campaign.user
      ? {
          ...campaign.user,
          email: undefined, // Never show email publicly
        }
      : null,
  };
}

/**
 * Get display name for campaign recipient
 */
export function getDisplayName(campaign: CampaignData): string {
  if (campaign.campaignType === "anonymous") {
    if (campaign.showRecipientLocation && campaign.user?.city) {
      return `A family in ${campaign.user.city}`;
    }
    return "Someone in need";
  }

  // For public campaigns, we'd need the actual user name
  // For now, return a generic message
  return "Campaign recipient";
}

/**
 * Get display location for campaign
 */
export function getDisplayLocation(campaign: CampaignData): string {
  if (!campaign.user) {
    return "Location not specified";
  }

  if (campaign.campaignType === "anonymous") {
    if (campaign.showRecipientLocation) {
      return campaign.user.city;
    }
    return "Location hidden";
  }

  // Public campaigns can show full location
  return `${campaign.user.city}, ${campaign.user.province}`;
}

/**
 * Filter donation data for display
 */
export function filterDonationData(
  donation: DonationData,
  campaign: CampaignData
): DonationData {
  // If donation is anonymous, hide donor name
  if (donation.isAnonymousDonation) {
    return {
      ...donation,
      donorName: null,
    };
  }

  return donation;
}

/**
 * Check if campaign should show bill details
 */
export function shouldShowBillDetails(
  campaign: CampaignData,
  viewer: CampaignViewer
): boolean {
  // Owner and admin always see details
  if (viewer.isOwner || viewer.isAdmin) {
    return true;
  }

  // Anonymous campaigns hide bill details
  if (campaign.campaignType === "anonymous") {
    return false;
  }

  // Public campaigns respect the setting
  return campaign.showBillDetails;
}
