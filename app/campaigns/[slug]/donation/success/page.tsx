"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const donationId = searchParams.get("donation_id");

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You for Your Donation!</h2>
          <p className="text-muted-foreground mb-6">
            Your donation has been successfully processed. A receipt has been sent to your email.
          </p>
          {donationId && (
            <p className="text-sm text-muted-foreground mb-6">
              Donation ID: {donationId}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
