"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const campaigns = useQuery(
    api.campaigns.getUserCampaigns,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  if (!isClerkLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (convexUser === undefined || campaigns === undefined) {
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
      <div className="container max-w-4xl py-8">
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

  const activeCampaigns = campaigns?.filter((c) => c.isActive && !c.isCompleted) || [];
  const completedCampaigns = campaigns?.filter((c) => c.isCompleted) || [];
  const inactiveCampaigns = campaigns?.filter((c) => !c.isActive && !c.isCompleted) || [];

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your fundraising campaigns for utility bills
          </p>
        </div>
        <Button asChild>
          <Link href="/my-campaigns/create">
            <Plus className="size-4 mr-2" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {campaigns && campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any campaigns yet.
            </p>
            <Button asChild>
              <Link href="/my-campaigns/create">
                <Plus className="size-4 mr-2" />
                Create Your First Campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {activeCampaigns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeCampaigns.map((campaign) => (
                  <CampaignCard key={campaign._id} {...campaign} />
                ))}
              </div>
            </div>
          )}

          {completedCampaigns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Campaigns</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedCampaigns.map((campaign) => (
                  <CampaignCard key={campaign._id} {...campaign} />
                ))}
              </div>
            </div>
          )}

          {inactiveCampaigns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Inactive Campaigns</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {inactiveCampaigns.map((campaign) => (
                  <CampaignCard key={campaign._id} {...campaign} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
