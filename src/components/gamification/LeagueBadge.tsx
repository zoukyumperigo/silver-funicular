import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { LeagueTier } from '../../types';
import { colors, borderRadius, typography, spacing, getLeagueStyle } from '../../utils/theme';

interface LeagueBadgeProps {
  league: LeagueTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  points?: number;
}

export const LeagueBadge: React.FC<LeagueBadgeProps> = ({
  league,
  size = 'md',
  showLabel = true,
  points,
}) => {
  const { t } = useTranslation();
  const leagueStyle = getLeagueStyle(league);

  const sizes = {
    sm: { badge: 32, icon: 16, fontSize: typography.fontSize.xs },
    md: { badge: 48, icon: 24, fontSize: typography.fontSize.sm },
    lg: { badge: 64, icon: 32, fontSize: typography.fontSize.base },
  };

  const currentSize = sizes[size];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={leagueStyle.gradient as [string, string]}
        style={[
          styles.badge,
          {
            width: currentSize.badge,
            height: currentSize.badge,
            borderRadius: currentSize.badge / 2,
          },
        ]}
      >
        <Text style={{ fontSize: currentSize.icon }}>{leagueStyle.icon}</Text>
      </LinearGradient>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.leagueText, { fontSize: currentSize.fontSize }]}>
            {t(`arena.leagueTiers.${league}`)}
          </Text>
          {points !== undefined && (
            <Text style={styles.pointsText}>{points} pts</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[2],
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  labelContainer: {
    alignItems: 'center',
  },
  leagueText: {
    fontWeight: '600',
    color: colors.neutral[700],
  },
  pointsText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
  },
});

export default LeagueBadge;
