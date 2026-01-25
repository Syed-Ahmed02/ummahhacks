"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Shield, Lock } from "lucide-react";

type PrivacyNoticeProps = {
  campaignType: "public" | "anonymous";
};

export function PrivacyNotice({ campaignType }: PrivacyNoticeProps) {
  if (campaignType === "public") {
    return null; // No notice needed for public campaigns
  }

  return (
    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Shield className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Anonymous Campaign - Your Privacy is Protected
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>
                This is an anonymous campaign. The recipient's identity is protected
                for privacy and security reasons.
              </p>
              <div className="space-y-1">
                <p className="font-medium">What you can see:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>City location (if enabled by recipient)</li>
                  <li>Utility type (electric, water, gas, or heating)</li>
                  <li>Utility provider name</li>
                  <li>Amount needed and progress</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium">What is hidden:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Recipient's name and personal information</li>
                  <li>Account numbers and detailed bill information</li>
                  <li>Full address</li>
                </ul>
              </div>
              <p className="pt-2 border-t border-blue-200 dark:border-blue-800">
                <Lock className="size-4 inline mr-1" />
                <strong>How donations work:</strong> All donations go directly to the
                utility provider. The recipient never handles the money, ensuring 100%
                of your donation helps keep their lights on or water running.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
