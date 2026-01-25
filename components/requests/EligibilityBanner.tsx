"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { MAX_ASSISTANCE_PER_YEAR } from "@/lib/constants/canada";

type EligibilityBannerProps = {
  eligible: boolean;
  remainingAssistance: number;
  nextEligibleDate: number | null;
};

export function EligibilityBanner({
  eligible,
  remainingAssistance,
  nextEligibleDate,
}: EligibilityBannerProps) {
  if (!eligible) {
    return (
      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-400">
                Assistance Limit Reached
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                You have received {MAX_ASSISTANCE_PER_YEAR} bill payments in the past 12 months,
                which is the maximum allowed.
                {nextEligibleDate && (
                  <>
                    {" "}
                    You will be eligible again on{" "}
                    <span className="font-medium">
                      {new Date(nextEligibleDate).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usedAssistance = MAX_ASSISTANCE_PER_YEAR - remainingAssistance;

  return (
    <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-400">
              Eligible for Assistance
            </p>
            <p className="text-sm text-green-700 dark:text-green-500 mt-1">
              You have used{" "}
              <span className="font-medium">
                {usedAssistance} of {MAX_ASSISTANCE_PER_YEAR}
              </span>{" "}
              assistance requests this year.{" "}
              <span className="font-medium">{remainingAssistance}</span> remaining.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
