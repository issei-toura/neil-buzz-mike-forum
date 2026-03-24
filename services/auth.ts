import type { LoginDto, LoginSucceededDto, UserCreateDto, UserReadDto } from '@/types/auth';
import { apiFetch } from '@/utils/api';
import { readJsonResponse } from '@/utils/api-response';

/**
 * POST /auth/login — no Authorization header required.
 */
export async function login(payload: LoginDto): Promise<LoginSucceededDto> {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return readJsonResponse<LoginSucceededDto>(response);
}

/**
 * POST /auth/register — no Authorization header required.
 */
export async function register(payload: UserCreateDto): Promise<UserReadDto> {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return readJsonResponse<UserReadDto>(response);
}
