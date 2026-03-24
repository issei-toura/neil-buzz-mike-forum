import { Ionicons } from '@expo/vector-icons';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/input';
import { ForumColors } from '@/constants/forum';
import type { SignUpFormValues } from '@/schemas/auth-forms';

const CRITERIA_MUTED = '#656565';
const CRITERIA_BG = '#E9E9E9';
const TERMS_MUTED = 'rgba(56, 57, 57, 0.4)';

type Props = {
  control: Control<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
};

export function SignUpSecurityStep({ control, errors }: Props) {
  return (
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
  );
}

const styles = StyleSheet.create({
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
});
