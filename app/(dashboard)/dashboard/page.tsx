"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";
import { RecentDistributions } from "@/components/dashboard/RecentDistributions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CharityProjectsMap } from "@/components/map/CharityProjectsMap";
import { ImpactBadgeGroup } from "@/components/shared/ImpactBadge";
import { mockCharities, mockDistributions, mockStats } from "@/lib/mock-data";
import { DollarSign, Heart, Calendar, Utensils } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Welcome back</h1>
        <p className="text-muted-foreground mt-1">
          Here’s your impact at a glance.
        </p>
      </div>

      <QuickActions />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Impact statistics
        </h2>
        <StatsCard
          title="Total donated"
          value={`$${mockStats.totalDonated.toLocaleString()}`}
          icon={<DollarSign className="size-5" />}
        />
        <StatsCard
          title="Charities supported"
          value={mockStats.charitiesSupported}
          icon={<Heart className="size-5" />}
        />
        <StatsCard
          title="Weeks active"
          value={mockStats.weeksActive}
          icon={<Calendar className="size-5" />}
        />
        <StatsCard
          title="Meals provided (est.)"
          value={mockStats.mealsProvided.toLocaleString()}
          icon={<Utensils className="size-5" />}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <SubscriptionStatus status="active" weeklyAmount={20} nextBillingDate="Jan 27, 2025" />
          <RecentDistributions distributions={mockDistributions} reportWeekId="w1" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-medium text-foreground mb-3 text-lg">Charity projects map</h2>
            <CharityProjectsMap
              charities={mockCharities}
              distributions={mockDistributions}
              height={320}
            />
          </div>
          <div>
            <h2 className="font-medium text-foreground mb-3 text-lg">Impact metrics</h2>
            <ImpactBadgeGroup
              metrics={[
                { label: "Lives impacted", value: mockStats.livesImpacted },
                { label: "Meals provided", value: mockStats.mealsProvided, unit: "est." },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
