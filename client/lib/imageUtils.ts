/**
 * Generates a Cloudinary blur placeholder URL for a given image URL.
 * Works by adding transformation parameters for a tiny, highly blurred version.
 */
export function getCloudinaryBlurUrl(url: string | undefined): string {
  if (!url || !url.includes("cloudinary.com")) {
    // Return a generic transparent pixel as fallback
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
  }

  // Cloudinary URL structure: https://res.cloudinary.com/cloud_name/image/upload/v12345/filename.jpg
  // We want to insert w_40,blur_200,f_auto,q_auto:low after 'upload/'
  const parts = url.split("/upload/")
  if (parts.length !== 2) return url

  return `${parts[0]}/upload/w_40,blur_200,f_auto,q_auto:low/${parts[1]}`
}
