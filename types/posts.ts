/**
 * Post DTOs aligned with Forum OpenAPI (api-json).
 */

import type { UserReadDto } from './auth';

export interface ReadPostDto {
  id: number;
  title: string;
  content: string;
  /** ISO 8601 date-time */
  createdAt: string;
  user: UserReadDto;
  likes: number;
  comments: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
  tags: string[];
}

export interface ReadAllPostDto {
  page: number;
  limit: number;
  tags?: string[];
}

export interface PaginationPostDto {
  total: number;
  data: ReadPostDto[];
}
