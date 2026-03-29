import { memo, type ReactElement } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ListRenderItem } from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';
import type { ReadPostDto } from '@/types/posts';

export type ForumFeedPostListProps = {
  data: ReadPostDto[];
  listHeader: ReactElement;
  renderItem: ListRenderItem<ReadPostDto>;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  showFooterSpinner: boolean;
  showEmptyMessage: boolean;
};

function FeedItemSeparator() {
  return <View style={styles.separator} />;
}

export const ForumFeedPostList = memo(function ForumFeedPostList({
  data,
  listHeader,
  renderItem,
  refreshing,
  onRefresh,
  onEndReached,
  showFooterSpinner,
  showEmptyMessage,
}: ForumFeedPostListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ItemSeparatorComponent={FeedItemSeparator}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ForumColors.purple} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.35}
      ListFooterComponent={
        showFooterSpinner ? (
          <ActivityIndicator style={styles.footerSpinner} color={ForumColors.purple} />
        ) : null
      }
      ListEmptyComponent={
        showEmptyMessage ? (
          <Text style={styles.empty}>No posts match your filters.</Text>
        ) : null
      }
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(56, 57, 57, 0.15)',
    marginHorizontal: ForumLayout.screenPadding,
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
