"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const PRESET_AMOUNTS = [10, 15, 25, 50, 100];

export default function SubscribePage() {
  const [amount, setAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubscribe = async () => {
    if (amount < 1) {
      setError("Minimum amount is $1 per week");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Start investing</h1>
        <p className="text-muted-foreground mt-1">
          Choose your weekly amount. Your subscription will automatically distribute funds to local charities.
        </p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground">Weekly Amount</h2>
          <CardDescription>
            Select or enter your weekly donation amount. You can change this anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Choose an amount</Label>
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

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <div>
              <p className="text-muted-foreground text-sm">Selected amount</p>
              <p className="font-semibold text-foreground text-xl">${amount.toFixed(2)}/week</p>
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || amount < 1}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Checkout"
              )}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              render={<Link href="/dashboard" />}
              nativeButton={false}
              variant="ghost"
              size="sm"
            >
              Back to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
