"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/constants/canada";
import {
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  Droplets,
  Flame,
  Thermometer,
} from "lucide-react";

type VerificationStatus = "pending" | "analyzing" | "verified" | "rejected" | "needs_review";

const statusFilters: { value: VerificationStatus | "all"; label: string }[] = [
  { value: "needs_review", label: "Needs Review" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All Bills" },
];

const utilityIcons = {
  electric: Zap,
  water: Droplets,
  gas: Flame,
  heating: Thermometer,
};

const urgencyConfig = {
  critical: { color: "bg-red-500", label: "Critical", textColor: "text-red-700" },
  high: { color: "bg-orange-500", label: "High", textColor: "text-orange-700" },
  medium: { color: "bg-yellow-500", label: "Medium", textColor: "text-yellow-700" },
};

function getDaysUntilShutoff(shutoffDate: number): number {
  const now = Date.now();
  const diff = shutoffDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgencyLevel(shutoffDate: number): "critical" | "high" | "medium" {
  const days = getDaysUntilShutoff(shutoffDate);
  if (days <= 7) return "critical";
  if (days <= 14) return "high";
  return "medium";
}

export default function AdminBillsPage() {
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "all">("needs_review");

  // Query bills based on filter
  const needsReviewBills = useQuery(
    api.bills.getBillsByStatus,
    statusFilter === "needs_review" ? { status: "needs_review" } : "skip"
  );
  const pendingBills = useQuery(
    api.bills.getBillsByStatus,
    statusFilter === "pending" ? { status: "pending" } : "skip"
  );
  const verifiedBills = useQuery(
    api.bills.getBillsByStatus,
    statusFilter === "verified" ? { status: "verified" } : "skip"
  );
  const rejectedBills = useQuery(
    api.bills.getBillsByStatus,
    statusFilter === "rejected" ? { status: "rejected" } : "skip"
  );
  const allBills = useQuery(api.bills.getAllBills, statusFilter === "all" ? {} : "skip");

  // Get the appropriate bills based on filter
  const bills =
    statusFilter === "needs_review"
      ? needsReviewBills
      : statusFilter === "pending"
        ? pendingBills
        : statusFilter === "verified"
          ? verifiedBills
          : statusFilter === "rejected"
            ? rejectedBills
            : allBills;

  const isLoading = bills === undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bill Review Queue</h1>
        <p className="text-muted-foreground">
          Review and process utility bill submissions from recipients.
        </p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Bills list */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : bills && bills.length > 0 ? (
        <div className="space-y-4">
          {bills.map((bill) => {
            const UtilityIcon = utilityIcons[bill.utilityType];
            const urgency = bill.aiAnalysis?.urgencyLevel ?? getUrgencyLevel(bill.shutoffDate);
            const urgencyStyle = urgencyConfig[urgency];
            const daysUntil = getDaysUntilShutoff(bill.shutoffDate);

            return (
              <Card key={bill._id} className="overflow-hidden">
                <div className={`h-1 ${urgencyStyle.color}`} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-muted p-2">
                        <UtilityIcon className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold capitalize">{bill.utilityType}</span>
                          <Badge variant="outline" className={urgencyStyle.textColor}>
                            {urgencyStyle.label}
                          </Badge>
                          <StatusBadge status={bill.verificationStatus} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bill.utilityProvider} - Account: {bill.accountNumber}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium">{formatCurrency(bill.amountDue)}</span>
                          <span className="text-muted-foreground">
                            Shutoff: {daysUntil <= 0 ? "Overdue" : `${daysUntil} days`}
                          </span>
                        </div>
                        {bill.aiAnalysis && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">AI Score:</span>
                            <span
                              className={
                                bill.aiAnalysis.authenticityScore >= 90
                                  ? "text-green-600"
                                  : bill.aiAnalysis.authenticityScore >= 70
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }
                            >
                              {bill.aiAnalysis.authenticityScore}%
                            </span>
                            {bill.aiAnalysis.flaggedIssues.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {bill.aiAnalysis.flaggedIssues.length} flag(s)
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/bills/${bill._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="size-4 mr-2" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="size-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bills to review</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "There are no bill submissions yet."
                : `There are no bills with status "${statusFilter}".`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  const config = {
    pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
    analyzing: { variant: "secondary" as const, icon: Loader2, label: "Analyzing" },
    verified: { variant: "default" as const, icon: CheckCircle, label: "Verified" },
    rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
    needs_review: { variant: "outline" as const, icon: AlertTriangle, label: "Needs Review" },
  };

  const { variant, icon: Icon, label } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className={`size-3 ${status === "analyzing" ? "animate-spin" : ""}`} />
      {label}
    </Badge>
  );
}
