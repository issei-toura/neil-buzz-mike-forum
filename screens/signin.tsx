import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTopBar, authScreenPadding } from '@/components/auth-top-bar';
import { AppButton } from '@/components/button';
import { Input } from '@/components/input';
import { login } from '@/services/auth';
import { signInSchema, type SignInFormValues } from '@/schemas/auth-forms';
import { ForumColors, ForumLayout } from '@/constants/forum';
import { setAccessToken } from '@/utils/auth-storage';
import { ApiRequestError } from '@/utils/api-response';
import { getErrorMessage } from '@/utils/error-message';

const SIGN_IN_CREDENTIALS_ERROR =
  "Oops! Those details don't seem to match. Check the details you entered are correct and try again.";

/** When the API cannot be changed, treat common 4xx + known backend messages as one UX for bad login. */
const SIGN_IN_CREDENTIALS_HTTP_STATUSES = new Set([400, 401, 403, 404]);

function isLikelyLoginCredentialFailureFromMessage(message: string): boolean {
  const m = message.toLowerCase();
  return /\bdoes\s+not\s+exist\b/.test(m) || /\bnot\s+found\b/.test(m);
}

function signInBannerMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (SIGN_IN_CREDENTIALS_HTTP_STATUSES.has(error.status)) {
      return SIGN_IN_CREDENTIALS_ERROR;
    }
    if (isLikelyLoginCredentialFailureFromMessage(error.message)) {
      return SIGN_IN_CREDENTIALS_ERROR;
    }
  }
  return getErrorMessage(error);
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await setAccessToken(data.accessToken);
      router.replace('/(tabs)');
    },
  });

  const onSubmit = (values: SignInFormValues) => {
    loginMutation.reset();
    loginMutation.mutate(values);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.mainColumn}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}>
            <AuthTopBar onBack={() => router.back()} />

            <View style={styles.head}>
              <Text style={styles.title}>Log In</Text>
              <Text style={styles.subtitle}>Enter your details to log into your account.</Text>
            </View>

            <View style={styles.fields}>
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
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={ref}
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                  />
                )}
              />
              <Pressable onPress={() => {}} style={styles.forgotWrap}>
                <Text style={styles.forgot}>Forgot your password?</Text>
              </Pressable>
            </View>

            <AppButton
              title="Log In"
              trailingArrow
              onPress={() => handleSubmit(onSubmit)()}
              loading={loginMutation.isPending}
            />

            {loginMutation.isError ? (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <View style={styles.errorBannerRow}>
                  <MaterialIcons name="error-outline" size={32} color={ForumColors.error} />
                  <Text style={styles.errorBannerText}>{signInBannerMessage(loginMutation.error)}</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
            <Text style={styles.footerMuted}>Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push('/signup')}>
              <Text style={styles.footerLink}>Create one here.</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ForumColors.white,
  },
  flex: {
    flex: 1,
  },
  mainColumn: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: authScreenPadding,
    paddingBottom: 24,
    maxWidth: 390,
    alignSelf: 'center',
    width: '100%',
  },
  head: {
    marginBottom: ForumLayout.gapSections,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: ForumColors.charcoal,
    lineHeight: 22,
  },
  fields: {
    marginBottom: 8,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
  },
  forgot: {
    fontSize: 14,
    fontWeight: '400',
    color: ForumColors.purple,
  },
  errorBanner: {
    marginTop: ForumLayout.gapSections,
    maxWidth: ForumLayout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: ForumColors.errorBanner,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  errorBannerRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: ForumColors.charcoal,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: authScreenPadding,
    paddingTop: 16,
  },
  footerMuted: {
    fontSize: 14,
    color: ForumColors.purple,
    fontWeight: '400',
  },
  footerLink: {
    fontSize: 14,
    color: ForumColors.purple,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
