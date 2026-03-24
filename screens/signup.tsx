import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
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
import { ForumColors, ForumLayout } from '@/constants/forum';
import { login, register } from '@/services/auth';
import {
  SIGNUP_TOTAL_STEPS,
  signUpSchema,
  signUpStepFields,
  type SignUpFormValues,
} from '@/schemas/auth-forms';
import type { UserCreateDto } from '@/types/auth';
import { setAccessToken } from '@/utils/auth-storage';
import { getErrorMessage } from '@/utils/error-message';

function toUserCreateDto(values: SignUpFormValues): UserCreateDto {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    telephone: values.telephone,
    address: {
      street: values.street,
      number: values.number,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
    },
    password: values.password,
    confirmPassword: values.confirmPassword,
  };
}

const SIGNUP_STEP_COPY: { title: string; subtitle: string }[] = [
  {
    title: 'Create your Account',
    subtitle: 'Enter your details below to start creating your brand new account.',
  },
  {
    title: 'Where are you Located?',
    subtitle: 'Add your mailing address as it will be stored on your account.',
  },
  {
    title: "Let's Secure your Account",
    subtitle: "Let's keep your NBM account safe with a secure password.",
  },
  {
    title: 'Upload a Profile Picture',
    subtitle:
      "Let's put a name to a face. Upload a profile picture to complete your profile. This is an optional step.",
  },
];

const CRITERIA_MUTED = '#656565';
const CRITERIA_BG = '#E9E9E9';
const TERMS_MUTED = 'rgba(56, 57, 57, 0.4)';

