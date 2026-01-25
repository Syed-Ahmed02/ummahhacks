"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Filter,
  DollarSign,
  HeartHandshake,
  Zap,
  Droplets,
  Flame,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/constants/canada";
import { LocationBadge } from "./LocationBadge";
import { ImagePreview } from "./ImagePreview";
import type { Id } from "@/convex/_generated/datamodel";

interface CampaignFilters {
  utilityType?: string;
  showOnlyNearby: boolean;
  sortBy: "urgent" | "funded" | "recent" | "nearest";
}

interface CampaignCardProps {
  id: Id<"campaigns">;
  title: string;
  description: string;
  utilityType: string;
  currentAmount: number;
  goalAmount: number;
  donationCount: number;
  shutoffDate: number;
  heroImageUrl?: string;
  shareableSlug: string;
  city?: string;
  province?: string;
  isNearUser?: boolean;
}

/**
 * Campaign Discovery Page
 * Shows campaigns filtered by location and other criteria
 */
export function CampaignDiscoveryPage() {
  const activeCampaigns = useQuery(api.campaigns.listActiveCampaigns);
  const [filters, setFilters] = useState<CampaignFilters>({
    showOnlyNearby: true,
    sortBy: "urgent",
  });

  const utilityTypeIcons: Record<string, React.ReactNode> = {
    electric: <Zap className="size-4 text-yellow-600" />,
    water: <Droplets className="size-4 text-blue-600" />,
    gas: <Flame className="size-4 text-orange-600" />,
    heating: <Wind className="size-4 text-purple-600" />,
  };

  const getDaysUntilShutoff = (shutoffDate: number) => {
    const daysLeft = Math.ceil((shutoffDate - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return "text-red-600 bg-red-50";
    if (daysLeft <= 7) return "text-orange-600 bg-orange-50";
    return "text-yellow-600 bg-yellow-50";
  };

  const getUrgencyLabel = (daysLeft: number) => {
    if (daysLeft <= 0) return "OVERDUE";
    if (daysLeft === 1) return "TOMORROW";
    if (daysLeft <= 3) return "CRITICAL";
    if (daysLeft <= 7) return "URGENT";
    return `${daysLeft} DAYS LEFT`;
  };

  if (!activeCampaigns) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading campaigns...</div>
      </div>
    );
  }

  let filteredCampaigns = [...activeCampaigns];

  // Apply filters
  if (filters.utilityType) {
    filteredCampaigns = filteredCampaigns.filter(
      (c) => c.utilityType === filters.utilityType
    );
  }

  // Sort campaigns
  if (filters.sortBy === "urgent") {
    filteredCampaigns.sort(
      (a, b) => b.shutoffDate - a.shutoffDate // Nearest shutoff first
    );
  } else if (filters.sortBy === "funded") {
    filteredCampaigns.sort(
      (a, b) => (b.currentAmount / b.goalAmount) - (a.currentAmount / a.goalAmount)
    );
  } else if (filters.sortBy === "recent") {
    filteredCampaigns.sort((a, b) => {
      const aDate = (a as any).createdAt || 0;
      const bDate = (b as any).createdAt || 0;
      return bDate - aDate;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Support Campaigns
          </h1>
          <p className="text-xl text-gray-600">
            Discover campaigns in your area and make a difference in your community
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
            <Filter className="size-5 text-gray-600" />

            <div className="flex-1 flex flex-wrap gap-4">
              {/* Utility Type Filter */}
              <div className="flex gap-2">
                <Button
                  variant={filters.utilityType === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, utilityType: undefined })}
                >
                  All Utilities
                </Button>
                <Button
                  variant={filters.utilityType === "electric" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, utilityType: "electric" })}
                  className="gap-2"
                >
                  <Zap className="size-4" />
                  Electric
                </Button>
                <Button
                  variant={filters.utilityType === "water" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, utilityType: "water" })}
                  className="gap-2"
                >
                  <Droplets className="size-4" />
                  Water
                </Button>
                <Button
                  variant={filters.utilityType === "gas" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, utilityType: "gas" })}
                  className="gap-2"
                >
                  <Flame className="size-4" />
                  Gas
                </Button>
                <Button
                  variant={filters.utilityType === "heating" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, utilityType: "heating" })}
                  className="gap-2"
                >
                  <Wind className="size-4" />
                  Heating
                </Button>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2 ml-auto">
                <Button
                  variant={filters.sortBy === "urgent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, sortBy: "urgent" })}
                >
                  Most Urgent
                </Button>
                <Button
                  variant={filters.sortBy === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, sortBy: "recent" })}
                >
                  Newest
                </Button>
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <MapPin className="size-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              ✓ Showing campaigns near you. 
              <Button
                variant="link"
                size="sm"
                className="text-blue-600 underline p-0 h-auto"
                onClick={() =>
                  setFilters({ ...filters, showOnlyNearby: !filters.showOnlyNearby })
                }
              >
                {filters.showOnlyNearby ? "Show all campaigns" : "Show only nearby"}
              </Button>
            </p>
          </div>
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <p className="text-gray-600 mb-4">No campaigns found with your filters.</p>
              <Button
                onClick={() =>
                  setFilters({
                    utilityType: undefined,
                    showOnlyNearby: true,
                    sortBy: "urgent",
                  })
                }
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => {
              const daysLeft = getDaysUntilShutoff(campaign.shutoffDate);
              const progressPercent = (campaign.currentAmount / campaign.goalAmount) * 100;

              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.shareableSlug}`}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <ImagePreview
                        src={campaign.heroImageUrl || null}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />

                      {/* Urgency Badge */}
                      <div
                        className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold ${getUrgencyColor(daysLeft)}`}
                      >
                        {getUrgencyLabel(daysLeft)}
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {campaign.title}
                          </h3>
                        </div>
                        {utilityTypeIcons[campaign.utilityType]}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        <LocationBadge
                          city={campaign.city}
                          province={campaign.province}
                          isNearUser={campaign.isNearUser}
                          showLocation={true}
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col gap-4">
                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {campaign.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(campaign.currentAmount)}
                          </span>
                          <span className="text-gray-600">
                            of {formatCurrency(campaign.goalAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {Math.round(progressPercent)}% funded
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <HeartHandshake className="size-4" />
                          <span>{campaign.donationCount} donors</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <Button className="w-full mt-auto gap-2">
                        <DollarSign className="size-4" />
                        Donate Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
