/**
 * Central TanStack Query keys. Use these for queries, cache reads/writes, and invalidation
 * so keys stay consistent across screens.
 */
export const queryKeys = {
  tags: {
    createPost: ['tags', 'createPost'] as const,
    forumFeed: ['tags', 'forumFeed'] as const,
  },
  forumPosts: {
    /** Matches every forum feed query (all tag filters). */
    all: ['forumPosts'] as const,
    feed: (tagFilter: string | null) => ['forumPosts', tagFilter ?? 'all'] as const,
  },
  post: (id: number) => ['post', id] as const,
  postComments: (postId: number) => ['postComments', postId] as const,
};
