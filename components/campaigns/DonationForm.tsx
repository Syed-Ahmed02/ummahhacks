"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/constants/canada";
import { Loader2, Lock, Shield, AlertCircle, CheckCircle } from "lucide-react";

type DonationFormProps = {
  campaignId: string;
  minAmount?: number;
  maxAmount?: number;
  goalAmount?: number;
  currentAmount?: number;
  shutoffDate?: number;
  onDonate: (data: {
    amount: number;
    donorName?: string;
    donorEmail: string;
    isAnonymous: boolean;
    message?: string;
  }) => Promise<void>;
  isProcessing?: boolean;
};

export function DonationForm({
  campaignId,
  minAmount = 1,
  maxAmount = 5000,
  goalAmount,
  currentAmount = 0,
  shutoffDate,
  onDonate,
  isProcessing = false,
}: DonationFormProps) {
  const { user: clerkUser } = useUser();
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState(clerkUser?.fullName || "");
  const [donorEmail, setDonorEmail] = useState(
    clerkUser?.emailAddresses[0]?.emailAddress || ""
  );
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getDaysUntilShutoff = () => {
    if (!shutoffDate) return null;
    const daysLeft = Math.ceil((shutoffDate - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const isUrgent = getDaysUntilShutoff() !== null && getDaysUntilShutoff()! <= 7;
  const amountNum = parseFloat(amount) || 0;
  const remainingAmount = goalAmount ? Math.max(0, goalAmount - currentAmount) : 0;
  const suggestedAmount = remainingAmount > 0 ? remainingAmount : goalAmount || minAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNaN(amountNum) || amountNum < minAmount) {
      setError(`Minimum donation is ${formatCurrency(minAmount)}`);
      return;
    }

    if (amountNum > maxAmount) {
      setError(`Maximum donation is ${formatCurrency(maxAmount)}`);
      return;
    }

    if (goalAmount && currentAmount + amountNum > goalAmount) {
      setError(
        `Donation would exceed goal. Remaining needed: ${formatCurrency(remainingAmount)}`
      );
      return;
    }

    if (!donorEmail.trim()) {
      setError("Email is required for donation receipt");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await onDonate({
        amount: amountNum,
        donorName: donorName.trim() || undefined,
        donorEmail: donorEmail.trim(),
        isAnonymous,
        message: message.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process donation");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
        <CardDescription>
          Your donation helps keep utilities on. All funds go directly to the utility provider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Urgency Banner */}
          {isUrgent && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">
                  ⚠️ Urgent: Shutoff in {getDaysUntilShutoff()} days
                </p>
                <p className="text-sm text-red-800">Your donation can make a critical difference</p>
              </div>
            </div>
          )}

          {/* Suggested Amount */}
          {goalAmount && remainingAmount > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-3">
                Amount still needed: <span className="text-lg font-bold">{formatCurrency(remainingAmount)}</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[Math.min(remainingAmount, 25), Math.min(remainingAmount, 50), remainingAmount].map((suggestedAmt, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant={amount === suggestedAmt.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(suggestedAmt.toString())}
                  >
                    {formatCurrency(suggestedAmt)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (CAD) *</Label>
            <Input
              id="amount"
              type="number"
              min={minAmount}
              max={maxAmount}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum: {formatCurrency(minAmount)} • Maximum: {formatCurrency(maxAmount)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor-name">Your Name (Optional)</Label>
            <Input
              id="donor-name"
              type="text"
              placeholder="John Doe"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {isAnonymous ? "Not visible to recipient" : "Will be shown on donation list"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor-email">Email *</Label>
            <Input
              id="donor-email"
              type="email"
              placeholder="your@email.com"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Required for donation receipt. Never shared with recipient.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <Label
              htmlFor="anonymous"
              className="text-sm font-normal cursor-pointer"
            >
              Donate anonymously (your name won't be shown publicly)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Leave an encouraging message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Your message will be shared with the recipient
            </p>
          </div>

          {/* Privacy & Security Info */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
            <div className="flex gap-3">
              <Lock className="size-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-600">
                  Powered by Stripe. Your payment information is encrypted and secure.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Shield className="size-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Direct Payment</p>
                <p className="text-xs text-gray-600">
                  Your donation goes directly to the utility provider. No recipient information shared.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!error && amount && amountNum >= minAmount && amountNum <= maxAmount && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex gap-2">
              <CheckCircle className="size-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Thank you for helping! Your donation of {formatCurrency(amountNum)} is ready to go.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isProcessing || !amount}>
            {isProcessing ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <span>Donate {amount ? formatCurrency(amountNum) : ""}</span>
                {amount && (
                  <span className="ml-2 text-xs opacity-75">
                    (Stripe)
                  </span>
                )}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By donating, you agree to our terms of service and privacy policy
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
