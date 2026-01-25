"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Zap, Droplets, Flame, Thermometer } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type UtilityType = "electric" | "water" | "gas" | "heating";

type CharityPreferencesData = {
  excludedUtilityTypes: UtilityType[];
};

type CharityPreferencesProps = {
  userId: Id<"users">;
  initialPreferences?: CharityPreferencesData | null;
};

const UTILITY_TYPES: { value: UtilityType; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  {
    value: "electric",
    label: "Electric",
    icon: Zap,
    description: "Help neighbors with electricity bills",
  },
  {
    value: "water",
    label: "Water",
    icon: Droplets,
    description: "Help neighbors with water bills",
  },
  {
    value: "gas",
    label: "Gas",
    icon: Flame,
    description: "Help neighbors with gas bills",
  },
  {
    value: "heating",
    label: "Heating",
    icon: Thermometer,
    description: "Help neighbors with heating bills",
  },
];

export function CharityPreferences({ userId, initialPreferences }: CharityPreferencesProps) {
  const [excludedTypes, setExcludedTypes] = useState<UtilityType[]>(
    initialPreferences?.excludedUtilityTypes ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCharityPreferences = useMutation(api.users.updateCharityPreferences);

  const isTypeEnabled = (type: UtilityType) => !excludedTypes.includes(type);

  const toggleType = (type: UtilityType) => {
    setExcludedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateCharityPreferences({
        userId,
        excludedUtilityTypes: excludedTypes,
      });
      setSaveSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    JSON.stringify(excludedTypes.sort()) !==
    JSON.stringify((initialPreferences?.excludedUtilityTypes ?? []).sort());

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-foreground">Charity Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Choose which types of utility assistance you want to support. All types are
          enabled by default.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Utility types to support</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UTILITY_TYPES.map(({ value, label, icon: Icon, description }) => {
              const enabled = isTypeEnabled(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleType(value)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                    enabled
                      ? "border-foreground bg-foreground/5"
                      : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center size-8 rounded-full shrink-0 ${
                      enabled ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{label}</span>
                      {enabled && <Check className="size-3 text-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <Check className="size-4" />
            Preferences saved successfully
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {excludedTypes.length === 0
              ? "Supporting all utility types"
              : `Opted out of ${excludedTypes.length} type${excludedTypes.length > 1 ? "s" : ""}`}
          </p>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges} size="sm">
            {isSaving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save preferences"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
