"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Image as ImageIcon, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_CAMPAIGN_IMAGE = "/default-campaign-image.png";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type CampaignImageUploaderProps = {
  imageStorageId: string | null;
  imagePreviewUrl: string | null;
  onImageChange: (storageId: string | null, previewUrl: string | null) => void;
};

export function CampaignImageUploader({
  imageStorageId,
  imagePreviewUrl,
  onImageChange,
}: CampaignImageUploaderProps) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WebP, or GIF image");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await response.json();

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      onImageChange(storageId, previewUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = imagePreviewUrl || DEFAULT_CAMPAIGN_IMAGE;
  const hasCustomImage = !!imageStorageId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Image</CardTitle>
        <CardDescription>
          Upload an image to represent your campaign. A compelling image helps attract donors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Image Preview */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt="Campaign preview"
            className="h-full w-full object-cover"
          />
          {!hasCustomImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center text-white">
                <ImageIcon className="mx-auto size-12 mb-2 opacity-80" />
                <p className="text-sm font-medium">Default Image</p>
                <p className="text-xs opacity-80">Upload your own image below</p>
              </div>
            </div>
          )}
          {hasCustomImage && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleRemoveImage}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isUploading && "pointer-events-none opacity-50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />

          {isUploading ? (
            <>
              <Loader2 className="size-10 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="size-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {hasCustomImage ? "Replace image" : "Upload campaign image"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP, or GIF (max 5MB)
              </p>
            </>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            {hasCustomImage
              ? "Your custom image will be displayed on your campaign page."
              : "If you don't upload an image, a default community relief image will be used."}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
