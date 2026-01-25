"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/constants/canada";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  Zap,
  Droplets,
  Flame,
  Thermometer,
  ZoomIn,
} from "lucide-react";

type UtilityType = "electric" | "water" | "gas" | "heating";

const utilityIcons: Record<UtilityType, typeof Zap> = {
  electric: Zap,
  water: Droplets,
  gas: Flame,
  heating: Thermometer,
};

type UrgencyLevel = "critical" | "high" | "medium";

const urgencyConfig: Record<UrgencyLevel, { color: string; label: string; textColor: string; bgLight: string }> = {
  critical: { color: "bg-red-500", label: "Critical (<7 days)", textColor: "text-red-700", bgLight: "bg-red-50" },
  high: { color: "bg-orange-500", label: "High (<14 days)", textColor: "text-orange-700", bgLight: "bg-orange-50" },
  medium: { color: "bg-yellow-500", label: "Medium (>14 days)", textColor: "text-yellow-700", bgLight: "bg-yellow-50" },
};

function getDaysUntilShutoff(shutoffDate: number): number {
  const now = Date.now();
  const diff = shutoffDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgencyLevel(shutoffDate: number): UrgencyLevel {
  const days = getDaysUntilShutoff(shutoffDate);
  if (days <= 7) return "critical";
  if (days <= 14) return "high";
  return "medium";
}

export default function BillReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const billId = params.id as Id<"billSubmissions">;

  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // Get bill details
  const bill = useQuery(api.bills.getBill, { billId });

  // Get the current admin user
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Get file URL
  const fileUrl = useQuery(
    api.storage.getFileUrl,
    bill?.documentStorageId ? { storageId: bill.documentStorageId } : "skip"
  );

  const adminReviewBill = useMutation(api.bills.adminReviewBill);

  const handleReview = async (decision: "approved" | "rejected") => {
    if (!convexUser || !bill) return;

    setIsSubmitting(true);
    try {
      await adminReviewBill({
        billId: bill._id,
        adminUserId: convexUser._id,
        decision,
        notes: adminNotes || undefined,
      });
      router.push("/admin/bills");
    } catch (error) {
      console.error("Failed to review bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bill === undefined || convexUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="size-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Bill Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested bill submission could not be found.</p>
        <Button onClick={() => router.push("/admin/bills")}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Queue
        </Button>
      </div>
    );
  }

  const UtilityIcon = utilityIcons[bill.utilityType as UtilityType];
  const urgency: UrgencyLevel = (bill.aiAnalysis?.urgencyLevel as UrgencyLevel | undefined) ?? getUrgencyLevel(bill.shutoffDate);
  const urgencyStyle = urgencyConfig[urgency];
  const daysUntil = getDaysUntilShutoff(bill.shutoffDate);
  const isAlreadyReviewed = bill.verificationStatus === "verified" || bill.verificationStatus === "rejected";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/bills")}>
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UtilityIcon className="size-6" />
              <span className="capitalize">{bill.utilityType}</span> Bill Review
            </h1>
            <p className="text-muted-foreground">
              Submitted {new Date(bill.createdAt).toLocaleDateString("en-CA")}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={urgencyStyle.textColor}>
          {urgencyStyle.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Bill image and details */}
        <div className="space-y-6">
          {/* Bill Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Bill Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fileUrl ? (
                <div className="relative">
                  <div
                    className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setShowFullImage(true)}
                  >
                    <Image
                      src={fileUrl}
                      alt="Bill document"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Click to view full size
                  </p>
                </div>
              ) : (
                <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bill Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <UtilityIcon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Provider</p>
                    <p className="font-medium">{bill.utilityProvider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account #</p>
                    <p className="font-medium">{bill.accountNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <DollarSign className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount Due</p>
                    <p className="font-medium text-lg">{formatCurrency(bill.amountDue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Shutoff Date</p>
                    <p className={`font-medium ${daysUntil <= 7 ? "text-red-600" : ""}`}>
                      {new Date(bill.shutoffDate).toLocaleDateString("en-CA")}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({daysUntil <= 0 ? "Overdue" : `${daysUntil} days`})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - AI Analysis and Admin Actions */}
        <div className="space-y-6">
          {/* AI Analysis */}
          {bill.aiAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  AI Verification Analysis
                </CardTitle>
                <CardDescription>
                  Automated analysis of the submitted bill
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Authenticity Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Authenticity Score</span>
                    <span
                      className={`text-lg font-bold ${
                        bill.aiAnalysis.authenticityScore >= 90
                          ? "text-green-600"
                          : bill.aiAnalysis.authenticityScore >= 70
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {bill.aiAnalysis.authenticityScore}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        bill.aiAnalysis.authenticityScore >= 90
                          ? "bg-green-500"
                          : bill.aiAnalysis.authenticityScore >= 70
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${bill.aiAnalysis.authenticityScore}%` }}
                    />
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className={`p-4 rounded-lg ${
                  bill.aiAnalysis.recommendation === "approve"
                    ? "bg-green-50 border border-green-200"
                    : bill.aiAnalysis.recommendation === "reject"
                      ? "bg-red-50 border border-red-200"
                      : "bg-yellow-50 border border-yellow-200"
                }`}>
                  <div className="flex items-center gap-2">
                    {bill.aiAnalysis.recommendation === "approve" ? (
                      <CheckCircle className="size-5 text-green-600" />
                    ) : bill.aiAnalysis.recommendation === "reject" ? (
                      <XCircle className="size-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="size-5 text-yellow-600" />
                    )}
                    <span className="font-medium capitalize">
                      AI Recommends: {bill.aiAnalysis.recommendation.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Extracted Data */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Extracted Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span>{bill.aiAnalysis.extractedData.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{formatCurrency(bill.aiAnalysis.extractedData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date</span>
                      <span>{bill.aiAnalysis.extractedData.dueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account #</span>
                      <span>{bill.aiAnalysis.extractedData.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer</span>
                      <span>{bill.aiAnalysis.extractedData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span className="text-right max-w-[200px]">
                        {bill.aiAnalysis.extractedData.serviceAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flagged Issues */}
                {bill.aiAnalysis.flaggedIssues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="size-4 text-yellow-600" />
                      Flagged Issues
                    </h4>
                    <ul className="space-y-2">
                      {bill.aiAnalysis.flaggedIssues.map((issue: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-sm bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg"
                        >
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">AI Analysis Pending</h3>
                <p className="text-sm text-muted-foreground">
                  The AI verification is still processing. You can still manually review this bill.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Admin Review Section */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Review</CardTitle>
              <CardDescription>
                {isAlreadyReviewed
                  ? "This bill has already been reviewed"
                  : "Review and make a decision on this bill submission"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAlreadyReviewed ? (
                <div className={`p-4 rounded-lg ${
                  bill.verificationStatus === "verified"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {bill.verificationStatus === "verified" ? (
                      <CheckCircle className="size-5 text-green-600" />
                    ) : (
                      <XCircle className="size-5 text-red-600" />
                    )}
                    <span className="font-medium capitalize">
                      {bill.verificationStatus === "verified" ? "Approved" : "Rejected"}
                    </span>
                  </div>
                  {bill.adminNotes && (
                    <p className="text-sm text-muted-foreground">{bill.adminNotes}</p>
                  )}
                  {bill.adminReviewedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Reviewed on {new Date(bill.adminReviewedAt).toLocaleDateString("en-CA")}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Admin Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about your decision..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => handleReview("rejected")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="size-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleReview("approved")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="size-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && fileUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={fileUrl}
              alt="Bill document full size"
              fill
              className="object-contain"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setShowFullImage(false)}
          >
            <XCircle className="size-8" />
          </button>
        </div>
      )}
    </div>
  );
}
