"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestCard } from "@/components/requests/RequestCard";
import { EligibilityBanner } from "@/components/requests/EligibilityBanner";
import { Loader2, Plus, FileText } from "lucide-react";

export default function MyRequestsPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  // Get the Convex user
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Get user's bills
  const bills = useQuery(
    api.bills.getUserBills,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Check eligibility
  const eligibility = useQuery(
    api.bills.checkEligibility,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Loading states
  if (!isClerkLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clerkUser) {
    router.push("/sign-in");
    return null;
  }

  if (convexUser === undefined || bills === undefined) {
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

  // Sort bills by createdAt descending (most recent first)
  const sortedBills = [...(bills || [])].sort((a, b) => b.createdAt - a.createdAt);

  // Separate active and past bills
  const activeBills = sortedBills.filter(
    (bill) =>
      bill.paymentStatus !== "paid" && bill.paymentStatus !== "declined"
  );
  const pastBills = sortedBills.filter(
    (bill) =>
      bill.paymentStatus === "paid" || bill.paymentStatus === "declined"
  );

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-muted-foreground">
            Track your utility bill assistance requests
          </p>
        </div>
        {convexUser.role === "recipient" && eligibility?.eligible && (
          <Button onClick={() => router.push("/submit-bill")}>
            <Plus className="mr-2 size-4" />
            Submit New Bill
          </Button>
        )}
      </div>

      {/* Eligibility Banner */}
      {eligibility && (
        <div className="mb-6">
          <EligibilityBanner
            eligible={eligibility.eligible}
            remainingAssistance={eligibility.remainingAssistance}
            nextEligibleDate={eligibility.nextEligibleDate}
          />
        </div>
      )}

      {/* Active Requests */}
      {activeBills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Active Requests</h2>
          <div className="grid gap-4">
            {activeBills.map((bill) => (
              <RequestCard
                key={bill._id}
                bill={{
                  _id: bill._id,
                  utilityType: bill.utilityType,
                  utilityProvider: bill.utilityProvider,
                  amountDue: bill.amountDue,
                  originalDueDate: bill.originalDueDate,
                  shutoffDate: bill.shutoffDate,
                  verificationStatus: bill.verificationStatus,
                  paymentStatus: bill.paymentStatus,
                  paymentAmount: bill.paymentAmount,
                  paidAt: bill.paidAt,
                  createdAt: bill.createdAt,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Requests */}
      {pastBills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Past Requests</h2>
          <div className="grid gap-4">
            {pastBills.map((bill) => (
              <RequestCard
                key={bill._id}
                bill={{
                  _id: bill._id,
                  utilityType: bill.utilityType,
                  utilityProvider: bill.utilityProvider,
                  amountDue: bill.amountDue,
                  originalDueDate: bill.originalDueDate,
                  shutoffDate: bill.shutoffDate,
                  verificationStatus: bill.verificationStatus,
                  paymentStatus: bill.paymentStatus,
                  paymentAmount: bill.paymentAmount,
                  paidAt: bill.paidAt,
                  createdAt: bill.createdAt,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedBills.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              You haven't submitted any utility bill assistance requests yet.
              {convexUser.role === "recipient" && eligibility?.eligible && (
                <> Get started by submitting your first bill.</>
              )}
            </p>
            {convexUser.role === "recipient" && eligibility?.eligible && (
              <Button onClick={() => router.push("/submit-bill")}>
                <Plus className="mr-2 size-4" />
                Submit Your First Bill
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
