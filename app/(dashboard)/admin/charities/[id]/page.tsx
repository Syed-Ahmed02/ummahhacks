"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CharityForm } from "@/components/admin/CharityForm";
import { CharityProjectsMap } from "@/components/map/CharityProjectsMap";
import { mockCharities, mockDistributions } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export default function AdminCharityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const charity = mockCharities.find((c) => c.id === id);
  const distributions = mockDistributions.filter((d) => d.charityId === id);

  if (!charity) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/charities"
          className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to charities
        </Link>
        <p className="text-muted-foreground">Charity not found.</p>
      </div>
    );
  }

  const totalReceived = distributions.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/charities"
          className="text-primary mb-2 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to charities
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-semibold text-foreground text-2xl">{charity.name}</h1>
          <Badge>{charity.status ?? "pending"}</Badge>
        </div>
        {charity.category && (
          <p className="text-muted-foreground mt-1">{charity.category}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <h2 className="font-medium text-foreground">Details</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {charity.description && <p className="text-sm">{charity.description}</p>}
              <p className="text-muted-foreground text-sm">
                {[charity.city, charity.state, charity.zip].filter(Boolean).join(", ")}
              </p>
              {charity.website && (
                <a
                  href={charity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {charity.website}
                </a>
              )}
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader>
              <h2 className="font-medium text-foreground">Distribution history</h2>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-foreground">
                ${totalReceived.toLocaleString()} total received
              </p>
              <p className="text-muted-foreground text-sm">
                {distributions.length} distribution{distributions.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>
        <div>
          <h2 className="font-medium text-foreground mb-3">Location</h2>
          <CharityProjectsMap
            charities={[charity]}
            distributions={distributions}
            height={280}
            getDetailHref={(c) => `/admin/charities/${c.id}`}
          />
        </div>
      </div>

      <CharityForm
        charity={charity}
        onSubmit={() => {}}
        onCancel={() => router.push("/admin/charities")}
      />
    </div>
  );
}
