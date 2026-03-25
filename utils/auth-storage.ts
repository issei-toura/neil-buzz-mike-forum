import * as SecureStore from 'expo-secure-store';

import type { UserReadDto } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'nbm_forum_access_token';
const CURRENT_USER_KEY = 'nbm_forum_current_user';

/**
 * JWT from POST /auth/login (LoginSucceededDto.accessToken).
 */
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

/**
 * Cached user from the last successful login (for client-side checks such as "own post").
 */
export async function setCurrentUser(user: UserReadDto): Promise<void> {
  await SecureStore.setItemAsync(CURRENT_USER_KEY, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<UserReadDto | null> {
  const raw = await SecureStore.getItemAsync(CURRENT_USER_KEY);
  if (raw === null || raw.length === 0) return null;
  try {
    return JSON.parse(raw) as UserReadDto;
  } catch {
    return null;
  }
}

export async function clearAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
}
