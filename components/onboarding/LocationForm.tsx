"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldError } from "@/components/ui/field";
import { reverseGeocode } from "@/lib/geocoding";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export type LocationFormData = {
  city: string;
  province: string;
  postalCode: string;
};

type LocationFormProps = {
  initialData?: Partial<LocationFormData>;
  onSubmit: (data: LocationFormData) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
};

type GeolocationState = "idle" | "requesting" | "success" | "error" | "denied";

export function LocationForm({
  initialData,
  onSubmit,
  submitLabel = "Continue",
  isLoading = false,
}: LocationFormProps) {
  // Initialize state from initialData if available
  const [geolocationState, setGeolocationState] = useState<GeolocationState>(() => {
    return initialData?.city && initialData?.province ? "success" : "idle";
  });
  const [locationData, setLocationData] = useState<LocationFormData | null>(() => {
    if (initialData?.city && initialData?.province) {
      return {
        city: initialData.city,
        province: initialData.province,
        postalCode: initialData.postalCode || "",
      };
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const hasRequestedLocation = useRef(false);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setGeolocationState("error");
      return;
    }

    setGeolocationState("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocode(latitude, longitude);

          if (!address || !address.city || !address.state) {
            setError("Unable to determine your location. Please try again or allow location access.");
            setGeolocationState("error");
            return;
          }

          setLocationData({
            city: address.city,
            province: address.state, // reverseGeocode returns state, we use it as province
            postalCode: address.zipCode || "",
          });
          setGeolocationState("success");
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setError("Failed to get your address. Please try again.");
          setGeolocationState("error");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location access was denied. Please enable location permissions in your browser settings.");
          setGeolocationState("denied");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location information is unavailable. Please try again.");
          setGeolocationState("error");
        } else if (err.code === err.TIMEOUT) {
          setError("Location request timed out. Please try again.");
          setGeolocationState("error");
        } else {
          setError("Failed to get your location. Please try again.");
          setGeolocationState("error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Auto-request location on mount if no initial data
  useEffect(() => {
    if (hasRequestedLocation.current) return;
    if (locationData) return; // Already have location data
    
    hasRequestedLocation.current = true;
    // Use setTimeout to avoid calling setState synchronously in effect
    setTimeout(() => {
      requestLocation();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationData) {
      setError("Please allow location access to continue.");
      return;
    }

    await onSubmit(locationData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        {geolocationState === "requesting" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground text-center">
              Getting your location...
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Please allow location access when prompted
            </p>
          </div>
        )}

        {geolocationState === "success" && locationData && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Location detected:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {locationData.city}, {locationData.province}
                {locationData.postalCode && ` ${locationData.postalCode}`}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={requestLocation}
              disabled={isLoading}
              className="w-full"
            >
              Update Location
            </Button>
          </div>
        )}

        {(geolocationState === "error" || geolocationState === "denied") && (
          <div className="space-y-3">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium mb-1">
                {geolocationState === "denied" ? "Location Access Denied" : "Location Error"}
              </p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={requestLocation}
              disabled={isLoading}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {error && geolocationState !== "error" && geolocationState !== "denied" && (
          <FieldError>{error}</FieldError>
        )}
      </FieldGroup>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || geolocationState !== "success" || !locationData}
      >
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
