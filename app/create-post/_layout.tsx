import React from 'react';
import { Stack } from 'expo-router';

import { CreatePostDraftProvider } from './draft-context';

/**
 * Multi-step create post flow. Routes:
 * - /create-post — title & body
 * - /create-post/categories — tag selection
 * - /create-post/review — confirm & submit
 */
export default function CreatePostLayout() {
  return (
    <CreatePostDraftProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="review" />
      </Stack>
    </CreatePostDraftProvider>
  );
}
