import { useMutation, useQueryClient } from '@tanstack/react-query';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreatePostTopBar } from '@/app/create-post/create-post-top-bar';
import { useCreatePostDraft } from './draft-context';
import {
  createPostBodyFont,
  createPostTitleFont,
} from '@/constants/create-post-styles';
import { ForumColors, ForumLayout } from '@/constants/forum';
import { queryKeys } from '@/lib/query-keys';
import { createPost } from '@/services/posts';
import { getErrorMessage } from '@/utils/error-message';

/**
 * Step 3 — reviewPost / createNewPost (Figma node 164:2471).
 */
export default function CreatePostReviewScreen() {
  const queryClient = useQueryClient();
  const { draft, resetDraft } = useCreatePostDraft();
  const canPublish = draft.title.trim().length > 0 && draft.content.trim().length > 0;

  const mutation = useMutation({
    mutationFn: () =>
      createPost({
        title: draft.title.trim(),
        content: draft.content.trim(),
        tags: draft.selectedTags,
      }),
    onSuccess: (post) => {
      queryClient.setQueryData(queryKeys.post(post.id), post);
      queryClient.invalidateQueries({ queryKey: queryKeys.forumPosts.all });
      resetDraft();
      router.replace('/(app)');
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screenPad}>
        <CreatePostTopBar
          onClose={() => router.back()}
          actionLabel="Post"
          onActionPress={() => mutation.mutate()}
          actionDisabled={!canPublish}
          actionLoading={mutation.isPending}
        />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {draft.selectedTags.length > 0 ? (
            <View style={styles.tagRow}>
              {draft.selectedTags.map((tag) => (
                <View key={tag} style={styles.categoryTab}>
                  <Text style={styles.categoryTabText}>{tag}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color={ForumColors.white} />
                </View>
              ))}
            </View>
          ) : null}

          <Text style={[styles.postTitle, createPostTitleFont]}>
            {draft.title.trim() || '—'}
          </Text>
          <Text style={[styles.postBody, createPostBodyFont]}>{draft.content.trim()}</Text>

          {mutation.isError ? (
            <Text style={styles.errorBanner}>{getErrorMessage(mutation.error)}</Text>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ForumColors.white },
  flex: { flex: 1 },
  screenPad: {
    flex: 1,
    paddingHorizontal: ForumLayout.screenPadding,
    paddingTop: 12,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 32,
    gap: 14,
    maxWidth: 341,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: ForumColors.purple,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '400',
    color: ForumColors.white,
  },
  postTitle: {
    maxWidth: 341,
  },
  postBody: {
    maxWidth: 339,
    lineHeight: 20,
  },
  errorBanner: {
    color: ForumColors.error,
    fontSize: 14,
  },
});
