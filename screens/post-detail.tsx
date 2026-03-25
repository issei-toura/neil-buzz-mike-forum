import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostDetailCommentComposer } from '@/components/post-detail/post-detail-comment-composer';
import { PostDetailScrollContent } from '@/components/post-detail/post-detail-scroll-content';
import { PostDetailTopBar } from '@/components/post-detail/post-detail-top-bar';
import { ForumColors, ForumLayout } from '@/constants/forum';
import { queryKeys } from '@/lib/query-keys';
import { buildCommentTree } from '@/lib/post-detail-comment-tree';
import { createPostComment, getPostComments } from '@/services/posts';
import type { ReadPostDto } from '@/types/posts';
import { getErrorMessage } from '@/utils/error-message';

const COMMENT_PAGE_SIZE = 25;

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { postId: postIdParam } = useLocalSearchParams<{ postId: string }>();
  const numericId = Number(postIdParam);
  const validId = Number.isFinite(numericId) && numericId > 0;

  const [draft, setDraft] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);

  const postQuery = useQuery({
    queryKey: queryKeys.post(numericId),
    queryFn: async () => {
      const cached = queryClient.getQueryData<ReadPostDto>(queryKeys.post(numericId));
      if (!cached) {
        throw new Error('Open this post from the forum feed.');
      }
      return cached;
    },
    enabled: validId,
    staleTime: Infinity,
    retry: false,
  });

  const commentsQuery = useInfiniteQuery({
    queryKey: queryKeys.postComments(numericId),
    queryFn: ({ pageParam }) => getPostComments(numericId, pageParam, COMMENT_PAGE_SIZE),
    enabled: validId,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      if (loaded >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
  });

  const flatComments = useMemo(
    () => commentsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [commentsQuery.data]
  );
  const commentTree = useMemo(() => buildCommentTree(flatComments), [flatComments]);

  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      createPostComment(numericId, {
        text,
        ...(replyingToId != null ? { commentId: replyingToId } : {}),
      }),
    onSuccess: () => {
      setDraft('');
      setReplyingToId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.postComments(numericId) });
      queryClient.setQueryData<ReadPostDto>(queryKeys.post(numericId), (prev) =>
        prev ? { ...prev, comments: prev.comments + 1 } : prev
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.forumPosts.all });
    },
  });

  const onSend = useCallback(() => {
    const text = draft.trim();
    if (text.length === 0 || commentMutation.isPending) return;
    commentMutation.mutate(text);
  }, [commentMutation, draft]);

  const onScrollLoadMore = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
      if (nearBottom && commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
        commentsQuery.fetchNextPage();
      }
    },
    [commentsQuery]
  );

  if (!validId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.padded}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.link}>Back</Text>
          </Pressable>
          <Text style={styles.errorTitle}>Invalid post</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (postQuery.isPending && postQuery.data === undefined) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ForumColors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.padded}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.link}>Back to forum</Text>
          </Pressable>
          <Text style={styles.errorTitle}>{getErrorMessage(postQuery.error)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const post = postQuery.data;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <PostDetailTopBar onBack={() => router.back()} />

        <PostDetailScrollContent
          post={post}
          commentsError={commentsQuery.isError}
          commentsErrorUnknown={commentsQuery.error}
          commentsPending={commentsQuery.isPending}
          flatCommentsLength={flatComments.length}
          commentTree={commentTree}
          onReply={(id) => setReplyingToId(id)}
          isFetchingNextPage={commentsQuery.isFetchingNextPage}
          onScroll={onScrollLoadMore}
        />

        <PostDetailCommentComposer
          draft={draft}
          onDraftChange={setDraft}
          replyingToId={replyingToId}
          onCancelReply={() => setReplyingToId(null)}
          onSend={onSend}
          isSending={commentMutation.isPending}
          bottomInset={insets.bottom}
          mutationError={commentMutation.isError ? commentMutation.error : undefined}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ForumColors.white,
  },
  flex: { flex: 1 },
  padded: { padding: ForumLayout.screenPadding, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  link: { color: ForumColors.purple, fontSize: 16 },
  errorTitle: { fontSize: 16, color: ForumColors.charcoal, marginTop: 8 },
});
