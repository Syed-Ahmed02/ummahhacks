"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
  size?: "sm" | "default" | "lg";
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
};

const sizeClasses = {
  sm: "size-4",
  default: "size-6",
  lg: "size-10",
};

export function LoadingSpinner({
  size = "default",
  className,
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <Loader2
        className={cn("animate-spin text-muted-foreground", sizeClasses[size])}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

type LoadingOverlayProps = {
  /** Optional message below spinner */
  message?: string;
  className?: string;
};

export function LoadingOverlay({ message, className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-3",
        className
      )}
      role="status"
      aria-label={message ?? "Loading"}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}
