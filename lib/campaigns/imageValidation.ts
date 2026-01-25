/**
 * Campaign Image Validation Utility
 * Validates image files before upload for campaigns
 */

export interface ImageValidationConfig {
  maxFileSize: number; // in bytes
  acceptedTypes: string[];
  minWidth: number;
  minHeight: number;
  recommendedWidth: number;
  recommendedHeight: number;
}

export const IMAGE_VALIDATION_CONFIG: ImageValidationConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  minWidth: 300,
  minHeight: 200,
  recommendedWidth: 600,
  recommendedHeight: 400,
};

export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate image file properties (client-side)
 */
export function validateImageFile(file: File): ImageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  if (file.size > IMAGE_VALIDATION_CONFIG.maxFileSize) {
    errors.push(
      `File size exceeds maximum of ${formatBytes(IMAGE_VALIDATION_CONFIG.maxFileSize)}. Your file is ${formatBytes(file.size)}.`
    );
  }

  // Check file type
  if (!IMAGE_VALIDATION_CONFIG.acceptedTypes.includes(file.type)) {
    errors.push(
      `Invalid file type. Accepted types: ${IMAGE_VALIDATION_CONFIG.acceptedTypes.join(", ")}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate image dimensions (client-side)
 * Returns a promise since dimensions are determined asynchronously
 */
export async function validateImageDimensions(
  file: File
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check minimum dimensions
        if (
          img.width < IMAGE_VALIDATION_CONFIG.minWidth ||
          img.height < IMAGE_VALIDATION_CONFIG.minHeight
        ) {
          errors.push(
            `Image is too small. Minimum: ${IMAGE_VALIDATION_CONFIG.minWidth}x${IMAGE_VALIDATION_CONFIG.minHeight}px. Your image: ${img.width}x${img.height}px`
          );
        }

        // Check recommended dimensions
        if (
          img.width < IMAGE_VALIDATION_CONFIG.recommendedWidth ||
          img.height < IMAGE_VALIDATION_CONFIG.recommendedHeight
        ) {
          warnings.push(
            `Image is smaller than recommended. Recommended: ${IMAGE_VALIDATION_CONFIG.recommendedWidth}x${IMAGE_VALIDATION_CONFIG.recommendedHeight}px. Your image: ${img.width}x${img.height}px`
          );
        }

        resolve({
          valid: errors.length === 0,
          errors,
          warnings,
        });
      };

      img.onerror = () => {
        resolve({
          valid: false,
          errors: ["Failed to load image. File may be corrupted."],
          warnings: [],
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        valid: false,
        errors: ["Failed to read file."],
        warnings: [],
      });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Perform all image validations
 */
export async function validateImage(
  file: File
): Promise<ImageValidationResult> {
  // First check file properties
  const fileValidation = validateImageFile(file);
  if (!fileValidation.valid) {
    return fileValidation;
  }

  // Then check dimensions
  const dimensionValidation = await validateImageDimensions(file);
  return dimensionValidation;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Create an image preview URL from a file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke an image preview URL
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
