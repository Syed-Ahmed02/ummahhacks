"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, CANADIAN_PROVINCES } from "@/lib/constants/canada";
import {
  Loader2,
  Users,
  DollarSign,
  Heart,
  TrendingUp,
  MapPin,
  Building2,
} from "lucide-react";

type Pool = Doc<"communityPools">;

function getProvinceName(code: string): string {
  const province = CANADIAN_PROVINCES.find((p) => p.code === code);
  return province?.name ?? code;
}

function getPoolHealth(pool: {
  totalFundsAvailable: number;
  weeklyContributions: number;
}): { status: "healthy" | "moderate" | "low"; label: string; color: string } {
  // Pool is healthy if funds cover at least 2 weeks of average bill payments (~$200/bill)
  const healthRatio = pool.totalFundsAvailable / Math.max(pool.weeklyContributions, 100);

  if (healthRatio >= 4) {
    return { status: "healthy", label: "Healthy", color: "bg-green-500" };
  }
  if (healthRatio >= 2) {
    return { status: "moderate", label: "Moderate", color: "bg-yellow-500" };
  }
  return { status: "low", label: "Low Funds", color: "bg-red-500" };
}

export default function AdminPoolsPage() {
  const pools = useQuery(api.pools.getAllPools);
  const isLoading = pools === undefined;

  // Calculate aggregate stats
  const aggregateStats = pools
    ? {
        totalPools: pools.length,
        totalContributors: pools.reduce((sum: number, p: Pool) => sum + p.totalContributors, 0),
        totalFundsAvailable: pools.reduce((sum: number, p: Pool) => sum + p.totalFundsAvailable, 0),
        totalFamiliesHelped: pools.reduce((sum: number, p: Pool) => sum + p.totalFamiliesHelped, 0),
        totalDistributed: pools.reduce((sum: number, p: Pool) => sum + p.totalAmountDistributed, 0),
        weeklyContributions: pools.reduce((sum: number, p: Pool) => sum + p.weeklyContributions, 0),
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Community Pools</h1>
        <p className="text-muted-foreground">
          Manage and monitor community pools across Canada.
        </p>
      </div>

      {/* Aggregate Stats */}
      {aggregateStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pools</CardTitle>
              <Building2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateStats.totalPools}</div>
              <p className="text-xs text-muted-foreground">Active communities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributors</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateStats.totalContributors}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(aggregateStats.weeklyContributions)}/week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Funds</CardTitle>
              <DollarSign className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(aggregateStats.totalFundsAvailable)}
              </div>
              <p className="text-xs text-muted-foreground">Across all pools</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Families Helped</CardTitle>
              <Heart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateStats.totalFamiliesHelped}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(aggregateStats.totalDistributed)} distributed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pools List */}
      <Card>
        <CardHeader>
          <CardTitle>All Pools</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : pools && pools.length > 0 ? (
            <div className="space-y-4">
              {pools
                .sort((a: Pool, b: Pool) => b.totalFundsAvailable - a.totalFundsAvailable)
                .map((pool: Pool) => {
                  const health = getPoolHealth(pool);
                  return (
                    <div
                      key={pool._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`size-3 rounded-full ${health.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-muted-foreground" />
                            <span className="font-semibold">{pool.city}</span>
                            <span className="text-muted-foreground">
                              {getProvinceName(pool.province)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{pool.postalCodes.length} postal code(s)</span>
                            <span>{pool.totalContributors} contributors</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Available</div>
                          <div className="font-semibold">
                            {formatCurrency(pool.totalFundsAvailable)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Weekly</div>
                          <div className="font-semibold">
                            {formatCurrency(pool.weeklyContributions)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Families Helped</div>
                          <div className="font-semibold">{pool.totalFamiliesHelped}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Distributed</div>
                          <div className="font-semibold">
                            {formatCurrency(pool.totalAmountDistributed)}
                          </div>
                        </div>
                        <Badge
                          variant={
                            health.status === "healthy"
                              ? "default"
                              : health.status === "moderate"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {health.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pools yet</h3>
              <p className="text-muted-foreground">
                Community pools will be created automatically when users sign up from different
                locations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pool Health Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pool Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-500" />
              <span className="text-sm">
                <strong>Healthy:</strong> 4+ weeks of coverage
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-yellow-500" />
              <span className="text-sm">
                <strong>Moderate:</strong> 2-4 weeks of coverage
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500" />
              <span className="text-sm">
                <strong>Low Funds:</strong> Less than 2 weeks of coverage
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
