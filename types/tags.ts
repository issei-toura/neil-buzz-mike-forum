/**
 * Tag list response (OpenAPI 200 schema is empty; shape confirmed via GET /tags).
 */

export interface TagEntryDto {
  name: string;
}

export interface PaginationTagDto {
  data: TagEntryDto[];
  total: number;
}
