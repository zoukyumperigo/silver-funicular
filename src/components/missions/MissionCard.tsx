import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Mission } from '../../types';
import { colors, borderRadius, typography, spacing, shadows } from '../../utils/theme';
import { useSettingsStore } from '../../store';
import { formatTimeRemaining } from '../../utils/gamification';

interface MissionCardProps {
  mission: Mission;
  onPress?: () => void;
  onClaim?: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onPress,
  onClaim,
}) => {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);

  const totalProgress = mission.objectives.reduce(
    (sum, obj) => sum + (obj.isCompleted ? 1 : 0),
    0
  );
  const progressPercentage = (totalProgress / mission.objectives.length) * 100;

  const getMissionTypeColor = () => {
    switch (mission.type) {
      case 'daily_challenge':
        return colors.gradients.ocean;
      case 'weekly_quest':
        return colors.gradients.epic;
      case 'special_event':
        return colors.gradients.legendary;
      default:
        return colors.gradients.ocean;
    }
  };

  const getMissionTypeIcon = () => {
    switch (mission.type) {
      case 'daily_challenge':
        return 'sunny';
      case 'weekly_quest':
        return 'calendar';
      case 'special_event':
        return 'star';
      default:
        return 'flag';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.container}
    >
      <LinearGradient
        colors={getMissionTypeColor() as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Ionicons
              name={getMissionTypeIcon() as any}
              size={16}
              color={colors.neutral.white}
            />
            <Text style={styles.typeText}>
              {t(`missions.missionTypes.${mission.type}`)}
            </Text>
          </View>
          {mission.timeLimit && !mission.isCompleted && (
            <View style={styles.timerContainer}>
              <Ionicons name="time" size={14} color={colors.neutral.white} />
              <Text style={styles.timerText}>
                {formatTimeRemaining(
                  new Date(Date.now() + mission.timeLimit),
                  language
                )}
              </Text>
            </View>
          )}
          {mission.isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
              <Text style={styles.completedText}>{t('missions.completed')}</Text>
            </View>
          )}
        </View>

        {/* Mission Info */}
        <View style={styles.content}>
          <Text style={styles.name}>{mission.name[language]}</Text>
          <Text style={styles.description}>{mission.description[language]}</Text>
        </View>

        {/* Objectives */}
        <View style={styles.objectivesContainer}>
          {mission.objectives.map((objective, index) => (
            <View key={objective.id} style={styles.objectiveRow}>
              <View
                style={[
                  styles.objectiveCheck,
                  objective.isCompleted && styles.objectiveCheckCompleted,
                ]}
              >
                {objective.isCompleted && (
                  <Ionicons name="checkmark" size={12} color={colors.neutral.white} />
                )}
              </View>
              <Text
                style={[
                  styles.objectiveText,
                  objective.isCompleted && styles.objectiveTextCompleted,
                ]}
              >
                {objective.description[language]}
              </Text>
              {!objective.isCompleted && typeof objective.target === 'number' && (
                <Text style={styles.objectiveProgress}>
                  {objective.current}/{objective.target}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {totalProgress}/{mission.objectives.length}
          </Text>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsLabel}>{t('missions.rewards')}:</Text>
          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>⭐</Text>
              <Text style={styles.rewardValue}>
                {mission.baseXpReward + mission.bonusXpReward} XP
              </Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🪙</Text>
              <Text style={styles.rewardValue}>
                {mission.seaCoinReward} SeaCoins
              </Text>
            </View>
          </View>
        </View>

        {/* Claim Button */}
        {mission.isCompleted && onClaim && (
          <TouchableOpacity onPress={onClaim} style={styles.claimButton}>
            <Text style={styles.claimButtonText}>{t('missions.claim')}</Text>
            <Ionicons name="gift" size={18} color={colors.primary[700]} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[4],
    ...shadows.lg,
  },
  gradient: {
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  typeText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  timerText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  completedText: {
    color: colors.status.success,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  content: {
    marginBottom: spacing[4],
  },
  name: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing[1],
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.sm,
  },
  objectivesContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  objectiveCheck: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectiveCheckCompleted: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  objectiveText: {
    flex: 1,
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
  },
  objectiveTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  objectiveProgress: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.full,
  },
  progressText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  rewardsContainer: {
    marginBottom: spacing[3],
  },
  rewardsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.xs,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  rewardIcon: {
    fontSize: 16,
  },
  rewardValue: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: colors.neutral.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  claimButtonText: {
    color: colors.primary[700],
    fontSize: typography.fontSize.base,
    fontWeight: '700',
  },
});

export default MissionCard;
