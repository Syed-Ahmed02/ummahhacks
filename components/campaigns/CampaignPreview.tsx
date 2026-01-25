"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/constants/canada";
import { Eye, EyeOff, Calendar, DollarSign } from "lucide-react";
import type { CampaignType } from "./CampaignTypeSelector";
import type { UtilityType } from "@/components/request/UtilityTypeSelector";

type CampaignPreviewProps = {
  title: string;
  description: string;
  goalAmount: number;
  campaignType: CampaignType;
  utilityType: UtilityType | null;
  utilityProvider: string;
  amountDue: number;
  shutoffDate: string;
  showRecipientName: boolean;
  showRecipientLocation: boolean;
  showBillDetails: boolean;
};

export function CampaignPreview({
  title,
  description,
  goalAmount,
  campaignType,
  utilityType,
  utilityProvider,
  amountDue,
  shutoffDate,
  showRecipientName,
  showRecipientLocation,
  showBillDetails,
}: CampaignPreviewProps) {
  const isAnonymous = campaignType === "anonymous";
  const shutoffDateObj = shutoffDate ? new Date(shutoffDate) : null;
  const daysUntilShutoff = shutoffDateObj
    ? Math.ceil((shutoffDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Campaign Preview</CardTitle>
          <Badge variant={isAnonymous ? "secondary" : "default"}>
            {isAnonymous ? (
              <>
                <EyeOff className="size-3 mr-1" />
                Anonymous
              </>
            ) : (
              <>
                <Eye className="size-3 mr-1" />
                Public
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          This is how your campaign will appear to donors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <DollarSign className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Goal Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(goalAmount)}</p>
            </div>
          </div>

          {shutoffDateObj && (
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <Calendar className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {daysUntilShutoff !== null && daysUntilShutoff > 0
                    ? `${daysUntilShutoff} days until shutoff`
                    : "Shutoff date"}
                </p>
                <p className="text-lg font-semibold">
                  {shutoffDateObj.toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
          <h4 className="font-semibold">Utility Information</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Type:</span>{" "}
              {utilityType ? utilityType.charAt(0).toUpperCase() + utilityType.slice(1) : "Not set"}
            </p>
            <p>
              <span className="text-muted-foreground">Provider:</span> {utilityProvider || "Not set"}
            </p>
            <p>
              <span className="text-muted-foreground">Amount Due:</span>{" "}
              {amountDue ? formatCurrency(parseFloat(amountDue)) : "Not set"}
            </p>
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-lg border">
          <h4 className="font-semibold">Privacy Settings</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Recipient Name: {isAnonymous ? "Hidden" : showRecipientName ? "Visible" : "Hidden"}
            </p>
            <p>Location: {showRecipientLocation ? "Visible" : "Hidden"}</p>
            <p>
              Bill Details: {isAnonymous ? "Hidden" : showBillDetails ? "Visible" : "Hidden"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
