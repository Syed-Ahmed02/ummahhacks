"use client";

import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Calendar, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/constants/canada";
import { getDisplayName, getDisplayLocation } from "@/lib/campaigns/privacy";
import type { CampaignData } from "@/lib/campaigns/privacy";

type PublicCampaignHeaderProps = {
  campaign: CampaignData;
};

export function PublicCampaignHeader({ campaign }: PublicCampaignHeaderProps) {
  const isAnonymous = campaign.campaignType === "anonymous";
  const displayName = getDisplayName(campaign);
  const displayLocation = getDisplayLocation(campaign);
  const shutoffDate = new Date(campaign.shutoffDate);
  const daysUntilShutoff = Math.ceil(
    (shutoffDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isAnonymous ? "secondary" : "default"}>
              {isAnonymous ? (
                <>
                  <EyeOff className="size-3 mr-1" />
                  Anonymous
                </>
              ) : (
                <>
                  <Eye className="size-3 mr-1" />
                  Public
                </>
              )}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-3 text-slate-900">
            {campaign.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
            {campaign.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {displayLocation && (
          <div className="flex items-center gap-1">
            <MapPin className="size-4" />
            <span>{displayLocation}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="size-4" />
          <span>
            {daysUntilShutoff > 0
              ? `${daysUntilShutoff} days until shutoff`
              : "Shutoff date: " + shutoffDate.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
