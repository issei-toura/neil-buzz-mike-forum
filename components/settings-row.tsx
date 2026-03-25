import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';

export type SettingsRowProps = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
};

/**
 * Single settings list row: grey card, purple leading icon, label, trailing chevron (Figma settingsField).
 */
export function SettingsRow({ icon, label, onPress, accessibilityHint }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}>
      <View style={styles.leading}>
        <MaterialIcons name={icon} size={32} color={ForumColors.purple} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={18} color={ForumColors.charcoal} style={styles.chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ForumColors.settingsRow,
    paddingVertical: ForumLayout.buttonPaddingVertical,
    paddingHorizontal: 8,
    maxWidth: ForumLayout.maxContentWidth + 24,
    alignSelf: 'stretch',
  },
  rowPressed: {
    opacity: 0.85,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: ForumColors.charcoal,
    opacity: 0.8,
  },
  chevron: {
    opacity: 0.4,
  },
});
