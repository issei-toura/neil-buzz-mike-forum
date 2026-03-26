import { useCallback, useEffect, useState } from 'react';
import {
  type FieldErrors,
  type UseFormClearErrors,
  type UseFormGetValues,
  type UseFormSetValue,
} from 'react-hook-form';

import { AddressInput } from '@/components/address-input';
import type { SignUpFormValues } from '@/schemas/auth-forms';
import type { GoogleResolvedAddress } from '@/types/google-place';

type Props = {
  errors: FieldErrors<SignUpFormValues>;
  setValue: UseFormSetValue<SignUpFormValues>;
  getValues: UseFormGetValues<SignUpFormValues>;
  clearErrors: UseFormClearErrors<SignUpFormValues>;
};

export function SignUpAddressStep({ errors, setValue, getValues, clearErrors }: Props) {
  const [addressSearch, setAddressSearch] = useState('');

  useEffect(() => {
    const v = getValues();
    const parts = [v.number, v.street, v.city, v.state, v.postalCode, v.country].filter(
      (p) => typeof p === 'string' && p.trim().length > 0
    );
    if (parts.length > 0) {
      setAddressSearch(parts.join(', '));
    }
    // Intentionally once per mount when returning to this wizard step.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getValues reads current form snapshot on open
  }, []);

  const onResolvedAddressChange = useCallback(
    (addr: GoogleResolvedAddress | null) => {
      if (!addr) {
        setValue('street', '', { shouldValidate: true, shouldDirty: true });
        setValue('number', '', { shouldValidate: true, shouldDirty: true });
        setValue('city', '', { shouldValidate: true, shouldDirty: true });
        setValue('state', '', { shouldValidate: true, shouldDirty: true });
        setValue('postalCode', '', { shouldValidate: true, shouldDirty: true });
        setValue('country', '', { shouldValidate: true, shouldDirty: true });
        setValue('googlePlaceId', '', { shouldValidate: false, shouldDirty: true });
        setValue('fullAddressLine', '', { shouldValidate: false, shouldDirty: true });
        setValue('addressLat', undefined, { shouldValidate: false, shouldDirty: true });
        setValue('addressLng', undefined, { shouldValidate: false, shouldDirty: true });
        clearErrors('googlePlaceId');
        return;
      }
      clearErrors('googlePlaceId');
      setValue('street', addr.street, { shouldValidate: true, shouldDirty: true });
      setValue('number', addr.number, { shouldValidate: true, shouldDirty: true });
      setValue('city', addr.city, { shouldValidate: true, shouldDirty: true });
      setValue('state', addr.state, { shouldValidate: true, shouldDirty: true });
      setValue('postalCode', addr.postalCode, { shouldValidate: true, shouldDirty: true });
      setValue('country', addr.country, { shouldValidate: true, shouldDirty: true });
      setValue('googlePlaceId', addr.googlePlaceId, { shouldValidate: false, shouldDirty: true });
      setValue('fullAddressLine', addr.fullAddress, { shouldValidate: false, shouldDirty: true });
      setValue('addressLat', addr.lat, { shouldValidate: false, shouldDirty: true });
      setValue('addressLng', addr.lng, { shouldValidate: false, shouldDirty: true });
    },
    [clearErrors, setValue]
  );

  return (
    <AddressInput
      label="Enter your address"
      placeholder="Start typing…"
      value={addressSearch}
      onChangeText={setAddressSearch}
      onResolvedAddressChange={onResolvedAddressChange}
      brandBorder
      variant="signup"
      error={errors.googlePlaceId?.message}
    />
  );
}
