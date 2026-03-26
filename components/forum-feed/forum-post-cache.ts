import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import type { PaginationPostDto, ReadPostDto } from '@/types/posts';

export function patchPostInForumCaches(
  queryClient: QueryClient,
  postId: number,
  patch: (post: ReadPostDto) => ReadPostDto
) {
  queryClient.setQueriesData<InfiniteData<PaginationPostDto>>(
    { queryKey: queryKeys.forumPosts.all },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((p) => (p.id === postId ? patch(p) : p)),
        })),
      };
    }
  );
}

export function adjustPostLikesEverywhere(queryClient: QueryClient, postId: number, delta: number) {
  patchPostInForumCaches(queryClient, postId, (p) => ({
    ...p,
    likes: Math.max(0, p.likes + delta),
  }));
  queryClient.setQueryData<ReadPostDto>(queryKeys.post(postId), (prev) => {
    if (!prev || prev.id !== postId) return prev;
    return { ...prev, likes: Math.max(0, prev.likes + delta) };
  });
}
