"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/constants/canada";
import {
  Loader2,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  Droplets,
  Flame,
  Thermometer,
  CreditCard,
  Building,
  Globe,
  Calendar,
  AlertTriangle,
} from "lucide-react";

type PaymentMethod = "cheque" | "bank_transfer" | "online";

const utilityIcons = {
  electric: Zap,
  water: Droplets,
  gas: Flame,
  heating: Thermometer,
};

const paymentMethodIcons = {
  cheque: CreditCard,
  bank_transfer: Building,
  online: Globe,
};

const paymentMethodLabels = {
  cheque: "Cheque",
  bank_transfer: "Bank Transfer",
  online: "Online Payment",
};

function getDaysUntilShutoff(shutoffDate: number): number {
  const now = Date.now();
  const diff = shutoffDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AdminPaymentsPage() {
  const { user: clerkUser } = useUser();
  const [selectedBill, setSelectedBill] = useState<Id<"billSubmissions"> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current admin user
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Get bills awaiting payment
  const billsAwaitingPayment = useQuery(api.bills.getBillsAwaitingPayment);

  // Get recent payments
  const recentPayments = useQuery(api.payments.getRecentPayments, { limit: 10 });

  const processPayment = useMutation(api.payments.processPayment);

  const handleProcessPayment = async (billId: Id<"billSubmissions">, amount: number) => {
    if (!convexUser) return;

    setIsProcessing(true);
    setError(null);

    try {
      await processPayment({
        billSubmissionId: billId,
        amount,
        paymentMethod,
        processedBy: convexUser._id,
        confirmationNumber: confirmationNumber || undefined,
      });
      setSelectedBill(null);
      setPaymentMethod("bank_transfer");
      setConfirmationNumber("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading =
    billsAwaitingPayment === undefined ||
    recentPayments === undefined ||
    convexUser === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Payment Processing</h1>
        <p className="text-muted-foreground">
          Process payments for approved utility bills.
        </p>
      </div>

      {/* Bills Awaiting Payment */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="size-5" />
          Bills Awaiting Payment
          {billsAwaitingPayment && billsAwaitingPayment.length > 0 && (
            <Badge variant="secondary">{billsAwaitingPayment.length}</Badge>
          )}
        </h2>

        {billsAwaitingPayment && billsAwaitingPayment.length > 0 ? (
          <div className="space-y-4">
            {billsAwaitingPayment.map((bill) => {
              const UtilityIcon = utilityIcons[bill.utilityType];
              const daysUntil = getDaysUntilShutoff(bill.shutoffDate);
              const isSelected = selectedBill === bill._id;

              return (
                <Card
                  key={bill._id}
                  className={`transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-muted p-2">
                          <UtilityIcon className="size-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold capitalize">{bill.utilityType}</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Approved
                            </Badge>
                            {daysUntil <= 7 && (
                              <Badge variant="destructive">
                                <AlertTriangle className="size-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {bill.utilityProvider} - Account: {bill.accountNumber}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-lg">
                              {formatCurrency(bill.amountDue)}
                            </span>
                            <span className="text-muted-foreground">
                              Shutoff: {daysUntil <= 0 ? "Overdue!" : `${daysUntil} days`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => setSelectedBill(isSelected ? null : bill._id)}
                      >
                        {isSelected ? "Cancel" : "Process Payment"}
                      </Button>
                    </div>

                    {/* Payment Form */}
                    {isSelected && (
                      <div className="mt-6 pt-6 border-t space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <div className="flex gap-2">
                              {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map(
                                (method) => {
                                  const Icon = paymentMethodIcons[method];
                                  return (
                                    <Button
                                      key={method}
                                      type="button"
                                      variant={paymentMethod === method ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setPaymentMethod(method)}
                                      className="flex-1"
                                    >
                                      <Icon className="size-4 mr-1" />
                                      {paymentMethodLabels[method]}
                                    </Button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmation">Confirmation # (optional)</Label>
                            <Input
                              id="confirmation"
                              placeholder="Enter confirmation number"
                              value={confirmationNumber}
                              onChange={(e) => setConfirmationNumber(e.target.value)}
                            />
                          </div>
                        </div>

                        {error && (
                          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                            {error}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Amount to pay: <span className="font-semibold text-foreground">{formatCurrency(bill.amountDue)}</span>
                          </div>
                          <Button
                            onClick={() => handleProcessPayment(bill._id, bill.amountDue)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="size-4 mr-2" />
                                Confirm Payment
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="size-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                There are no bills awaiting payment at this time.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Payments */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="size-5" />
          Recent Payments
        </h2>

        {recentPayments && recentPayments.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentPayments.map((payment) => {
                  const MethodIcon = paymentMethodIcons[payment.paymentMethod];

                  return (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-green-100 p-2">
                          <CheckCircle className="size-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.utilityProvider}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MethodIcon className="size-3" />
                            <span>{paymentMethodLabels[payment.paymentMethod]}</span>
                            {payment.confirmationNumber && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                #{payment.confirmationNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.processedAt).toLocaleDateString("en-CA")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
              <p className="text-muted-foreground">
                Payments will appear here once they are processed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
