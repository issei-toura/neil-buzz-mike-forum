import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';
import type { CommentNode } from '@/lib/post-detail-comment-tree';
import type { ReadPostDto } from '@/types/posts';
import { getErrorMessage } from '@/utils/error-message';

import { PostDetailCommentBranch } from './post-detail-comment-branch';
import { PostDetailPostSection } from './post-detail-post-section';

type Props = {
  post: ReadPostDto;
  commentsError: boolean;
  commentsErrorUnknown: unknown;
  commentsPending: boolean;
  flatCommentsLength: number;
  commentTree: CommentNode[];
  onReply: (id: number) => void;
  isFetchingNextPage: boolean;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function PostDetailScrollContent({
  post,
  commentsError,
  commentsErrorUnknown,
  commentsPending,
  flatCommentsLength,
  commentTree,
  onReply,
  isFetchingNextPage,
  onScroll,
}: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      scrollEventThrottle={400}>
      <PostDetailPostSection post={post} />

      <View style={styles.divider} />

      <Text style={styles.commentsHeading}>Comments</Text>

      {commentsError ? (
        <Text style={styles.commentError}>{getErrorMessage(commentsErrorUnknown)}</Text>
      ) : commentsPending && flatCommentsLength === 0 ? (
        <ActivityIndicator color={ForumColors.purple} style={styles.commentsSpinner} />
      ) : commentTree.length === 0 ? (
        <Text style={styles.noComments}>No comments yet.</Text>
      ) : (
        commentTree.map((node) => (
          <PostDetailCommentBranch key={node.id} node={node} depth={0} onReply={onReply} />
        ))
      )}

      {isFetchingNextPage ? (
        <ActivityIndicator color={ForumColors.purple} style={styles.commentsSpinner} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 24,
  },
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
});
