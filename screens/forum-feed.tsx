import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ForumColors, ForumLayout } from '@/constants/forum';
import { likePost, searchPosts, unlikePost } from '@/services/posts';
import { listTags } from '@/services/tags';
import type { UserReadDto } from '@/types/auth';
import type { PaginationPostDto, ReadPostDto } from '@/types/posts';
import { getErrorMessage } from '@/utils/error-message';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const CHIP_GAP = 8;
const META_DOT = '·';

function formatFeedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatAuthor(user: UserReadDto): string {
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

function snippetBody(content: string, maxLen = 200): string {
  const t = content.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

function patchPostInForumCaches(
  queryClient: QueryClient,
  postId: number,
  patch: (post: ReadPostDto) => ReadPostDto
) {
  queryClient.setQueriesData<InfiniteData<PaginationPostDto>>(
    { queryKey: ['forumPosts'] },
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

function adjustPostLikesEverywhere(queryClient: QueryClient, postId: number, delta: number) {
  patchPostInForumCaches(queryClient, postId, (p) => ({
    ...p,
    likes: Math.max(0, p.likes + delta),
  }));
  queryClient.setQueryData<ReadPostDto>(['post', postId], (prev) => {
    if (!prev || prev.id !== postId) return prev;
    return { ...prev, likes: Math.max(0, prev.likes + delta) };
  });
}

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
    queryKey: ['tags', 'forumFeed'],
    queryFn: () => listTags(1, 100),
    select: (res) => res.data.map((x) => x.name).filter((n) => n.trim().length > 0),
  });

  const postsQuery = useInfiniteQuery({
    queryKey: ['forumPosts', selectedTag ?? 'all'],
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
      await queryClient.cancelQueries({ queryKey: ['forumPosts'] });
      const snapshots = queryClient.getQueriesData({ queryKey: ['forumPosts'] });
      const detailSnap = queryClient.getQueryData<ReadPostDto>(['post', postId]);
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
        queryClient.setQueryData(['post', postId], ctx.detailSnap);
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

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.topBar}>
        <Text style={styles.forumTitle}>Forum</Text>
        <View style={styles.topBarActions}>
          <Pressable
            onPress={() => router.push('/create-post')}
            style={styles.iconHit}
            accessibilityRole="button"
            accessibilityLabel="Create new post">
            <MaterialIcons name="add" size={32} color={ForumColors.purple} />
          </Pressable>
          <Pressable
            style={styles.iconHit}
            accessibilityRole="button"
            accessibilityLabel="Account">
            <MaterialIcons name="account-circle" size={32} color={ForumColors.purple} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color={ForumColors.charcoal} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor="rgba(56, 57, 57, 0.4)"
          style={styles.searchInput}
          accessibilityLabel="Search posts"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}>
        <Pressable
          onPress={() => setSelectedTag(null)}
          style={[styles.chip, selectedTag === null && styles.chipActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedTag === null }}>
          <Text style={[styles.chipLabel, selectedTag === null && styles.chipLabelActive]}>All</Text>
        </Pressable>
        {(tagsQuery.data ?? []).map((name) => (
          <Pressable
            key={name}
            onPress={() => setSelectedTag(name)}
            style={[styles.chip, selectedTag === name && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedTag === name }}>
            <Text style={[styles.chipLabel, selectedTag === name && styles.chipLabelActive]}>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
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
          queryClient.setQueryData(['post', item.id], item);
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

      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPost}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={postsQuery.isRefetching && !postsQuery.isFetchingNextPage}
            onRefresh={onRefresh}
            tintColor={ForumColors.purple}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          postsQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerSpinner} color={ForumColors.purple} />
          ) : null
        }
        ListEmptyComponent={
          !postsQuery.isPending ? (
            <Text style={styles.empty}>No posts match your filters.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function PostCard({
  post,
  categoryLabel,
  isLiked,
  likeBusy,
  onToggleLike,
  onOpenPost,
}: {
  post: ReadPostDto;
  categoryLabel: string | null;
  isLiked: boolean;
  likeBusy: boolean;
  onToggleLike: () => void;
  onOpenPost: () => void;
}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postMetaRow}>
        <View style={styles.postMetaLeft}>
          <Text style={styles.metaText}>{formatAuthor(post.user)}</Text>
          <Text style={styles.metaDot}>{META_DOT}</Text>
          <Text style={styles.metaText}>{formatFeedDate(post.createdAt)}</Text>
        </View>
      </View>

      <Pressable
        onPress={onOpenPost}
        accessibilityRole="button"
        accessibilityLabel={`Post: ${post.title}`}>
        <Text style={styles.postTitle}>{post.title}</Text>

        {categoryLabel ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{categoryLabel}</Text>
          </View>
        ) : null}

        <Text style={styles.postBody}>{snippetBody(post.content)}</Text>
      </Pressable>

      <View style={styles.engagementRow}>
        <Pressable
          onPress={onToggleLike}
          disabled={likeBusy}
          style={styles.engagementHit}
          accessibilityRole="button"
          accessibilityLabel={isLiked ? 'Unlike post' : 'Like post'}
          accessibilityState={{ selected: isLiked, disabled: likeBusy }}>
          {likeBusy ? (
            <ActivityIndicator size="small" color={ForumColors.purple} />
          ) : (
            <MaterialIcons
              name={isLiked ? 'favorite' : 'favorite-border'}
              size={24}
              color={isLiked ? ForumColors.purple : ForumColors.charcoal}
            />
          )}
          <Text style={styles.engagementCount}>{post.likes}</Text>
        </Pressable>
        <Pressable
          onPress={onOpenPost}
          style={styles.engagementHit}
          accessibilityRole="button"
          accessibilityLabel={`Open comments, ${post.comments} comments`}>
          <MaterialIcons name="chat-bubble-outline" size={24} color={ForumColors.charcoal} />
          <Text style={styles.engagementCount}>{post.comments}</Text>
        </Pressable>
      </View>
    </View>
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
  listContent: {
    paddingBottom: 24,
  },
  headerBlock: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  forumTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ForumLayout.gapButtons,
  },
  iconHit: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 57, 57, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    maxWidth: ForumLayout.maxContentWidth + 48,
    alignSelf: 'stretch',
  },
  searchIcon: {
    opacity: 0.4,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: ForumColors.charcoal,
    padding: 0,
  },
  chipsScroll: {
    marginHorizontal: -ForumLayout.screenPadding,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CHIP_GAP,
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'rgba(56, 57, 57, 0.1)',
  },
  chipActive: {
    backgroundColor: ForumColors.purple,
  },
  chipLabel: {
    fontSize: 14,
    color: ForumColors.charcoal,
  },
  chipLabelActive: {
    color: ForumColors.white,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(56, 57, 57, 0.15)',
    marginHorizontal: ForumLayout.screenPadding,
  },
  postCard: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingVertical: 20,
    gap: 8,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    color: ForumColors.charcoal,
    opacity: 0.8,
  },
  metaDot: {
    fontSize: 14,
    color: ForumColors.charcoal,
    opacity: 0.8,
  },
  postTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: ForumColors.purple,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  categoryPillText: {
    fontSize: 14,
    color: ForumColors.white,
  },
  postBody: {
    fontSize: 14,
    color: ForumColors.charcoal,
    lineHeight: 20,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
    opacity: 0.9,
  },
  engagementHit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  engagementCount: {
    fontSize: 14,
    color: ForumColors.charcoal,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
  empty: {
    textAlign: 'center',
    color: ForumColors.muted,
    paddingVertical: 32,
    paddingHorizontal: ForumLayout.screenPadding,
  },
});
