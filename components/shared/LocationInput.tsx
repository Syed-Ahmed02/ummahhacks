"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LocationValue = {
  city: string;
  state: string;
  zip: string;
};

type LocationInputProps = {
  value?: LocationValue;
  onChange?: (value: LocationValue) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  /** Optional: show labels inline (city/state/zip) */
  showLabels?: boolean;
};

const defaultValue: LocationValue = {
  city: "",
  state: "",
  zip: "",
};

export function LocationInput({
  value = defaultValue,
  onChange,
  disabled = false,
  required = false,
  error,
  className,
  showLabels = true,
}: LocationInputProps) {
  const handleChange = (field: keyof LocationValue) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const next = { ...value, [field]: e.target.value };
    onChange?.(next);
  };

  return (
    <FieldGroup className={cn("gap-3", className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_24ch]">
        <Field>
          {showLabels && (
            <FieldLabel>
              <Label htmlFor="location-city">City</Label>
              {required && <span className="text-destructive"> *</span>}
            </FieldLabel>
          )}
          <Input
            id="location-city"
            placeholder="City"
            value={value.city}
            onChange={handleChange("city")}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
          />
        </Field>
        <Field>
          {showLabels && (
            <FieldLabel>
              <Label htmlFor="location-state">State</Label>
              {required && <span className="text-destructive"> *</span>}
            </FieldLabel>
          )}
          <Input
            id="location-state"
            placeholder="State"
            value={value.state}
            onChange={handleChange("state")}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
          />
        </Field>
        <Field>
          {showLabels && (
            <FieldLabel>
              <Label htmlFor="location-zip">ZIP</Label>
              {required && <span className="text-destructive"> *</span>}
            </FieldLabel>
          )}
          <Input
            id="location-zip"
            placeholder="ZIP"
            value={value.zip}
            onChange={handleChange("zip")}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
          />
        </Field>
      </div>
      {error && <FieldError>{error}</FieldError>}
    </FieldGroup>
  );
}
