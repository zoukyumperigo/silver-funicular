import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, typography, spacing } from '../../utils/theme';
import { formatNumber } from '../../utils/gamification';

interface XPBarProps {
  currentXp: number;
  xpToNext: number;
  level: number;
  showLevel?: boolean;
  showNumbers?: boolean;
  height?: number;
  compact?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXp,
  xpToNext,
  level,
  showLevel = true,
  showNumbers = true,
  height = 12,
  compact = false,
}) => {
  const progress = (currentXp / xpToNext) * 100;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.barBackground, { height }]}>
          <LinearGradient
            colors={colors.gradients.ocean}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${progress}%`, height }]}
          />
        </View>
        {showNumbers && (
          <Text style={styles.compactText}>
            {formatNumber(currentXp)}/{formatNumber(xpToNext)}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLevel && (
        <View style={styles.levelContainer}>
          <LinearGradient
            colors={colors.gradients.gold}
            style={styles.levelBadge}
          >
            <Text style={styles.levelText}>{level}</Text>
          </LinearGradient>
        </View>
      )}
      <View style={styles.barContainer}>
        <View style={[styles.barBackground, { height }]}>
          <LinearGradient
            colors={colors.gradients.ocean}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${Math.min(progress, 100)}%`, height }]}
          />
          {/* Shimmer effect */}
          <View style={[styles.shimmer, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
        {showNumbers && (
          <View style={styles.numbersContainer}>
            <Text style={styles.xpText}>
              {formatNumber(currentXp)} / {formatNumber(xpToNext)} XP
            </Text>
            <Text style={styles.percentText}>{Math.floor(progress)}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  compactContainer: {
    gap: spacing[1],
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
    shadowColor: colors.secondary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  levelText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  barContainer: {
    flex: 1,
  },
  barBackground: {
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: borderRadius.full,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
  xpText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  percentText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: '600',
  },
  compactText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});

export default XPBar;
