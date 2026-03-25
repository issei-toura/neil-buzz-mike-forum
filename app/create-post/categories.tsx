import { useQuery } from '@tanstack/react-query';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreatePostTopBar } from '@/app/create-post/create-post-top-bar';
import { useCreatePostDraft } from './draft-context';
import {
  createPostCategoryLabelFont,
  createPostTitleFont,
} from '@/constants/create-post-styles';
import { ForumColors, ForumLayout } from '@/constants/forum';
import { queryKeys } from '@/lib/query-keys';
import { listTags } from '@/services/tags';
import { getErrorMessage } from '@/utils/error-message';

const TAGS_LIMIT = 100;
const ROW_GAP = 14;
const CHECKBOX_SIZE = 18;

/**
 * Step 2 — category / createNewPost (Figma node 164:2098).
 */
export default function CreatePostCategoriesScreen() {
  const { draft, toggleTag } = useCreatePostDraft();

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags.createPost,
    queryFn: () => listTags(1, TAGS_LIMIT),
    select: (res) => res.data.map((x) => x.name).filter((n) => n.trim().length > 0),
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screenPad}>
        <CreatePostTopBar
          onClose={() => router.back()}
          actionLabel="Next"
          onActionPress={() => router.push('/create-post/review')}
        />

        <Text style={[styles.pageTitle, createPostTitleFont]}>Select a Category</Text>

        {tagsQuery.isPending ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={ForumColors.purple} />
          </View>
        ) : tagsQuery.isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{getErrorMessage(tagsQuery.error)}</Text>
            <Pressable onPress={() => tagsQuery.refetch()} accessibilityRole="button">
              <Text style={styles.retry}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {(tagsQuery.data ?? []).map((name) => {
              const selected = draft.selectedTags.includes(name);
              return (
                <Pressable
                  key={name}
                  onPress={() => toggleTag(name)}
                  style={styles.row}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}>
                  <View
                    style={[
                      styles.checkbox,
                      selected && styles.checkboxSelected,
                    ]}>
                    {selected ? (
                      <MaterialIcons name="check" size={14} color={ForumColors.white} />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.rowLabel,
                      createPostCategoryLabelFont,
                      selected && styles.rowLabelSelected,
                    ]}>
                    {name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
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
  pageTitle: {
    marginTop: 24,
    marginBottom: 8,
    maxWidth: 341,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  errorBox: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 80,
  },
  errorText: { color: ForumColors.charcoal, fontSize: 14 },
  retry: { color: ForumColors.purple, fontSize: 15, fontWeight: '600' },
  listContent: {
    paddingTop: 18,
    paddingBottom: 24,
    gap: ROW_GAP,
    maxWidth: 341,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderWidth: 2,
    borderColor: 'rgba(56, 57, 57, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: ForumColors.purple,
    borderColor: ForumColors.purple,
  },
  rowLabel: {
    flex: 1,
  },
  rowLabelSelected: {
    color: ForumColors.charcoal,
  },
});
