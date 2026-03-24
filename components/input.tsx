import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';

export type InputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'secureTextEntry'> & {
  /** Omit or pass empty string to hide the label row (e.g. grouped fields under one title). */
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  /** When true, input is obscured and an eye toggle is shown. */
  secureTextEntry?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label = '',
    placeholder,
    value,
    onChangeText,
    onBlur,
    error,
    secureTextEntry = false,
    editable = true,
    ...textInputProps
  },
  ref
) {
  const [showSecret, setShowSecret] = useState(false);
  const isPassword = secureTextEntry;
  const borderColor = error ? ForumColors.error : ForumColors.border;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.fieldShell, { borderColor }]}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={ForumColors.muted}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          editable={editable}
          secureTextEntry={isPassword && !showSecret}
          autoCapitalize={textInputProps.autoCapitalize ?? (isPassword ? 'none' : undefined)}
          {...textInputProps}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showSecret ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setShowSecret((v) => !v)}
            style={styles.toggle}>
            <Ionicons
              name={showSecret ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={ForumColors.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 8,
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
  toggle: {
    padding: 4,
    marginLeft: 4,
    opacity: 0.9,
  },
  error: {
    color: ForumColors.error,
    fontSize: 12,
    marginTop: 6,
  },
});
