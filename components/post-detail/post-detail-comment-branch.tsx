import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ForumColors } from '@/constants/forum';

import type { CommentNode } from '@/lib/post-detail-comment-tree';

import { META_DOT, formatAuthor, formatFeedDate } from './post-detail-format';

type Props = {
  node: CommentNode;
  depth: number;
  onReply: (id: number) => void;
};

export function PostDetailCommentBranch({ node, depth, onReply }: Props) {
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
        <PostDetailCommentBranch key={ch.id} node={ch} depth={depth + 1} onReply={onReply} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  threadBlock: { marginBottom: 14, gap: 6 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    color: ForumColors.charcoal,
    opacity: 0.8,
  },
  metaDot: { fontSize: 14, color: ForumColors.charcoal, opacity: 0.8 },
  commentText: { fontSize: 14, color: ForumColors.charcoal, lineHeight: 20 },
  replyLinkWrap: { alignSelf: 'flex-start' },
  replyLink: { fontSize: 14, color: ForumColors.purple },
});
