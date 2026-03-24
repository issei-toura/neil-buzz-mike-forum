import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SplashIllustration from '@/assets/images/splash.svg';
import { ForumColors } from '@/constants/forum';

/**
 * Splash — Figma: solid purple + centered white illustration (node 101:2).
 */
export default function SplashScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <SplashIllustration width={120} height={179} />
        </View>
        <Pressable style={styles.footer} onPress={() => router.push('/welcome')}>
          <Text style={styles.footerLabel}>Continue</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ForumColors.purple,
  },
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerLabel: {
    color: ForumColors.white,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.95,
  },
});
