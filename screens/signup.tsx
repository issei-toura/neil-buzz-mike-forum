import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { useForm, type Control, type FieldErrors } from 'react-hook-form';
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
import { SignUpAddressStep } from '@/components/sign-up-steps/sign-up-address-step';
import { SignUpDetailsStep } from '@/components/sign-up-steps/sign-up-details-step';
import { SignUpProfileStep } from '@/components/sign-up-steps/sign-up-profile-step';
import { SignUpSecurityStep } from '@/components/sign-up-steps/sign-up-security-step';
import { ForumColors, ForumLayout } from '@/constants/forum';
import { SIGNUP_STEP_META, SIGN_UP_STEPS, type SignUpStep } from '@/constants/signup-wizard';
import { signUpSchema, signUpStepFields, type SignUpFormValues } from '@/schemas/auth-forms';
import { login, register } from '@/services/auth';
import type { UserCreateDto } from '@/types/auth';
import { setAccessToken, setCurrentUser } from '@/utils/auth-storage';
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

const lastSignupStep = SIGN_UP_STEPS[SIGN_UP_STEPS.length - 1];

function SignUpWizardStepContent({
  step,
  control,
  errors,
  profileUri,
  onPickImage,
}: {
  step: SignUpStep;
  control: Control<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
  profileUri: string | null;
  onPickImage: () => void;
}) {
  switch (step) {
    case 'DETAILS':
      return <SignUpDetailsStep control={control} errors={errors} />;
    case 'ADDRESS':
      return <SignUpAddressStep control={control} errors={errors} />;
    case 'SECURITY':
      return <SignUpSecurityStep control={control} errors={errors} />;
    case 'PROFILE':
      return <SignUpProfileStep profileUri={profileUri} onPickImage={onPickImage} />;
    default:
      return null;
  }
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<SignUpStep>('DETAILS');
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const meta = SIGNUP_STEP_META[step];
  const stepIndex = SIGN_UP_STEPS.indexOf(step);

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
      await setCurrentUser(data.user);
      router.replace('/(app)');
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
    const fields = signUpStepFields[stepIndex];
    if (!fields) return;
    const ok = await trigger(fields, { shouldFocus: true });
    if (ok && stepIndex < SIGN_UP_STEPS.length - 1) {
      setStep(SIGN_UP_STEPS[stepIndex + 1]);
    }
  };

  const goBackStep = () => {
    if (stepIndex > 0) {
      setStep(SIGN_UP_STEPS[stepIndex - 1]);
    } else {
      router.back();
    }
  };

  const onSubmit = (values: SignUpFormValues) => {
    registerMutation.reset();
    registerMutation.mutate(values);
  };

  const showNavRow = step !== lastSignupStep;

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
              {SIGN_UP_STEPS.map((stepId, index) => (
                <View
                  key={stepId}
                  style={[
                    styles.progressSeg,
                    index <= stepIndex ? styles.progressSegActive : styles.progressSegIdle,
                  ]}
                />
              ))}
            </View>

            <View style={styles.head}>
              <Text style={styles.title}>{meta.title}</Text>
              <Text style={styles.subtitle}>{meta.subtitle}</Text>
            </View>

            <SignUpWizardStepContent
              step={step}
              control={control}
              errors={errors}
              profileUri={profileUri}
              onPickImage={pickProfileImage}
            />

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

            {step === 'PROFILE' ? (
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
