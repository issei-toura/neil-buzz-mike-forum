import React from 'react';
import { Stack } from 'expo-router';

/**
 * Main app area after auth: single forum screen (no tab bar).
 * Route group (app) does not appear in the URL; use /(app) in redirects.
 */
export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
