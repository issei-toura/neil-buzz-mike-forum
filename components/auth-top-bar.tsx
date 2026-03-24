import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import NbmMark from '@/assets/images/nbmmark.svg';
import { ForumColors, ForumLayout } from '@/constants/forum';

export const authScreenPadding = ForumLayout.screenPadding;

type AuthTopBarProps = {
  onBack: () => void;
};

export function AuthTopBar({ onBack }: AuthTopBarProps) {
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={onBack} style={styles.backHit}>
        <Ionicons name="chevron-back" size={24} color={ForumColors.charcoal} />
      </Pressable>
      <View style={styles.logoRow} pointerEvents="none">
        <Text style={styles.nbm}>NBM</Text>
        <NbmMark width={36} height={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 32,
    marginBottom: 20,
    justifyContent: 'center',
  },
  backHit: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nbm: {
    fontSize: 20,
    fontWeight: '700',
    color: ForumColors.purple,
  },
});
