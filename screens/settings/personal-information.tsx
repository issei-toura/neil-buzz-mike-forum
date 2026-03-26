import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/input';
import { ProfileAvatarPicker } from '@/components/profile-avatar-picker';
import { ForumColors, ForumLayout } from '@/constants/forum';
import {
  personalInformationSchema,
  type PersonalInformationFormValues,
} from '@/schemas/auth-forms';
import type { UserReadDto } from '@/types/auth';
import { getCurrentUser, getProfileAvatarUri, setCurrentUser, setProfileAvatarUri } from '@/utils/auth-storage';

export default function PersonalInformationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseUser, setBaseUser] = useState<UserReadDto | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInformationFormValues>({
    resolver: zodResolver(personalInformationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [user, uri] = await Promise.all([getCurrentUser(), getProfileAvatarUri()]);
        if (cancelled) return;
        setBaseUser(user);
        if (user) {
          reset({
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            email: user.email ?? '',
          });
        }
        setAvatarUri(uri);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const onSubmit = useCallback(
    async (data: PersonalInformationFormValues) => {
      if (!baseUser) {
        Alert.alert('Not signed in', 'Sign in again to save your profile.');
        return;
      }
      setSaving(true);
      try {
        const updated: UserReadDto = {
          ...baseUser,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        };
        await setCurrentUser(updated);
        await setProfileAvatarUri(avatarUri);
        setBaseUser(updated);
        router.back();
      } finally {
        setSaving(false);
      }
    },
    [avatarUri, baseUser, router]
  );

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
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={saving}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, saving && styles.saveBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Save profile">
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
          Personal Information
        </Text>

        <ProfileAvatarPicker avatarUri={avatarUri} onAvatarUriChange={setAvatarUri} />

        <View style={styles.nameBlock}>
          <Text style={styles.groupLabel}>Your name</Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                ref={ref}
                label=""
                placeholder="Enter your first name here"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
                brandBorder
                autoCapitalize="words"
                autoCorrect
                autoComplete="given-name"
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                ref={ref}
                label=""
                placeholder="Last name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
                brandBorder
                autoCapitalize="words"
                autoCorrect
                autoComplete="family-name"
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              ref={ref}
              label="Email"
              placeholder="you@email.com.au"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              brandBorder
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
            />
          )}
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
  nameBlock: {
    marginBottom: 8,
  },
  groupLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: ForumColors.charcoal,
    marginBottom: 8,
  },
});
