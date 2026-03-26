import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/input';
import { ForumColors, ForumLayout } from '@/constants/forum';
import { updatePasswordSchema } from '@/schemas/auth-forms';

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'currentPassword' | 'newPassword' | 'confirmNewPassword', string>>>(
    {}
  );

  const onSave = useCallback(() => {
    setErrors({});
    const parsed = updatePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        currentPassword: flat.currentPassword?.[0],
        newPassword: flat.newPassword?.[0],
        confirmNewPassword: flat.confirmNewPassword?.[0],
      });
      return;
    }

    Alert.alert(
      'Password update unavailable',
      'Changing your password from the app requires a backend endpoint. This screen validates your input only.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [confirmNewPassword, currentPassword, newPassword, router]);

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
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Save new password">
          <Text style={styles.saveLabel}>Save</Text>
          <MaterialIcons name="check" size={18} color={ForumColors.white} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle} accessibilityRole="header">
          Update password
        </Text>

        <Input
          label="Current password"
          placeholder="Enter current password"
          value={currentPassword}
          onChangeText={(t) => {
            setCurrentPassword(t);
            if (errors.currentPassword) setErrors((e) => ({ ...e, currentPassword: undefined }));
          }}
          secureTextEntry
          brandBorder
          error={errors.currentPassword}
          autoCapitalize="none"
          textContentType="password"
        />

        <View style={styles.newPasswordBlock}>
          <Input
            label="New password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={(t) => {
              setNewPassword(t);
              if (errors.newPassword) setErrors((e) => ({ ...e, newPassword: undefined }));
            }}
            secureTextEntry
            brandBorder
            error={errors.newPassword}
            autoCapitalize="none"
            textContentType="newPassword"
          />
          <Input
            label="Confirm new password"
            placeholder="Re-enter new password"
            value={confirmNewPassword}
            onChangeText={(t) => {
              setConfirmNewPassword(t);
              if (errors.confirmNewPassword) setErrors((e) => ({ ...e, confirmNewPassword: undefined }));
            }}
            secureTextEntry
            brandBorder
            error={errors.confirmNewPassword}
            autoCapitalize="none"
            textContentType="newPassword"
          />
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
  newPasswordBlock: {
    marginTop: 24,
  },
});
