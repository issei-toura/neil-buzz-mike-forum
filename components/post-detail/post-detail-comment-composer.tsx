import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';
import { getErrorMessage } from '@/utils/error-message';

type Props = {
  draft: string;
  onDraftChange: (text: string) => void;
  replyingToId: number | null;
  onCancelReply: () => void;
  onSend: () => void;
  isSending: boolean;
  bottomInset: number;
  mutationError: unknown | null | undefined;
};

export function PostDetailCommentComposer({
  draft,
  onDraftChange,
  replyingToId,
  onCancelReply,
  onSend,
  isSending,
  bottomInset,
  mutationError,
}: Props) {
  const trimmed = draft.trim();
  const sendDisabled = trimmed.length === 0 || isSending;

  return (
    <>
      {replyingToId != null ? (
        <View style={styles.replyHint}>
          <Text style={styles.replyHintText}>Replying to a comment</Text>
          <Pressable onPress={onCancelReply} accessibilityRole="button">
            <Text style={styles.replyHintCancel}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.replyBar, { paddingBottom: Math.max(bottomInset, 12) }]}>
        <TextInput
          value={draft}
          onChangeText={onDraftChange}
          placeholder="Make a Comment"
          placeholderTextColor="rgba(56, 57, 57, 0.5)"
          style={styles.replyInput}
          editable={!isSending}
          accessibilityLabel="Comment text"
        />
        <Pressable
          onPress={onSend}
          style={[styles.sendBtn, sendDisabled && styles.sendBtnDisabled]}
          disabled={sendDisabled}
          accessibilityRole="button"
          accessibilityLabel="Send comment">
          {isSending ? (
            <ActivityIndicator color={ForumColors.white} size="small" />
          ) : (
            <MaterialIcons name="send" size={22} color={ForumColors.white} />
          )}
        </Pressable>
      </View>

      {mutationError ? (
        <Text style={styles.mutationError}>{getErrorMessage(mutationError)}</Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
