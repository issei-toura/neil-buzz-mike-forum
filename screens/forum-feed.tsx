import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ForumFeedHeader } from '@/components/forum-feed/forum-feed-header';
import { ForumFeedPostList } from '@/components/forum-feed/forum-feed-post-list';
import { adjustPostLikesEverywhere } from '@/components/forum-feed/forum-post-cache';
import { PostCard } from '@/components/forum-feed/post-card';
import { ForumColors, ForumLayout } from '@/constants/forum';
import { queryKeys } from '@/lib/query-keys';
import { likePost, searchPosts, unlikePost } from '@/services/posts';
import { listTags } from '@/services/tags';
import type { ReadPostDto } from '@/types/posts';
import { getErrorMessage } from '@/utils/error-message';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_TAG_NAMES: string[] = [];

export default function ForumFeedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  /** Session-local; API does not expose liked-by-me on ReadPostDto. */
  const [likedByMe, setLikedByMe] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags.forumFeed,
    queryFn: () => listTags(1, 100),
    select: (res) => res.data.map((x) => x.name).filter((n) => n.trim().length > 0),
  });

  const postsQuery = useInfiniteQuery({
    queryKey: queryKeys.forumPosts.feed(selectedTag),
    queryFn: ({ pageParam }) =>
      searchPosts({
        page: pageParam,
        limit: PAGE_SIZE,
        ...(selectedTag ? { tags: [selectedTag] } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      if (loaded >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
  });

  const flatPosts = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [postsQuery.data]
  );

  const displayedPosts = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return flatPosts;
    return flatPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)
    );
  }, [flatPosts, debouncedSearch]);

  const onRefresh = useCallback(() => {
    postsQuery.refetch();
    tagsQuery.refetch();
  }, [postsQuery, tagsQuery]);

  const loadMore = useCallback(() => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
      postsQuery.fetchNextPage();
    }
  }, [postsQuery]);

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, like }: { postId: number; like: boolean }) => {
      if (like) await likePost(postId);
      else await unlikePost(postId);
    },
    onMutate: async ({ postId, like }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.forumPosts.all });
      const snapshots = queryClient.getQueriesData({ queryKey: queryKeys.forumPosts.all });
      const detailSnap = queryClient.getQueryData<ReadPostDto>(queryKeys.post(postId));
      const prevLiked = likedByMe[postId] ?? false;
      const delta = like ? 1 : -1;
      adjustPostLikesEverywhere(queryClient, postId, delta);
      setLikedByMe((s) => ({ ...s, [postId]: like }));
      return { snapshots, detailSnap, prevLiked };
    },
    onError: (err, { postId }, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (ctx && ctx.detailSnap !== undefined) {
        queryClient.setQueryData(queryKeys.post(postId), ctx.detailSnap);
      }
      if (ctx) {
        setLikedByMe((s) => ({ ...s, [postId]: ctx.prevLiked }));
      }
      Alert.alert('Could not update like', getErrorMessage(err));
    },
  });

  const togglingPostId = toggleLikeMutation.isPending
    ? toggleLikeMutation.variables?.postId
    : undefined;

  const onPressCreate = useCallback(() => {
    router.push('/create-post');
  }, [router]);

  const onPressSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const tagNames = tagsQuery.data;

  const listHeader = useMemo(
    () => (
      <ForumFeedHeader
        search={search}
        onSearchChange={setSearch}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        tagNames={tagNames ?? EMPTY_TAG_NAMES}
        onPressCreate={onPressCreate}
        onPressSettings={onPressSettings}
      />
    ),
    [search, selectedTag, tagNames, onPressCreate, onPressSettings]
  );

  const renderPost = useCallback(
    ({ item }: { item: ReadPostDto }) => (
      <PostCard
        post={item}
        categoryLabel={selectedTag}
        isLiked={likedByMe[item.id] ?? false}
        likeBusy={togglingPostId === item.id}
        onToggleLike={() => {
          const next = !(likedByMe[item.id] ?? false);
          toggleLikeMutation.mutate({ postId: item.id, like: next });
        }}
        onOpenPost={() => {
          queryClient.setQueryData(queryKeys.post(item.id), item);
          router.push({ pathname: '/post/[postId]', params: { postId: String(item.id) } });
        }}
      />
    ),
    [likedByMe, queryClient, router, selectedTag, toggleLikeMutation, togglingPostId]
  );

  if (postsQuery.isPending && !postsQuery.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ForumColors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {postsQuery.isError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{getErrorMessage(postsQuery.error)}</Text>
          <Pressable onPress={() => postsQuery.refetch()} accessibilityRole="button">
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <ForumFeedPostList
        data={displayedPosts}
        listHeader={listHeader}
        renderItem={renderPost}
        refreshing={postsQuery.isRefetching && !postsQuery.isFetchingNextPage}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        showFooterSpinner={postsQuery.isFetchingNextPage}
        showEmptyMessage={!postsQuery.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ForumColors.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingVertical: 12,
    backgroundColor: ForumColors.errorBanner,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: ForumColors.charcoal,
    fontSize: 14,
  },
  retry: {
    color: ForumColors.purple,
    fontSize: 14,
    fontWeight: '600',
  },
});
