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
import { Loader2 } from "lucide-react";

type DonationFormProps = {
  campaignId: string;
  minAmount?: number;
  onDonate: (data: {
    amount: number;
    donorName: string;
    donorEmail: string;
    isAnonymous: boolean;
    message: string;
  }) => Promise<void>;
  isProcessing?: boolean;
};

export function DonationForm({
  campaignId,
  minAmount = 1,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < minAmount) {
      setError(`Minimum donation is ${formatCurrency(minAmount)}`);
      return;
    }

    if (!donorEmail.trim()) {
      setError("Email is required for donation receipt");
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
          Help reach the goal. All donations go directly to the utility provider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (CAD) *</Label>
            <Input
              id="amount"
              type="number"
              min={minAmount}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum: {formatCurrency(minAmount)}
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
              Required for donation receipt
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
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Donate ${amount ? formatCurrency(parseFloat(amount) || 0) : ""}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
