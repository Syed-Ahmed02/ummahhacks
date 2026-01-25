"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/constants/canada";
import { Eye, EyeOff, ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

type CampaignCardProps = {
  _id: Id<"campaigns">;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  campaignType: "public" | "anonymous";
  isActive: boolean;
  isCompleted: boolean;
  shareableSlug: string;
  donationCount: number;
  createdAt: number;
};

export function CampaignCard({
  _id,
  title,
  description,
  goalAmount,
  currentAmount,
  campaignType,
  isActive,
  isCompleted,
  shareableSlug,
  donationCount,
  createdAt,
}: CampaignCardProps) {
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
  const campaignUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/campaigns/${shareableSlug}`
      : "";

  const handleShare = async () => {
    if (navigator.share && campaignUrl) {
      try {
        await navigator.share({
          title,
          text: description.substring(0, 100),
          url: campaignUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log("Share cancelled or failed");
      }
    } else if (campaignUrl) {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(campaignUrl);
      alert("Campaign link copied to clipboard!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant={campaignType === "anonymous" ? "secondary" : "default"}>
                {campaignType === "anonymous" ? (
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
              {isCompleted && (
                <Badge variant="default" className="bg-green-500">
                  Completed
                </Badge>
              )}
              {!isActive && !isCompleted && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(currentAmount)} raised
            </span>
            <span className="text-muted-foreground">
              of {formatCurrency(goalAmount)} goal
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{donationCount} donations</span>
          <span>
            Created {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/campaigns/${shareableSlug}`}>
              <ExternalLink className="size-4 mr-2" />
              View Public Page
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="size-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/my-campaigns/${shareableSlug}`}>
              Manage
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
