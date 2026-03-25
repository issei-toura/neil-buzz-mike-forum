import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { ForumColors } from '@/constants/forum';
import type { ReadPostDto } from '@/types/posts';

import { META_DOT, formatAuthor, formatFeedDate } from './post-detail-format';

type Props = {
  post: ReadPostDto;
};

export function PostDetailPostSection({ post }: Props) {
  return (
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
  );
}

const styles = StyleSheet.create({
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
});
