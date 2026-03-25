import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';

type Props = {
  onBack: () => void;
};

export function PostDetailTopBar({ onBack }: Props) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} style={styles.backHit} accessibilityRole="button">
        <MaterialIcons name="arrow-back-ios" size={22} color={ForumColors.charcoal} />
      </Pressable>
      <Text style={styles.topTitle}>Post</Text>
      <View style={styles.backHit} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ForumLayout.screenPadding,
    paddingVertical: 8,
  },
  backHit: { width: 40, height: 40, justifyContent: 'center' },
  topTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
});
