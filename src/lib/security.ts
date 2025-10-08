import { z } from "zod";

// Sanitize file uploads
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: "File size too large. Maximum 10MB allowed." };
  }

  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." };
  }

  // Check file name for malicious patterns
  const fileName = file.name.toLowerCase();
  const dangerousPatterns = [
    /\.\./,  // directory traversal
    /[<>:"\/\\|?*\x00-\x1f]/,  // invalid filename characters
    /^\./,  // hidden files
    /(exe|bat|cmd|com|scr|pif|jar|js|vb|vbs|wsf|wsh)$/  // executable extensions
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(fileName)) {
      return { valid: false, error: "Invalid filename." };
    }
  }

  return { valid: true };
}

// Sanitize base64 image data
export function validateBase64Image(base64String: string): { valid: boolean; error?: string } {
  try {
    // Check if it's a valid base64 string
    if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(base64String)) {
      return { valid: false, error: "Invalid image format. Must be base64 encoded JPEG, PNG, or WebP." };
    }

    // Check approximate size (base64 is ~33% larger than binary)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const approximateBinarySize = (base64String.length * 3) / 4;
    if (approximateBinarySize > maxSize) {
      return { valid: false, error: "Image too large. Maximum 10MB allowed." };
    }

    return { valid: true };
  } catch (error: unknown) {
    return { valid: false, error: (error as Error).message || "Invalid image data." };
  }
}

// Sanitize user input
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>\"'&]/g, "") // Remove potentially dangerous characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, maxLength);
}

// Rate limiting for user actions
export class UserActionLimiter {
  private static actions = new Map<string, number[]>();

  static canPerformAction(user_id: string, action: string, limit: number, windowMs: number): boolean {
    const key = `${user_id}:${action}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = this.actions.get(key) || [];
    const recentTimestamps = timestamps.filter(ts => ts > windowStart);

    if (recentTimestamps.length >= limit) {
      return false;
    }

    recentTimestamps.push(now);
    this.actions.set(key, recentTimestamps);

    // Clean up old entries
    setTimeout(() => {
      const current = this.actions.get(key) || [];
      this.actions.set(key, current.filter(ts => ts > Date.now() - windowMs));
    }, windowMs);

    return true;
  }
}

// Validate UUID
export const uuidSchema = z.string().uuid();

// Validate email
export const emailSchema = z.string().email().max(254);