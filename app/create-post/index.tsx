import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreatePostTopBar } from '@/app/create-post/create-post-top-bar';
import { useCreatePostDraft } from './draft-context';
import {
  createPostBodyFont,
  createPostPlaceholderMuted,
  createPostTitleFont,
} from '@/constants/create-post-styles';
import { ForumColors, ForumLayout } from '@/constants/forum';

/**
 * Step 1 — postDetails / createNewPost (Figma node 164:498).
 */
export default function CreatePostComposeScreen() {
  const { draft, setTitle, setContent } = useCreatePostDraft();
  const canContinue = draft.title.trim().length > 0 && draft.content.trim().length > 0;

  const goNext = () => {
    if (canContinue) router.push('/create-post/categories');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.screenPad}>
          <CreatePostTopBar
            onClose={() => router.back()}
            actionLabel="Next"
            onActionPress={goNext}
            actionDisabled={!canContinue}
          />

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <TextInput
              value={draft.title}
              onChangeText={setTitle}
              placeholder="Enter post title..."
              placeholderTextColor={createPostPlaceholderMuted}
              style={[styles.titleInput, createPostTitleFont]}
              accessibilityLabel="Post title"
            />
            <TextInput
              value={draft.content}
              onChangeText={setContent}
              placeholder="Enter your body text..."
              placeholderTextColor={createPostPlaceholderMuted}
              style={[styles.bodyInput, createPostBodyFont]}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Post body"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 32,
    paddingBottom: 32,
    gap: 14,
  },
  titleInput: {
    width: '100%',
    maxWidth: 341,
    padding: 0,
    margin: 0,
    borderWidth: 0,
  },
  bodyInput: {
    width: '100%',
    maxWidth: 339,
    minHeight: 120,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    lineHeight: 20,
  },
});
