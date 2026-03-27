import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';
import type { ReadPostDto } from '@/types/posts';

import { formatAuthor, formatFeedDate, META_DOT, snippetBody } from './forum-feed-format';

export type PostCardProps = {
  post: ReadPostDto;
  categoryLabel: string | null;
  isLiked: boolean;
  likeBusy: boolean;
  onToggleLike: () => void;
  onOpenPost: () => void;
};

export function PostCard({
  post,
  categoryLabel,
  isLiked,
  likeBusy,
  onToggleLike,
  onOpenPost,
}: PostCardProps) {
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
});
