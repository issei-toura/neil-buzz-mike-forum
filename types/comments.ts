/**
 * Comment DTOs aligned with Forum OpenAPI (api-json).
 */

import type { UserReadDto } from './auth';
import type { ReadPostDto } from './posts';

export interface ReadCommentDto {
  id: number;
  text: string;
  user: UserReadDto;
  post: ReadPostDto;
  parent: ReadCommentDto | null;
  /** ISO 8601 date-time */
  createdAt: string;
}

export interface PaginationCommentDto {
  total: number;
  data: ReadCommentDto[];
}

/**
 * OpenAPI marks `commentId` as required; the description suggests it can be omitted for root comments.
 * The client omits the field when undefined.
 */
export interface CreateCommentDto {
  text: string;
  commentId?: number;
}
