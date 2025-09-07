import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// IP address utilities
export const isValidIP = (ip: string): boolean => {
  // Basic IP validation
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return (
    ipv4Regex.test(ip) ||
    ipv6Regex.test(ip) ||
    ip === "localhost" ||
    ip === "unknown"
  );
};

export const sanitizeIP = (ip: string): string => {
  // Remove any potentially harmful characters and normalize
  const cleanIP = ip.replace(/[^0-9a-fA-F.:]/g, "");

  // If IP is invalid, return a safe fallback
  if (!isValidIP(cleanIP)) {
    return "unknown";
  }

  return cleanIP;
};

// Safe timestamp formatting utility
export const formatTimestamp = (timestamp: Date | string | number): string => {
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "00:00";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "00:00";
  }
};

// Ensure timestamp is a valid Date object
export const ensureValidTimestamp = (
  timestamp: Date | string | number | unknown
): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback to current time
  return new Date();
};

// Hash IP address for privacy in analytics
export const hashIP = async (ip: string): Promise<string> => {
  try {
    // Use Web Crypto API to create a hash
    const encoder = new TextEncoder();
    const data = encoder.encode(
      ip + process.env.ANALYTICS_SALT || "default-salt"
    );
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex.substring(0, 16); // Return first 16 characters for shorter hash
  } catch (error) {
    console.error("Error hashing IP:", error);
    // Fallback to a simple hash
    return btoa(ip)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
  }
};
