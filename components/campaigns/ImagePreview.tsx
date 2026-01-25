"use client";

import React from "react";

interface ImagePreviewProps {
  src: string | null;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
}

/**
 * Display campaign image with fallback to placeholder
 */
export function ImagePreview({
  src,
  alt,
  className = "w-full h-64 object-cover",
  placeholder,
}: ImagePreviewProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  if (!src || error) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}>
        {placeholder || (
          <div className="text-center">
            <div className="text-gray-400 text-sm">No image available</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-100 animate-pulse rounded-lg`} />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        style={{ display: isLoading ? "none" : "block" }}
      />
    </div>
  );
}
