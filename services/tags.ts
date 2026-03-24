import type { PaginationTagDto } from '@/types/tags';
import { apiFetchWithAuth } from '@/utils/api';
import { readJsonResponse } from '@/utils/api-response';

/**
 * GET /tags — paginated tag names (used for feed filters / create-post categories).
 * Uses the same client as other authenticated routes; works without a token (no Authorization header).
 */
export async function listTags(page: number, limit: number): Promise<PaginationTagDto> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetchWithAuth(`/tags?${qs.toString()}`);
  return readJsonResponse<PaginationTagDto>(response);
}
