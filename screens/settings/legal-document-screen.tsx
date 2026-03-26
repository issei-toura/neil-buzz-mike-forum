import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ForumColors, ForumLayout } from '@/constants/forum';

export type LegalDocumentScreenProps = {
  title: string;
  body: string;
};

/**
 * Scrollable legal document with back navigation (Terms / Privacy).
 */
export function LegalDocumentScreen({ title, body }: LegalDocumentScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backHit}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={ForumColors.charcoal} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator>
        <Text style={styles.body}>{body}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ForumColors.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 12,
  },
  backHit: {
    width: 40,
    paddingVertical: 4,
    marginLeft: -4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  topBarSpacer: {
    width: 40,
  },
  scroll: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 40,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: ForumColors.charcoal,
    opacity: 0.95,
  },
});
