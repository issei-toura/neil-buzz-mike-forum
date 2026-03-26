import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';
import { fetchPlaceDetails, fetchPlaceSuggestions, type PlaceSuggestion } from '@/lib/google-places';
import type { GoogleResolvedAddress } from '@/types/google-place';

const DEBOUNCE_MS = 350;

export type AddressInputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Called when the user picks a suggestion (full Place object) or when the text no longer matches a prior selection. */
  onResolvedAddressChange?: (address: GoogleResolvedAddress | null) => void;
  error?: string;
  brandBorder?: boolean;
  languageCode?: string;
  /** Signup Figma: purple field, suggestion rows with trailing chevron and looser list chrome. */
  variant?: 'default' | 'signup';
};

export function AddressInput({
  label = '',
  placeholder = 'Start typing an address…',
  value,
  onChangeText,
  onResolvedAddressChange,
  error,
  brandBorder = false,
  languageCode = 'en',
  variant = 'default',
}: AddressInputProps) {
  const isSignup = variant === 'signup';
  const borderColor = error
    ? ForumColors.error
    : brandBorder || isSignup
      ? ForumColors.purple
      : ForumColors.border;

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingPick, setLoadingPick] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const lastResolvedRef = useRef<GoogleResolvedAddress | null>(null);
  const blurClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortSuggestionsRef = useRef<AbortController | null>(null);
  const abortPickRef = useRef<AbortController | null>(null);

  const hasApiKey = useMemo(
    () => Boolean(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()),
    []
  );

  const clearBlurTimer = useCallback(() => {
    if (blurClearTimerRef.current) {
      clearTimeout(blurClearTimerRef.current);
      blurClearTimerRef.current = null;
    }
  }, []);

  const invalidateResolutionIfNeeded = useCallback(
    (nextText: string) => {
      const resolved = lastResolvedRef.current;
      if (!resolved) return;
      if (nextText.trim() !== resolved.fullAddress.trim()) {
        lastResolvedRef.current = null;
        onResolvedAddressChange?.(null);
      }
    },
    [onResolvedAddressChange]
  );

  const onChangeTextWrapped = useCallback(
    (text: string) => {
      onChangeText(text);
      invalidateResolutionIfNeeded(text);
    },
    [onChangeText, invalidateResolutionIfNeeded]
  );

  useEffect(() => {
    if (!hasApiKey) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const q = value.trim();

    if (q.length < 2) {
      setSuggestions([]);
      setListError(null);
      setLoadingList(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      abortSuggestionsRef.current?.abort();
      const ac = new AbortController();
      abortSuggestionsRef.current = ac;
      setLoadingList(true);
      setListError(null);

      fetchPlaceSuggestions(q, ac.signal, languageCode)
        .then((rows) => {
          setSuggestions(rows);
        })
        .catch((e: unknown) => {
          if ((e as Error)?.name === 'AbortError') return;
          setSuggestions([]);
          setListError('Could not load suggestions. Check API key and billing.');
        })
        .finally(() => {
          setLoadingList(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [value, hasApiKey, languageCode]);

  useEffect(() => {
    return () => {
      abortSuggestionsRef.current?.abort();
      abortPickRef.current?.abort();
      clearBlurTimer();
    };
  }, [clearBlurTimer]);

  const onPickSuggestion = useCallback(
    async (item: PlaceSuggestion) => {
      clearBlurTimer();
      setSuggestions([]);
      abortPickRef.current?.abort();
      const ac = new AbortController();
      abortPickRef.current = ac;
      setLoadingPick(true);
      setListError(null);
      try {
        const resolved = await fetchPlaceDetails(item.placeId, ac.signal);
        if (!resolved) return;
        lastResolvedRef.current = resolved;
        onChangeText(resolved.fullAddress);
        onResolvedAddressChange?.(resolved);
      } catch (e: unknown) {
        if ((e as Error)?.name === 'AbortError') return;
        setListError('Could not load place details.');
      } finally {
        setLoadingPick(false);
      }
    },
    [clearBlurTimer, onChangeText, onResolvedAddressChange]
  );

  const onBlurInput = useCallback(() => {
    blurClearTimerRef.current = setTimeout(() => setSuggestions([]), 200);
  }, []);

  const onFocusInput = useCallback(() => {
    clearBlurTimer();
  }, [clearBlurTimer]);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.fieldShell, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={ForumColors.muted}
          value={value}
          onChangeText={onChangeTextWrapped}
          onBlur={onBlurInput}
          onFocus={onFocusInput}
          autoCorrect={false}
          autoCapitalize="sentences"
          accessibilityLabel={label || 'Address search'}
        />
        {(loadingList || loadingPick) ? (
          <ActivityIndicator size="small" color={ForumColors.purple} style={styles.spinner} />
        ) : null}
      </View>
      {!hasApiKey ? (
        <Text style={styles.hint}>Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to use address search.</Text>
      ) : null}
      {suggestions.length > 0 ? (
        <View style={isSignup ? styles.dropdownSignup : styles.dropdown}>
          {suggestions.map((s, index) => (
            <Pressable
              key={s.placeId}
              accessibilityRole="button"
              accessibilityLabel={s.description}
              onPress={() => onPickSuggestion(s)}
              style={({ pressed }) => [
                isSignup ? styles.suggestionRowSignup : styles.suggestionRow,
                pressed && (isSignup ? styles.suggestionRowSignupPressed : styles.suggestionRowPressed),
                isSignup && index > 0 && styles.suggestionRowSignupBorderTop,
              ]}>
              <Text
                style={isSignup ? styles.suggestionTextSignup : styles.suggestionText}
                numberOfLines={2}>
                {s.description}
              </Text>
              {isSignup ? (
                <MaterialIcons name="chevron-right" size={18} color={ForumColors.charcoal} />
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
      {listError ? <Text style={styles.listError}>{listError}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 8,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: ForumColors.charcoal,
    marginBottom: 8,
  },
  fieldShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: ForumColors.white,
    paddingHorizontal: ForumLayout.inputPaddingHorizontal,
    paddingVertical: ForumLayout.inputPaddingVertical,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: ForumColors.charcoal,
    paddingVertical: 0,
  },
  spinner: {
    marginLeft: 8,
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: ForumColors.border,
    borderRadius: 4,
    backgroundColor: ForumColors.white,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  suggestionRow: {
    paddingHorizontal: ForumLayout.inputPaddingHorizontal,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ForumColors.border,
  },
  dropdownSignup: {
    marginTop: 0,
    overflow: 'hidden',
  },
  suggestionRowSignup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: ForumColors.white,
  },
  suggestionRowSignupBorderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ForumColors.border,
  },
  suggestionRowSignupPressed: {
    backgroundColor: ForumColors.settingsRow,
  },
  suggestionRowPressed: {
    backgroundColor: ForumColors.settingsRow,
  },
  suggestionText: {
    fontSize: 15,
    color: ForumColors.charcoal,
  },
  suggestionTextSignup: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: ForumColors.charcoal,
    paddingRight: 8,
  },
  hint: {
    fontSize: 12,
    color: ForumColors.muted,
    marginTop: 6,
  },
  listError: {
    color: ForumColors.error,
    fontSize: 12,
    marginTop: 6,
  },
  error: {
    color: ForumColors.error,
    fontSize: 12,
    marginTop: 6,
  },
});
