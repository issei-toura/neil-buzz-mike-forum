import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddressInput } from '@/components/address-input';
import { ForumColors, ForumLayout } from '@/constants/forum';
import type { GoogleResolvedAddress } from '@/types/google-place';
import { getProfileLocation, setProfileLocation } from '@/utils/auth-storage';

export default function LocationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState('');
  const [resolvedPlace, setResolvedPlace] = useState<GoogleResolvedAddress | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await getProfileLocation();
        if (!cancelled) {
          setAddress(stored ?? '');
          setResolvedPlace(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      const toSave = resolvedPlace?.fullAddress?.trim() || address.trim();
      await setProfileLocation(toSave.length > 0 ? toSave : null);
      router.back();
    } finally {
      setSaving(false);
    }
  }, [address, resolvedPlace, router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={ForumColors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconHit}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <MaterialIcons name="close" size={24} color={ForumColors.charcoal} />
        </Pressable>
        <Pressable
          onPress={onSave}
          disabled={saving}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, saving && styles.saveBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Save location">
          {saving ? (
            <ActivityIndicator size="small" color={ForumColors.white} />
          ) : (
            <>
              <Text style={styles.saveLabel}>Save</Text>
              <MaterialIcons name="check" size={18} color={ForumColors.white} />
            </>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle} accessibilityRole="header">
          Location
        </Text>

        <AddressInput
          label="Address"
          placeholder="Start typing — pick a suggestion for a verified address"
          value={address}
          onChangeText={setAddress}
          onResolvedAddressChange={setResolvedPlace}
          brandBorder
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ForumColors.white,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 8,
  },
  iconHit: {
    padding: 4,
    marginLeft: -4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ForumColors.purple,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnPressed: {
    opacity: 0.88,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: ForumColors.white,
  },
  scroll: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 40,
    maxWidth: ForumLayout.maxContentWidth + 48,
    alignSelf: 'center',
    width: '100%',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ForumColors.charcoal,
    marginBottom: 32,
  },
});
