"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LocationForm, type LocationFormData } from "@/components/onboarding/LocationForm";

type LocationEditorProps = {
  userId: Id<"users">;
  initialData: LocationFormData;
  onSuccess?: () => void;
};

export function LocationEditor({ userId, initialData, onSuccess }: LocationEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateUser = useMutation(api.users.updateUser);

  const handleSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUser({
        userId,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      });

      setSuccess(true);
      onSuccess?.();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update location:", err);
      setError("Failed to update your location. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-foreground">Location</h2>
        <p className="text-sm text-muted-foreground">
          Update your location to see charities in your area.
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            Location updated successfully!
          </div>
        )}
        <LocationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Update Location"
        />
      </CardContent>
    </Card>
  );
}
