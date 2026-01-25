"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type BillUploaderProps = {
  onUploadComplete: (storageId: Id<"_storage">) => void;
  onError?: (error: string) => void;
};

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function BillUploader({ onUploadComplete, onError }: BillUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please upload a PDF, JPG, or PNG file";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB";
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setUploadState("uploading");
    setProgress(0);
    setErrorMessage(null);

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();
      setProgress(20);

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setProgress(80);

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      setProgress(100);
      setUploadState("success");
      onUploadComplete(storageId as Id<"_storage">);
    } catch (error) {
      setUploadState("error");
      const message = error instanceof Error ? error.message : "Upload failed";
      setErrorMessage(message);
      onError?.(message);
    }
  };

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setUploadState("error");
      onError?.(error);
      return;
    }

    setFile(file);
    setErrorMessage(null);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    uploadFile(file);
  }, [onUploadComplete, onError, generateUploadUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState("idle");

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState("idle");
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setUploadState("idle");
    setErrorMessage(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload bill document"
      />

      {uploadState === "success" && file ? (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {preview ? (
                  <div className="relative size-16 rounded-lg overflow-hidden border">
                    <img
                      src={preview}
                      alt="Bill preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center size-16 rounded-lg bg-muted">
                    <File className="size-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                    <CheckCircle className="size-4" />
                    <span>Uploaded successfully</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                aria-label="Remove file"
              >
                <X className="size-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "cursor-pointer transition-all",
            uploadState === "dragging" && "border-primary ring-2 ring-primary/20",
            uploadState === "error" && "border-destructive",
            uploadState === "idle" && "hover:border-primary/50"
          )}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              {uploadState === "uploading" ? (
                <>
                  <Loader2 className="size-12 text-primary animate-spin mb-4" />
                  <p className="font-medium text-foreground">Uploading...</p>
                  <div className="w-full max-w-xs mt-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {progress}% complete
                    </p>
                  </div>
                </>
              ) : uploadState === "error" ? (
                <>
                  <AlertCircle className="size-12 text-destructive mb-4" />
                  <p className="font-medium text-destructive">Upload failed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {errorMessage || "Please try again"}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <Upload
                    className={cn(
                      "size-12 mb-4",
                      uploadState === "dragging"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <p className="font-medium text-foreground">
                    {uploadState === "dragging"
                      ? "Drop your file here"
                      : "Upload your utility bill"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, JPG, or PNG up to 10MB
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
