import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, spacing } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'gradient';
  gradient?: string[];
  padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  gradient,
  padding = 4,
}) => {
  if (variant === 'gradient' && gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          styles.gradientCard,
          { padding: spacing[padding] },
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  elevated: {
    ...shadows.lg,
  },
  gradientCard: {
    borderRadius: borderRadius.xl,
  },
});

export default Card;
