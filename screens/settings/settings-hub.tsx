import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsRow } from '@/components/settings-row';
import { ForumColors, ForumLayout } from '@/constants/forum';
import { clearAccessToken } from '@/utils/auth-storage';

const ROW_GAP = 8;
const SECTION_GAP = 14;
const SECTION_AFTER_TITLE = 24;

export default function SettingsHubScreen() {
  const router = useRouter();

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will sign you out and remove data stored on this device. This cannot be undone from the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearAccessToken();
            router.replace('/signin');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backHit}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={24} color={ForumColors.charcoal} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Profile
          </Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.rowGroup}>
            <SettingsRow
              icon="person"
              label="Personal Information"
              onPress={() => router.push('/settings/personal')}
            />
            <SettingsRow
              icon="location-on"
              label="Location"
              onPress={() => router.push('/settings/location')}
            />
            <SettingsRow
              icon="lock"
              label="Update password"
              onPress={() => router.push('/settings/password')}
            />
            <SettingsRow
              icon="delete-outline"
              label="Delete account"
              onPress={confirmDeleteAccount}
              accessibilityHint="Opens a confirmation dialog"
            />
          </View>
        </View>

        <View style={[styles.section, styles.sectionLegal]}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.rowGroup}>
            <SettingsRow
              icon="menu-book"
              label="Terms of service"
              onPress={() => router.push('/settings/terms')}
            />
            <SettingsRow
              icon="privacy-tip"
              label="Privacy policy"
              onPress={() => router.push('/settings/privacy')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ForumColors.white,
  },
  scroll: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SECTION_AFTER_TITLE,
  },
  backHit: {
    width: 40,
    paddingVertical: 4,
    marginLeft: -4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  topBarSpacer: {
    width: 40,
  },
  section: {
    marginBottom: SECTION_GAP,
  },
  sectionLegal: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ForumColors.charcoal,
    marginBottom: SECTION_GAP,
  },
  rowGroup: {
    gap: ROW_GAP,
  },
});
