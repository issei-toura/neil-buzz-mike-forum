import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import WelcomeIllustration from '@/assets/images/welcome.svg';
import { AppButton } from '@/components/button';
import { ForumColors, ForumLayout } from '@/constants/forum';

/**
 * Welcome — Figma welcomeScreen (node 101:368): purple hero + white footer, two CTAs.
 */
export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <View style={styles.heroInner}>
          <View style={styles.illustrationRotate}>
            <WelcomeIllustration width={220} height={240} />
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.copy}>
          <Text style={styles.title}>
            Welcome to{'\n'}the NBM Forum
          </Text>
          <Text style={styles.subtitle}>
            Time to get all the answers you need in a forum made for designers and developers!
          </Text>
        </View>
        <View style={styles.buttons}>
          <AppButton
            title="Create an Account"
            trailingArrow
            onPress={() => router.push('/signup')}
          />
          <AppButton
            title="Sign In"
            variant="secondary"
            trailingArrow
            onPress={() => router.push('/signin')}
          />
        </View>
      </View>
    </View>
  );
}

/** ~486:358 split from Figma frame proportions */
const HERO_FLEX = 243;
const FOOTER_FLEX = 179;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ForumColors.white,
  },
  hero: {
    flex: HERO_FLEX,
    backgroundColor: ForumColors.purple,
    overflow: 'hidden',
  },
  heroInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationRotate: {
    transform: [{ rotate: '34deg' }],
  },
  footer: {
    flex: FOOTER_FLEX,
    backgroundColor: ForumColors.white,
    paddingHorizontal: ForumLayout.screenPadding,
    paddingTop: ForumLayout.gapSections,
    justifyContent: 'space-between',
    paddingBottom: ForumLayout.screenPadding,
  },
  copy: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: ForumColors.charcoal,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: ForumColors.charcoal,
    lineHeight: 22,
    maxWidth: ForumLayout.maxContentWidth,
  },
  buttons: {
    gap: ForumLayout.gapButtons,
  },
});
