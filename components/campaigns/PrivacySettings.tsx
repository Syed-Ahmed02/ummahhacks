"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { CampaignType } from "./CampaignTypeSelector";

type PrivacySettingsProps = {
  campaignType: CampaignType;
  showRecipientName: boolean;
  showRecipientLocation: boolean;
  showBillDetails: boolean;
  onShowRecipientNameChange: (value: boolean) => void;
  onShowRecipientLocationChange: (value: boolean) => void;
  onShowBillDetailsChange: (value: boolean) => void;
};

export function PrivacySettings({
  campaignType,
  showRecipientName,
  showRecipientLocation,
  showBillDetails,
  onShowRecipientNameChange,
  onShowRecipientLocationChange,
  onShowBillDetailsChange,
}: PrivacySettingsProps) {
  const isAnonymous = campaignType === "anonymous";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control what information is visible to donors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAnonymous && (
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              For anonymous campaigns, your name will always be hidden. You can
              choose to show your city location.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-name">Show Recipient Name</Label>
              <p className="text-sm text-muted-foreground">
                Display your name on the campaign page
              </p>
            </div>
            <Switch
              id="show-name"
              checked={showRecipientName && !isAnonymous}
              onCheckedChange={onShowRecipientNameChange}
              disabled={isAnonymous}
            />
          </div>

          {isAnonymous && (
            <p className="text-xs text-muted-foreground pl-1">
              Always hidden for anonymous campaigns
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-location">Show Location</Label>
              <p className="text-sm text-muted-foreground">
                Display your city and province
              </p>
            </div>
            <Switch
              id="show-location"
              checked={showRecipientLocation}
              onCheckedChange={onShowRecipientLocationChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-bill-details">Show Bill Details</Label>
              <p className="text-sm text-muted-foreground">
                Display account numbers and detailed bill information
              </p>
            </div>
            <Switch
              id="show-bill-details"
              checked={showBillDetails && !isAnonymous}
              onCheckedChange={onShowBillDetailsChange}
              disabled={isAnonymous}
            />
          </div>

          {isAnonymous && (
            <p className="text-xs text-muted-foreground pl-1">
              Always hidden for anonymous campaigns
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
