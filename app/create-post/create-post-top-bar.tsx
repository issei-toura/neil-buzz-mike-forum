import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ForumColors } from '@/constants/forum';

type CreatePostTopBarProps = {
  onClose: () => void;
  actionLabel: string;
  onActionPress: () => void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
};

/**
 * Figma: topBar — close (left), primary CTA with label + east arrow (right).
 */
export function CreatePostTopBar({
  onClose,
  actionLabel,
  onActionPress,
  actionDisabled,
  actionLoading,
}: CreatePostTopBarProps) {
  const dimmed = Boolean(actionDisabled || actionLoading);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onClose}
        hitSlop={12}
        style={styles.iconHit}
        accessibilityRole="button"
        accessibilityLabel="Close">
        <MaterialIcons name="close" size={24} color={ForumColors.charcoal} />
      </Pressable>
      <Pressable
        onPress={onActionPress}
        disabled={dimmed}
        style={[styles.actionBtn, dimmed && styles.actionBtnDimmed]}
        accessibilityRole="button"
        accessibilityState={{ disabled: dimmed }}>
        {actionLoading ? (
          <ActivityIndicator color={ForumColors.white} size="small" />
        ) : (
          <>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
            <MaterialIcons name="arrow-forward" size={18} color={ForumColors.white} />
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 343,
    alignSelf: 'center',
  },
  iconHit: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: ForumColors.purple,
  },
  actionBtnDimmed: {
    opacity: 0.4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: ForumColors.white,
  },
});
