/**
 * HTTP client for the NBM Forum backend. Uses global fetch (no extra dependency).
 * Override the base URL with EXPO_PUBLIC_API_BASE_URL (no trailing slash required).
 */

import { getAccessToken } from '@/utils/auth-storage';

const DEFAULT_API_BASE_URL = 'https://api.development.forum.mike-automations.link';

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

/**
 * Resolved API origin, without a trailing slash.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return trimTrailingSlashes(fromEnv.trim());
  }
  return trimTrailingSlashes(DEFAULT_API_BASE_URL);
}

/**
 * Absolute URL for an API path. `path` may start with or without "/".
 */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * fetch() against the forum API. Sets JSON Content-Type when the body is a non-empty string
 * and no Content-Type was provided. Skips that for FormData so the runtime can set boundaries.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  const headers = new Headers(init?.headers);
  const body = init?.body;

  if (
    !(body instanceof FormData) &&
    typeof body === 'string' &&
    body.length > 0 &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, { ...init, headers });
}

/**
 * Same as apiFetch but adds `Authorization: Bearer <token>` when a token exists in secure storage.
 * Use for endpoints that require JWT (OpenAPI security: Authorization).
 */
export async function apiFetchWithAuth(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return apiFetch(path, { ...init, headers });
}
