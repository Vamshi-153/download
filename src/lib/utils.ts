import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Triggers a file download in the browser.
 * @param base64Content - The base64 encoded content of the file.
 * @param filename - The desired name for the downloaded file.
 * @param contentType - The MIME type of the file (e.g., 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' for XLSX).
 */
export function downloadFile(base64Content: string, filename: string, contentType: string) {
  try {
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up the object URL
  } catch (error) {
    console.error("Error downloading file:", error);
    // Optionally, show an error message to the user
    alert("Failed to download the file.");
  }
}
