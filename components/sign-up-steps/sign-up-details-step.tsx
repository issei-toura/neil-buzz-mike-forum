import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/input';
import { ForumColors } from '@/constants/forum';
import type { SignUpFormValues } from '@/schemas/auth-forms';

type Props = {
  control: Control<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
};

export function SignUpDetailsStep({ control, errors }: Props) {
  return (
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
  );
}

const styles = StyleSheet.create({
  nameBlock: {
    marginBottom: 8,
    gap: 8,
  },
  groupLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
});
