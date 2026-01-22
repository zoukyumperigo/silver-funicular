import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Achievement } from '../../types';
import { colors, borderRadius, typography, spacing, getRarityStyle } from '../../utils/theme';
import { useSettingsStore } from '../../store';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  showProgress?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  onPress,
  showProgress = true,
}) => {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const rarityStyle = getRarityStyle(achievement.rarity);
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.progress / achievement.maxProgress;

  const sizes = {
    sm: { container: 60, icon: 24 },
    md: { container: 80, icon: 32 },
    lg: { container: 100, icon: 40 },
  };

  const currentSize = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      style={styles.wrapper}
    >
      <View
        style={[
          styles.container,
          {
            width: currentSize.container,
            height: currentSize.container,
            borderColor: isUnlocked ? rarityStyle.borderColor : colors.neutral[300],
            backgroundColor: isUnlocked
              ? rarityStyle.backgroundColor
              : colors.neutral[100],
          },
        ]}
      >
        {isUnlocked ? (
          <LinearGradient
            colors={rarityStyle.gradient as [string, string]}
            style={styles.gradient}
          >
            <Text style={{ fontSize: currentSize.icon }}>{achievement.icon}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.lockedContainer}>
            <Text style={[styles.lockedIcon, { fontSize: currentSize.icon }]}>🔒</Text>
          </View>
        )}

        {/* Progress ring for locked achievements */}
        {!isUnlocked && showProgress && progress > 0 && (
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressArc,
                {
                  backgroundColor: rarityStyle.borderColor,
                  transform: [{ rotate: `${progress * 360}deg` }],
                },
              ]}
            />
          </View>
        )}
      </View>

      <Text
        style={[
          styles.name,
          !isUnlocked && styles.lockedName,
        ]}
        numberOfLines={2}
      >
        {achievement.name[language]}
      </Text>

      {showProgress && !isUnlocked && (
        <Text style={styles.progressText}>
          {achievement.progress}/{achievement.maxProgress}
        </Text>
      )}

      {isUnlocked && (
        <View style={[styles.rarityTag, { backgroundColor: rarityStyle.borderColor }]}>
          <Text style={styles.rarityText}>
            {t(`rarity.${achievement.rarity}`)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 90,
  },
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  progressRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  progressArc: {
    position: 'absolute',
    width: 4,
    height: '50%',
    top: 0,
    left: '50%',
    marginLeft: -2,
    transformOrigin: 'bottom',
  },
  name: {
    marginTop: spacing[2],
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.neutral[700],
    textAlign: 'center',
  },
  lockedName: {
    color: colors.neutral[400],
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  rarityTag: {
    marginTop: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.neutral.white,
    textTransform: 'uppercase',
  },
});

export default AchievementBadge;
