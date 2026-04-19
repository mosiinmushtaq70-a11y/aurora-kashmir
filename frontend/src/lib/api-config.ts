/**
 * Central API configuration for AuroraLens.
 * 
 * This utility ensures that the backend URL is resolved consistently across the entire app.
 * It removes the need for hardcoded localhost fallbacks in individual components.
 */

const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Returns the base URL for the backend API.
 * Priority: 
 * 1. NEXT_PUBLIC_BACKEND_URL (from environment)
 * 2. http://localhost:8000 (only in development)
 * 3. Empty string (prevents malformed URLs in production if env is missing)
 */
export const getBackendBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, ''); // Remove trailing slash
  }

  if (IS_DEV) {
    return 'http://127.0.0.1:8000';
  }

  // In production, if NEXT_PUBLIC_BACKEND_URL is missing, we return empty string
  // to avoid accidental 'localhost' calls from client browsers.
  return '';
};

export const BACKEND_URL = getBackendBaseUrl();