const lastWizardStep = SIGNUP_TOTAL_STEPS - 1;

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const meta = SIGNUP_STEP_COPY[step] ?? SIGNUP_STEP_COPY[0];

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      telephone: '',
      street: '',
      number: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      acceptedTerms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: SignUpFormValues) => {
      await register(toUserCreateDto(values));
      return login({ email: values.email, password: values.password });
    },
    onSuccess: async (data) => {
      await setAccessToken(data.accessToken);
      router.replace('/(tabs)');
    },
  });

  const pickProfileImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setProfileUri(result.assets[0].uri);
    }
  }, []);

  const goNext = async () => {
    const fields = signUpStepFields[step];
    if (!fields) return;
    const ok = await trigger(fields, { shouldFocus: true });
    if (ok && step < lastWizardStep) setStep((s) => s + 1);
  };

  const goBackStep = () => {
    if (step > 0) setStep((s) => s - 1);
    else router.back();
  };

  const onSubmit = (values: SignUpFormValues) => {
    registerMutation.reset();
    registerMutation.mutate(values);
  };

  const showNavRow = step < lastWizardStep;

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
            <AuthTopBar onBack={goBackStep} />

            <View style={styles.progressRow}>
              {Array.from({ length: SIGNUP_TOTAL_STEPS }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressSeg,
                    index <= step ? styles.progressSegActive : styles.progressSegIdle,
                  ]}
                />
              ))}
            </View>

            <View style={styles.head}>
              <Text style={styles.title}>{meta.title}</Text>
              <Text style={styles.subtitle}>{meta.subtitle}</Text>
            </View>

            {step === 0 ? (
              <>
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
                        placeholder="Enter your last name here"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.lastName?.message}
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
                      keyboardType="email-address"
                      autoComplete="email"
                      autoCapitalize="none"
                    />
                  )}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Controller
                  control={control}
                  name="street"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Enter your address"
                      placeholder="Start typing..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.street?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="number"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Street number"
                      placeholder="Number"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.number?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="City"
                      placeholder="City"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.city?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="State"
                      placeholder="State"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.state?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="postalCode"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Postal code"
                      placeholder="Postal code"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.postalCode?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="country"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Country"
                      placeholder="Country"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.country?.message}
                      autoComplete="country"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="telephone"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Phone"
                      placeholder="Phone number"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.telephone?.message}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
                  )}
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Create a Password"
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      secureTextEntry
                      autoComplete="new-password"
                      textContentType="newPassword"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                      secureTextEntry
                      autoComplete="new-password"
                      textContentType="newPassword"
                    />
                  )}
                />
                <View style={styles.criteriaBox}>
                  <Text style={styles.criteriaTitle}>Your password must...</Text>
                  <View style={styles.criteriaRow}>
                    <Text style={styles.criteriaIcon}>0</Text>
                    <Text style={styles.criteriaLine}>Include at least one number (eg. 1)</Text>
                  </View>
                  <View style={styles.criteriaRow}>
                    <Text style={styles.criteriaIcon}>#</Text>
                    <Text style={styles.criteriaLine}>Include at least one symbol (eg. #)</Text>
                  </View>
                  <View style={styles.criteriaRow}>
                    <Text style={styles.criteriaIcon}>Tt</Text>
                    <Text style={[styles.criteriaLine, styles.criteriaLineFlex]}>
                      Include at least one upper and lowercase character
                    </Text>
                  </View>
                </View>
                <Controller
                  control={control}
                  name="acceptedTerms"
                  render={({ field: { value, onChange } }) => (
                    <Pressable
                      style={styles.termsRow}
                      onPress={() => onChange(!value)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: value }}>
                      <View style={[styles.checkbox, value && styles.checkboxOn]}>
                        {value ? (
                          <Ionicons name="checkmark" size={14} color={ForumColors.white} />
                        ) : null}
                      </View>
                      <Text style={[styles.termsText, value && styles.termsTextChecked]}>
                        By ticking this box, I agree to the terms and conditions of NBM.
                      </Text>
                    </Pressable>
                  )}
                />
                {errors.acceptedTerms ? (
                  <Text style={styles.termsError}>{errors.acceptedTerms.message}</Text>
                ) : null}
              </>
            ) : null}

            {step === 3 ? (
              <>
                {!profileUri ? (
                  <Pressable
                    style={styles.uploadZone}
                    onPress={pickProfileImage}
                    accessibilityRole="button"
                    accessibilityLabel="Select profile picture">
                    <Ionicons name="cloud-upload-outline" size={24} color={ForumColors.charcoal} />
                    <View style={styles.uploadCopy}>
                      <Text style={styles.uploadTitle}>Select a file</Text>
                      <Text style={styles.uploadHint}>JPG or PNG, file size no more than 10MB</Text>
                    </View>
                  </Pressable>
                ) : (
                  <View style={styles.profilePreview}>
                    <Image
                      source={{ uri: profileUri }}
                      style={styles.profileImage}
                      contentFit="cover"
                    />
                    <View style={styles.editLinkColumn}>
                      <Pressable onPress={pickProfileImage} accessibilityRole="button">
                        <Text style={styles.editPictureLink}>Edit profile picture</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </>
            ) : null}

            {registerMutation.isError ? (
              <Text style={styles.mutationError}>{getErrorMessage(registerMutation.error)}</Text>
            ) : null}

            {showNavRow ? (
              <View style={styles.nextOnlyRow}>
                <AppButton
                  title="Next"
                  trailingArrow
                  onPress={goNext}
                  style={styles.nextFullWidth}
                />
              </View>
            ) : null}

            {step === 3 ? (
              <View style={styles.profileActions}>
                <AppButton
                  title="Create my Account"
                  trailingArrow
                  onPress={() => handleSubmit(onSubmit)()}
                  loading={registerMutation.isPending}
                  style={styles.nextFullWidth}
                />
                <Pressable
                  onPress={() => handleSubmit(onSubmit)()}
                  disabled={registerMutation.isPending}
                  accessibilityRole="button"
                  style={styles.skipLinkWrap}>
                  <Text style={styles.skipLink}>Skip for now</Text>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
            <Text style={styles.footerMuted}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/signin')}>
              <Text style={styles.footerLink}>Log in here.</Text>
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
  progressRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: ForumLayout.progressSegmentGap,
  },
  progressSeg: {
    flex: 1,
    height: ForumLayout.progressSegmentHeight,
    borderRadius: 4,
  },
  progressSegActive: {
    backgroundColor: ForumColors.purple,
  },
  progressSegIdle: {
    backgroundColor: ForumColors.border,
  },
  head: {
    marginBottom: 24,
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
  nameBlock: {
    marginBottom: 8,
    gap: 8,
  },
  groupLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  criteriaBox: {
    backgroundColor: CRITERIA_BG,
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 8,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: CRITERIA_MUTED,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criteriaIcon: {
    width: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: ForumColors.purple,
  },
  criteriaLine: {
    fontSize: 14,
    fontWeight: '400',
    color: CRITERIA_MUTED,
  },
  criteriaLineFlex: {
    flex: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(56, 57, 57, 0.2)',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: ForumColors.purple,
    borderColor: ForumColors.purple,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: TERMS_MUTED,
    lineHeight: 20,
  },
  termsTextChecked: {
    color: ForumColors.charcoal,
  },
  termsError: {
    color: ForumColors.error,
    fontSize: 12,
    marginBottom: 8,
  },
  uploadZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    minHeight: 106,
    paddingVertical: 32,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: ForumColors.charcoal,
    marginBottom: 8,
  },
  uploadCopy: {
    flex: 1,
    gap: 4,
    opacity: 0.7,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  uploadHint: {
    fontSize: 16,
    fontWeight: '400',
    color: ForumColors.charcoal,
  },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    marginBottom: 16,
  },
  profileImage: {
    width: 183,
    height: 183,
    borderRadius: 999,
    backgroundColor: CRITERIA_BG,
  },
  editLinkColumn: {
    flex: 1,
    minHeight: 183,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPictureLink: {
    fontSize: 14,
    fontWeight: '500',
    color: ForumColors.purple,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  profileActions: {
    gap: 16,
    marginTop: 8,
    width: '100%',
    alignItems: 'stretch',
  },
  skipLinkWrap: {
    alignSelf: 'center',
  },
  skipLink: {
    fontSize: 16,
    fontWeight: '400',
    color: ForumColors.charcoal,
    textDecorationLine: 'underline',
  },
  mutationError: {
    color: ForumColors.error,
    marginBottom: 12,
    fontSize: 14,
  },
  nextOnlyRow: {
    marginTop: 8,
    width: '100%',
  },
  nextFullWidth: {
    width: '100%',
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
