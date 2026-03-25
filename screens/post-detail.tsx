import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ForumColors, ForumLayout } from '@/constants/forum';
import { queryKeys } from '@/lib/query-keys';
import { createPostComment, getPostComments } from '@/services/posts';
import type { UserReadDto } from '@/types/auth';
import type { ReadCommentDto } from '@/types/comments';
import type { ReadPostDto } from '@/types/posts';
import { getErrorMessage } from '@/utils/error-message';

const COMMENT_PAGE_SIZE = 25;
const META_DOT = '·';

type CommentNode = ReadCommentDto & { children: CommentNode[] };

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

function uniqueCommentsById(flat: ReadCommentDto[]): ReadCommentDto[] {
  const map = new Map<number, ReadCommentDto>();
  flat.forEach((c) => map.set(c.id, c));
  return [...map.values()];
}

function buildCommentTree(flat: ReadCommentDto[]): CommentNode[] {
  const unique = uniqueCommentsById(flat);
  const nodes = new Map<number, CommentNode>();
  unique.forEach((c) => nodes.set(c.id, { ...c, children: [] }));
  const roots: CommentNode[] = [];
  unique.forEach((c) => {
    const node = nodes.get(c.id)!;
    const pid = c.parent?.id ?? null;
    if (pid === null) {
      roots.push(node);
    } else {
      const parent = nodes.get(pid);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  });
  const sortRec = (list: CommentNode[]): CommentNode[] =>
    [...list]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((n) => ({ ...n, children: sortRec(n.children) }));
  return sortRec(roots);
}

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
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backHit} accessibilityRole="button">
            <MaterialIcons name="arrow-back-ios" size={22} color={ForumColors.charcoal} />
          </Pressable>
          <Text style={styles.topTitle}>Post</Text>
          <View style={styles.backHit} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
            if (nearBottom && commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
              commentsQuery.fetchNextPage();
            }
          }}
          scrollEventThrottle={400}>
          <View style={styles.postBlock}>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{formatAuthor(post.user)}</Text>
              <Text style={styles.metaDot}>{META_DOT}</Text>
              <Text style={styles.metaText}>{formatFeedDate(post.createdAt)}</Text>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postBody}>{post.content}</Text>
            <View style={styles.commentSummary}>
              <MaterialIcons name="chat-bubble-outline" size={24} color={ForumColors.charcoal} />
              <Text style={styles.commentSummaryText}>{post.comments}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.commentsHeading}>Comments</Text>

          {commentsQuery.isError ? (
            <Text style={styles.commentError}>{getErrorMessage(commentsQuery.error)}</Text>
          ) : commentsQuery.isPending && flatComments.length === 0 ? (
            <ActivityIndicator color={ForumColors.purple} style={styles.commentsSpinner} />
          ) : commentTree.length === 0 ? (
            <Text style={styles.noComments}>No comments yet.</Text>
          ) : (
            commentTree.map((node) => (
              <CommentBranch
                key={node.id}
                node={node}
                depth={0}
                onReply={(id) => setReplyingToId(id)}
              />
            ))
          )}

          {commentsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={ForumColors.purple} style={styles.commentsSpinner} />
          ) : null}
        </ScrollView>

        {replyingToId != null ? (
          <View style={styles.replyHint}>
            <Text style={styles.replyHintText}>Replying to a comment</Text>
            <Pressable onPress={() => setReplyingToId(null)} accessibilityRole="button">
              <Text style={styles.replyHintCancel}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={[styles.replyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Make a Comment"
            placeholderTextColor="rgba(56, 57, 57, 0.5)"
            style={styles.replyInput}
            editable={!commentMutation.isPending}
            accessibilityLabel="Comment text"
          />
          <Pressable
            onPress={onSend}
            style={[styles.sendBtn, draft.trim().length === 0 && styles.sendBtnDisabled]}
            disabled={draft.trim().length === 0 || commentMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Send comment">
            {commentMutation.isPending ? (
              <ActivityIndicator color={ForumColors.white} size="small" />
            ) : (
              <MaterialIcons name="send" size={22} color={ForumColors.white} />
            )}
          </Pressable>
        </View>

        {commentMutation.isError ? (
          <Text style={styles.mutationError}>{getErrorMessage(commentMutation.error)}</Text>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CommentBranch({
  node,
  depth,
  onReply,
}: {
  node: CommentNode;
  depth: number;
  onReply: (id: number) => void;
}) {
  return (
    <View
      style={[
        styles.threadBlock,
        depth > 0 && {
          marginLeft: 16,
          paddingLeft: 12,
          borderLeftWidth: 2,
          borderLeftColor: 'rgba(56, 57, 57, 0.12)',
        },
      ]}>
      <View style={styles.commentMeta}>
        <Text style={styles.metaText}>{formatAuthor(node.user)}</Text>
        <Text style={styles.metaDot}>{META_DOT}</Text>
        <Text style={styles.metaText}>{formatFeedDate(node.createdAt)}</Text>
      </View>
      <Text style={styles.commentText}>{node.text}</Text>
      <Pressable onPress={() => onReply(node.id)} style={styles.replyLinkWrap}>
        <Text style={styles.replyLink}>Reply</Text>
      </Pressable>
      {node.children.map((ch) => (
        <CommentBranch key={ch.id} node={ch} depth={depth + 1} onReply={onReply} />
      ))}
    </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ForumLayout.screenPadding,
    paddingVertical: 8,
  },
  backHit: { width: 40, height: 40, justifyContent: 'center' },
  topTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 24,
  },
  postBlock: { gap: 8, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    color: ForumColors.charcoal,
    opacity: 0.8,
  },
  metaDot: { fontSize: 14, color: ForumColors.charcoal, opacity: 0.8 },
  postTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  postBody: {
    fontSize: 14,
    color: ForumColors.charcoal,
    lineHeight: 22,
  },
  commentSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.8,
    marginTop: 4,
  },
  commentSummaryText: { fontSize: 14, color: ForumColors.charcoal },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(56, 57, 57, 0.15)',
    marginVertical: 16,
  },
  commentsHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: ForumColors.charcoal,
    marginBottom: 12,
  },
  commentError: { color: ForumColors.error, marginBottom: 8 },
  commentsSpinner: { marginVertical: 16 },
  noComments: { color: ForumColors.muted, marginBottom: 8 },
  threadBlock: { marginBottom: 14, gap: 6 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  commentText: { fontSize: 14, color: ForumColors.charcoal, lineHeight: 20 },
  replyLinkWrap: { alignSelf: 'flex-start' },
  replyLink: { fontSize: 14, color: ForumColors.purple },
  replyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ForumLayout.screenPadding,
    paddingVertical: 8,
    backgroundColor: 'rgba(101, 55, 255, 0.08)',
  },
  replyHintText: { fontSize: 13, color: ForumColors.charcoal },
  replyHintCancel: { fontSize: 13, color: ForumColors.purple, fontWeight: '600' },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: ForumLayout.screenPadding,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ForumColors.charcoal,
    backgroundColor: ForumColors.white,
  },
  replyInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#efefef',
    fontSize: 14,
    fontWeight: '600',
    color: ForumColors.charcoal,
  },
  sendBtn: {
    width: 44,
    height: 40,
    backgroundColor: ForumColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  mutationError: {
    color: ForumColors.error,
    fontSize: 13,
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 8,
  },
});
