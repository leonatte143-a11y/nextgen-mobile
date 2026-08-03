import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import { logAction } from '../lib/devLog';

type Props = {
  title: string;
  onPress: () => void;
  /** Dev-only: logs [ACTION] when pressed */
  debugAction?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'inverse';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  title,
  onPress,
  debugAction,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  const handlePress = () => {
    if (debugAction) logAction(debugAction, { button: title });
    onPress();
  };
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isInverse = variant === 'inverse';
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDanger && styles.danger,
        isInverse && styles.inverse,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.background : '#FFFFFF'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.textOnPrimary,
            variant === 'outline' && styles.textOutline,
            variant === 'ghost' && styles.textGhost,
            isDanger && styles.textOnDanger,
            isInverse && styles.textInverse,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: { backgroundColor: colors.primary },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  inverse: { backgroundColor: colors.white },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.88 },
  text: { fontSize: 16, fontWeight: '700' },
  textOnPrimary: { color: colors.background },
  textOnDanger: { color: '#FFFFFF' },
  textOutline: { color: colors.primary },
  textGhost: { color: colors.charcoal },
  textInverse: { color: colors.primary },
});
