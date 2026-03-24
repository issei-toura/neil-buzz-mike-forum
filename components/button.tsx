import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';

export type AppButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  /** Matches Figma CTA (arrow after label). */
  trailingArrow?: boolean;
};

export function AppButton({
  title,
  onPress,
  disabled,
  loading = false,
  variant = 'primary',
  trailingArrow = false,
  style,
  ...rest
}: AppButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;
  const iconColor = isPrimary ? ForumColors.white : ForumColors.purple;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        isPrimary
          ? { backgroundColor: ForumColors.purple }
          : {
              backgroundColor: ForumColors.white,
              borderWidth: 2,
              borderColor: ForumColors.purple,
            },
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              isPrimary ? styles.labelOnPrimary : { color: ForumColors.purple },
            ]}>
            {title}
          </Text>
          {trailingArrow ? (
            <Ionicons name="arrow-forward" size={18} color={iconColor} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ForumLayout.buttonPaddingVertical,
    paddingHorizontal: ForumLayout.buttonPaddingHorizontal,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ForumLayout.gapButtons,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
  },
  labelOnPrimary: {
    color: ForumColors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.88,
  },
});
