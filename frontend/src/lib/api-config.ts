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
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const isLocal = envUrl?.includes('localhost') || envUrl?.includes('127.0.0.1');

  // If we have a real production URL in the environment, use it.
  // BUT: If the environment says 'localhost' and we are NOT in dev, ignore it.
  if (envUrl && (!isLocal || IS_DEV)) {
    return envUrl.replace(/\/$/, '');
  }

  if (IS_DEV) {
    return 'http://127.0.0.1:8000';
  }

  // Hard production fallback for the live portfolio
  return 'https://aurora-kashmir.onrender.com';
};

export const BACKEND_URL = getBackendBaseUrl();
