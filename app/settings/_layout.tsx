import { Stack } from 'expo-router';

/**
 * Settings stack: Profile hub and sub-screens (personal, location, password, legal).
 */
export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="location" />
      <Stack.Screen name="password" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
