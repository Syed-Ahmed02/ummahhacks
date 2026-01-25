"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/constants/canada";
import { Zap, Droplets, Flame, ThermometerSun, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

type UtilityType = "electric" | "water" | "gas" | "heating";

type VerificationStatus = "pending" | "analyzing" | "verified" | "rejected" | "needs_review";
type PaymentStatus = "pending" | "approved" | "paid" | "declined";

type Bill = {
  _id: string;
  utilityType: UtilityType;
  utilityProvider: string;
  amountDue: number;
  originalDueDate: number;
  shutoffDate: number;
  verificationStatus: VerificationStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number | null;
  paidAt: number | null;
  createdAt: number;
};

type RequestCardProps = {
  bill: Bill;
  onClick?: () => void;
};

const utilityIcons: Record<UtilityType, typeof Zap> = {
  electric: Zap,
  water: Droplets,
  gas: Flame,
  heating: ThermometerSun,
};

const utilityLabels: Record<UtilityType, string> = {
  electric: "Electric",
  water: "Water",
  gas: "Gas",
  heating: "Heating",
};

function getStatusBadge(verificationStatus: VerificationStatus, paymentStatus: PaymentStatus) {
  // Payment completed
  if (paymentStatus === "paid") {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="size-3 mr-1" />
        Paid
      </Badge>
    );
  }

  // Payment approved, waiting for processing
  if (paymentStatus === "approved") {
    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        <Clock className="size-3 mr-1" />
        Approved
      </Badge>
    );
  }

  // Rejected
  if (verificationStatus === "rejected" || paymentStatus === "declined") {
    return (
      <Badge variant="destructive">
        <XCircle className="size-3 mr-1" />
        Declined
      </Badge>
    );
  }

  // Needs manual review
  if (verificationStatus === "needs_review") {
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        <AlertCircle className="size-3 mr-1" />
        Under Review
      </Badge>
    );
  }

  // Analyzing
  if (verificationStatus === "analyzing") {
    return (
      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        <Loader2 className="size-3 mr-1 animate-spin" />
        Verifying
      </Badge>
    );
  }

  // Pending
  return (
    <Badge variant="secondary">
      <Clock className="size-3 mr-1" />
      Pending
    </Badge>
  );
}

export function RequestCard({ bill, onClick }: RequestCardProps) {
  const Icon = utilityIcons[bill.utilityType];
  const utilityLabel = utilityLabels[bill.utilityType];

  const isUrgent = bill.shutoffDate < Date.now() + 7 * 24 * 60 * 60 * 1000; // Within 7 days
  const isPastDue = bill.shutoffDate < Date.now();

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-muted">
              <Icon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{utilityLabel} Bill</p>
              <p className="text-sm text-muted-foreground">{bill.utilityProvider}</p>
            </div>
          </div>
          {getStatusBadge(bill.verificationStatus, bill.paymentStatus)}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Amount</p>
            <p className="font-semibold">{formatCurrency(bill.amountDue)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Shutoff Date</p>
            <p className={`font-medium ${isPastDue ? "text-destructive" : isUrgent ? "text-amber-600" : ""}`}>
              {new Date(bill.shutoffDate).toLocaleDateString("en-CA", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {isPastDue && " (Past due)"}
            </p>
          </div>
        </div>

        {bill.paymentStatus === "paid" && bill.paidAt && (
          <div className="mt-4 pt-4 border-t text-sm">
            <p className="text-muted-foreground">
              Paid {formatCurrency(bill.paymentAmount ?? bill.amountDue)} on{" "}
              {new Date(bill.paidAt).toLocaleDateString("en-CA")}
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Submitted {new Date(bill.createdAt).toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </CardContent>
    </Card>
  );
}
