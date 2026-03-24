import type { CreateCommentDto, PaginationCommentDto, ReadCommentDto } from '@/types/comments';
import type {
  CreatePostDto,
  PaginationPostDto,
  ReadAllPostDto,
  ReadPostDto,
} from '@/types/posts';
import { apiFetchWithAuth } from '@/utils/api';
import { readJsonResponse } from '@/utils/api-response';

/**
 * POST /posts/_search — paginated posts; optional tag filter.
 */
export async function searchPosts(payload: ReadAllPostDto): Promise<PaginationPostDto> {
  const response = await apiFetchWithAuth('/posts/_search', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return readJsonResponse<PaginationPostDto>(response);
}

/**
 * POST /posts/{postId}/like — like a post (requires JWT). 204 No Content.
 */
export async function likePost(postId: number): Promise<void> {
  const response = await apiFetchWithAuth(`/posts/${postId}/like`, {
    method: 'POST',
  });
  await readJsonResponse<void>(response);
}

/**
 * DELETE /posts/{postId}/like — remove like (requires JWT). 204 No Content.
 */
export async function unlikePost(postId: number): Promise<void> {
  const response = await apiFetchWithAuth(`/posts/${postId}/like`, {
    method: 'DELETE',
  });
  await readJsonResponse<void>(response);
}

/**
 * POST /posts — create a post (requires JWT).
 */
export async function createPost(payload: CreatePostDto): Promise<ReadPostDto> {
  const response = await apiFetchWithAuth('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return readJsonResponse<ReadPostDto>(response);
}

/**
 * GET /posts/{postId}/comments — top-level comments for a post.
 */
export async function getPostComments(
  postId: number,
  page: number,
  limit: number
): Promise<PaginationCommentDto> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetchWithAuth(`/posts/${postId}/comments?${qs.toString()}`);
  return readJsonResponse<PaginationCommentDto>(response);
}

/**
 * GET /posts/{postId}/comments/{commentId} — replies under a comment (same pagination shape as list).
 */
export async function getCommentReplies(
  postId: number,
  commentId: number,
  page: number,
  limit: number
): Promise<PaginationCommentDto> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetchWithAuth(
    `/posts/${postId}/comments/${commentId}?${qs.toString()}`
  );
  return readJsonResponse<PaginationCommentDto>(response);
}

/**
 * POST /posts/{postId}/comments — create a comment or reply.
 */
export async function createPostComment(
  postId: number,
  payload: CreateCommentDto
): Promise<ReadCommentDto> {
  const body: Record<string, unknown> = { text: payload.text };
  if (payload.commentId !== undefined) {
    body.commentId = payload.commentId;
  }
  const response = await apiFetchWithAuth(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return readJsonResponse<ReadCommentDto>(response);
}

/**
 * DELETE /posts/{postId}/comments/{commentId} — 204 No Content on success.
 */
export async function deletePostComment(postId: number, commentId: number): Promise<void> {
  const response = await apiFetchWithAuth(`/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
  await readJsonResponse<void>(response);
}
