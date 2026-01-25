"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DonationCancelPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <XCircle className="size-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Donation Cancelled</h2>
          <p className="text-muted-foreground mb-6">
            Your donation was not processed. You can try again anytime.
          </p>
          <div className="flex gap-3 justify-center">
            {slug && (
              <Button asChild>
                <Link href={`/campaigns/${slug}`}>Back to Campaign</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
