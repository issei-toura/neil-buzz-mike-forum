import { Controller, type Control, type FieldErrors } from 'react-hook-form';

import { Input } from '@/components/input';
import type { SignUpFormValues } from '@/schemas/auth-forms';

type Props = {
  control: Control<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
};

export function SignUpAddressStep({ control, errors }: Props) {
  return (
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
  );
}
