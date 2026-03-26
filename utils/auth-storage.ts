import * as SecureStore from 'expo-secure-store';

import type { UserReadDto } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'nbm_forum_access_token';
const CURRENT_USER_KEY = 'nbm_forum_current_user';
/** Local device-only profile photo URI (expo-image-picker). Not part of UserReadDto. */
const PROFILE_AVATAR_URI_KEY = 'nbm_profile_avatar_uri';
/** Local device-only address text until a profile API exists. */
const PROFILE_LOCATION_KEY = 'nbm_profile_location';

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

export async function getProfileAvatarUri(): Promise<string | null> {
  return SecureStore.getItemAsync(PROFILE_AVATAR_URI_KEY);
}

export async function setProfileAvatarUri(uri: string | null): Promise<void> {
  if (uri === null || uri.length === 0) {
    await SecureStore.deleteItemAsync(PROFILE_AVATAR_URI_KEY);
  } else {
    await SecureStore.setItemAsync(PROFILE_AVATAR_URI_KEY, uri);
  }
}

export async function getProfileLocation(): Promise<string | null> {
  return SecureStore.getItemAsync(PROFILE_LOCATION_KEY);
}

export async function setProfileLocation(text: string | null): Promise<void> {
  const t = text?.trim() ?? '';
  if (t.length === 0) {
    await SecureStore.deleteItemAsync(PROFILE_LOCATION_KEY);
  } else {
    await SecureStore.setItemAsync(PROFILE_LOCATION_KEY, t);
  }
}

export async function clearAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
  await SecureStore.deleteItemAsync(PROFILE_AVATAR_URI_KEY);
  await SecureStore.deleteItemAsync(PROFILE_LOCATION_KEY);
}
