"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";

const PRESET_AMOUNTS = [10, 15, 25, 50, 100];

const INTERVALS = [
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
] as const;

export type PaymentType = "one_time" | "recurring";
export type PaymentInterval = "week" | "month" | "year";

export type ContributionData = {
  paymentType: PaymentType;
  interval?: PaymentInterval;
  amount: number;
};

type ContributionSetupProps = {
  onSkip: () => void;
  onContinue: (data: ContributionData) => void;
  isLoading?: boolean;
};

export function ContributionSetup({
  onSkip,
  onContinue,
  isLoading = false,
}: ContributionSetupProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>("recurring");
  const [interval, setInterval] = useState<PaymentInterval>("month");
  const [amount, setAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState("");

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const handleContinue = () => {
    if (amount < 1) return;

    onContinue({
      paymentType,
      interval: paymentType === "recurring" ? interval : undefined,
      amount,
    });
  };

  const getIntervalLabel = () => {
    if (paymentType === "one_time") return "";
    const intervalObj = INTERVALS.find((i) => i.value === interval);
    return intervalObj ? `/${intervalObj.value}` : "";
  };

  const getFrequencyDescription = () => {
    if (paymentType === "one_time") {
      return "One-time contribution to help your community";
    }
    switch (interval) {
      case "week":
        return "Billed every week";
      case "month":
        return "Billed every month";
      case "year":
        return "Billed every year";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Type Toggle */}
      <div className="space-y-3">
        <Label>Contribution type</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={paymentType === "one_time" ? "default" : "outline"}
            onClick={() => setPaymentType("one_time")}
            disabled={isLoading}
            className="h-auto py-3"
          >
            <div className="text-center">
              <div className="font-medium">One-time</div>
              <div className="text-xs opacity-70">Single contribution</div>
            </div>
          </Button>
          <Button
            type="button"
            variant={paymentType === "recurring" ? "default" : "outline"}
            onClick={() => setPaymentType("recurring")}
            disabled={isLoading}
            className="h-auto py-3"
          >
            <div className="text-center">
              <div className="font-medium">Recurring</div>
              <div className="text-xs opacity-70">Ongoing support</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Interval Selection (only for recurring) */}
      {paymentType === "recurring" && (
        <div className="space-y-3">
          <Label>Frequency</Label>
          <div className="grid grid-cols-3 gap-3">
            {INTERVALS.map((int) => (
              <Button
                key={int.value}
                type="button"
                variant={interval === int.value ? "default" : "outline"}
                onClick={() => setInterval(int.value)}
                disabled={isLoading}
              >
                {int.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Amount Selection */}
      <div className="space-y-3">
        <Label>Amount</Label>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_AMOUNTS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={amount === preset && !customAmount ? "default" : "outline"}
              onClick={() => handleAmountSelect(preset)}
              disabled={isLoading}
            >
              ${preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="space-y-2">
        <Label htmlFor="custom-amount">Or enter custom amount</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">$</span>
          <Input
            id="custom-amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="15.00"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Your contribution</span>
          <span className="font-semibold text-lg">
            ${amount.toFixed(2)}
            {getIntervalLabel()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{getFrequencyDescription()}</p>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Your contribution goes directly to helping neighbors facing utility shut-offs
          in your community. You can update or cancel anytime from your dashboard.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={handleContinue}
          disabled={isLoading || amount < 1}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Continue to payment
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isLoading}
          className="w-full"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
