/**
 * Campaign Image Upload Utility
 * Handles image upload to Convex storage
 */

/**
 * Upload an image file to Convex storage
 * @param file - The image file to upload
 * @param uploadUrl - The upload URL from Convex
 * @returns Promise containing the storage ID
 */
export async function uploadImageToStorage(
  file: File,
  uploadUrl: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const data = await response.json();
  return data.storageId;
}

/**
 * Get the URL for a stored image
 * @param storageId - The storage ID returned from upload
 * @returns The URL to access the image
 */
export async function getImageUrl(
  storageId: string,
  getUrlMutation: (storageId: string) => Promise<string>
): Promise<string> {
  return getUrlMutation(storageId);
}

/**
 * Delete a stored image
 * @param storageId - The storage ID to delete
 */
export async function deleteStoredImage(
  storageId: string,
  deleteMutation: (storageId: string) => Promise<void>
): Promise<void> {
  return deleteMutation(storageId);
}
