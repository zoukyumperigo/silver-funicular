import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography } from '../../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  gradient,
}) => {
  const buttonStyles = getButtonStyles(variant, size, disabled);
  const textStyles = getTextStyles(variant, size, disabled);

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.neutral.white : colors.primary[500]}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, textStyles, textStyle]}>{title}</Text>
        </>
      )}
    </>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={gradient || colors.gradients.ocean}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, buttonStyles]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.button, buttonStyles, style]}
    >
      {content}
    </TouchableOpacity>
  );
};

const getButtonStyles = (
  variant: string,
  size: string,
  disabled: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  };

  // Size styles
  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[3], borderRadius: borderRadius.md },
    md: { paddingVertical: spacing[3], paddingHorizontal: spacing[4], borderRadius: borderRadius.lg },
    lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[6], borderRadius: borderRadius.xl },
  };

  // Variant styles
  const variantStyles: Record<string, ViewStyle> = {
    primary: {},
    secondary: { backgroundColor: colors.secondary[500] },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary[500],
    },
    ghost: { backgroundColor: 'transparent' },
  };

  const disabledStyle: ViewStyle = disabled
    ? { opacity: 0.5, backgroundColor: colors.neutral[300] }
    : {};

  return { ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...disabledStyle };
};

const getTextStyles = (
  variant: string,
  size: string,
  disabled: boolean
): TextStyle => {
  const sizeStyles: Record<string, TextStyle> = {
    sm: { fontSize: typography.fontSize.sm },
    md: { fontSize: typography.fontSize.base },
    lg: { fontSize: typography.fontSize.lg },
  };

  const variantStyles: Record<string, TextStyle> = {
    primary: { color: colors.neutral.white },
    secondary: { color: colors.neutral.white },
    outline: { color: colors.primary[500] },
    ghost: { color: colors.primary[500] },
  };

  return { ...sizeStyles[size], ...variantStyles[variant] };
};

const styles = StyleSheet.create({
  button: {
    minWidth: 100,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;
