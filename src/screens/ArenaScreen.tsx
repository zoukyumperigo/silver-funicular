import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useArenaStore, usePlayerStatsStore, useSettingsStore } from '../store';
import { Card, LeagueBadge } from '../components';
import { colors, spacing, typography, borderRadius, shadows, getLeagueStyle } from '../utils/theme';
import { LeaderboardEntry, LeagueTier } from '../types';
import { formatTimeRemaining, LEAGUE_THRESHOLDS, getPointsToNextLeague } from '../utils/gamification';

type TabType = 'leaderboard' | 'leagues' | 'battles';

export const ArenaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const leaderboard = useArenaStore((state) => state.leaderboard);
  const currentBattle = useArenaStore((state) => state.currentBattle);
  const fetchLeaderboard = useArenaStore((state) => state.fetchLeaderboard);
  const fetchCurrentBattle = useArenaStore((state) => state.fetchCurrentBattle);
  const stats = usePlayerStatsStore((state) => state.stats);

  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  useEffect(() => {
    fetchLeaderboard();
    fetchCurrentBattle();
  }, []);

  const leagues: LeagueTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const currentLeagueIndex = leagues.indexOf(stats?.league || 'bronze');
  const pointsToNext = getPointsToNextLeague(
    stats?.leaguePoints || 0,
    stats?.league || 'bronze'
  );

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.restaurantId === 'rest_001';
    const leagueStyle = getLeagueStyle(item.league);

    return (
      <View
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.leaderboardItemHighlight,
          index < 3 && styles.leaderboardTopItem,
        ]}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {index < 3 ? (
            <LinearGradient
              colors={
                index === 0
                  ? colors.gradients.gold
                  : index === 1
                  ? ['#C0C0C0', '#A0A0A0']
                  : ['#CD7F32', '#8B4513']
              }
              style={styles.rankBadge}
            >
              <Text style={styles.rankBadgeText}>{item.rank}</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>

        {/* Avatar & Name */}
        <View style={styles.playerInfo}>
          <View
            style={[
              styles.avatar,
              { borderColor: leagueStyle.color },
            ]}
          >
            <Text style={styles.avatarText}>🏪</Text>
          </View>
          <View style={styles.playerDetails}>
            <Text style={styles.playerName} numberOfLines={1}>
              {item.restaurantName}
            </Text>
            <View style={styles.leagueTag}>
              <Text style={{ fontSize: 10 }}>{leagueStyle.icon}</Text>
              <Text style={[styles.leagueTagText, { color: leagueStyle.color }]}>
                {t(`arena.leagueTiers.${item.league}`)}
              </Text>
            </View>
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{item.score.toLocaleString()}</Text>
          <View style={styles.changeContainer}>
            {item.change !== 0 && (
              <>
                <Ionicons
                  name={item.change > 0 ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color={item.change > 0 ? colors.status.success : colors.status.error}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: item.change > 0 ? colors.status.success : colors.status.error },
                  ]}
                >
                  {Math.abs(item.change)}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderLeaguesSection = () => (
    <View style={styles.leaguesContainer}>
      {/* Current League Card */}
      <Card variant="gradient" gradient={colors.gradients.ocean} style={styles.currentLeagueCard}>
        <View style={styles.currentLeagueHeader}>
          <Text style={styles.currentLeagueTitle}>{t('arena.currentLeague')}</Text>
        </View>
        <View style={styles.currentLeagueContent}>
          <LeagueBadge league={stats?.league || 'bronze'} size="lg" showLabel={false} />
          <View style={styles.currentLeagueInfo}>
            <Text style={styles.currentLeagueName}>
              {t(`arena.leagueTiers.${stats?.league || 'bronze'}`)}
            </Text>
            <Text style={styles.currentLeaguePoints}>
              {stats?.leaguePoints || 0} pts
            </Text>
            {pointsToNext && (
              <Text style={styles.nextLeagueText}>
                {pointsToNext} pts {language === 'pt' ? 'para próxima liga' : '升级到下一联赛'}
              </Text>
            )}
          </View>
        </View>
      </Card>

      {/* League Tiers */}
      <Text style={styles.leaguesSectionTitle}>
        {language === 'pt' ? 'Todas as Ligas' : '所有联赛'}
      </Text>
      {leagues.map((league, index) => {
        const leagueStyle = getLeagueStyle(league);
        const isCurrentLeague = league === stats?.league;
        const isUnlocked = index <= currentLeagueIndex;

        return (
          <View
            key={league}
            style={[
              styles.leagueTierCard,
              isCurrentLeague && styles.leagueTierCardActive,
            ]}
          >
            <View style={styles.leagueTierLeft}>
              <LinearGradient
                colors={leagueStyle.gradient as [string, string]}
                style={[
                  styles.leagueTierBadge,
                  !isUnlocked && styles.leagueTierBadgeLocked,
                ]}
              >
                <Text style={styles.leagueTierIcon}>{leagueStyle.icon}</Text>
              </LinearGradient>
              <View style={styles.leagueTierInfo}>
                <Text
                  style={[
                    styles.leagueTierName,
                    !isUnlocked && styles.leagueTierNameLocked,
                  ]}
                >
                  {t(`arena.leagueTiers.${league}`)}
                </Text>
                <Text style={styles.leagueTierThreshold}>
                  {LEAGUE_THRESHOLDS[league].toLocaleString()} pts
                </Text>
              </View>
            </View>
            {isCurrentLeague && (
              <View style={styles.currentTag}>
                <Text style={styles.currentTagText}>
                  {language === 'pt' ? 'Atual' : '当前'}
                </Text>
              </View>
            )}
            {!isUnlocked && (
              <Ionicons name="lock-closed" size={20} color={colors.neutral[400]} />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderBattlesSection = () => (
    <View style={styles.battlesContainer}>
      {currentBattle && (
        <Card variant="gradient" gradient={colors.gradients.epic} style={styles.battleCard}>
          <View style={styles.battleHeader}>
            <View style={styles.battleTitleContainer}>
              <Ionicons name="flash" size={24} color={colors.neutral.white} />
              <Text style={styles.battleTitle}>{t('arena.weeklyBattle')}</Text>
            </View>
            <View style={styles.battleTimer}>
              <Ionicons name="time" size={14} color={colors.neutral.white} />
              <Text style={styles.battleTimerText}>
                {formatTimeRemaining(currentBattle.endDate, language)}
              </Text>
            </View>
          </View>

          <View style={styles.battleStats}>
            <View style={styles.battleStat}>
              <Text style={styles.battleStatValue}>
                {currentBattle.participants.length}
              </Text>
              <Text style={styles.battleStatLabel}>{t('arena.participants')}</Text>
            </View>
            <View style={styles.battleStatDivider} />
            <View style={styles.battleStat}>
              <Text style={styles.battleStatValue}>
                #{currentBattle.participants[0]?.rank || '-'}
              </Text>
              <Text style={styles.battleStatLabel}>{t('arena.yourRank')}</Text>
            </View>
            <View style={styles.battleStatDivider} />
            <View style={styles.battleStat}>
              <Text style={styles.battleStatValue}>
                {currentBattle.participants[0]?.score.toLocaleString() || 0}
              </Text>
              <Text style={styles.battleStatLabel}>{t('arena.yourScore')}</Text>
            </View>
          </View>

          <View style={styles.prizesContainer}>
            <Text style={styles.prizesTitle}>{t('arena.prizes')}</Text>
            {currentBattle.prizePool.slice(0, 3).map((prize, index) => (
              <View key={index} style={styles.prizeRow}>
                <Text style={styles.prizeRank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} #{prize.rank}
                </Text>
                <Text style={styles.prizeValue}>
                  {prize.seaCoins} 🪙 + {prize.xp} XP
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.joinBattleButton}>
            <Text style={styles.joinBattleText}>{t('arena.joinBattle')}</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Past Battles */}
      <Text style={styles.sectionTitle}>
        {language === 'pt' ? 'Batalhas Anteriores' : '过去的对战'}
      </Text>
      <View style={styles.noBattles}>
        <Ionicons name="trophy-outline" size={48} color={colors.neutral[300]} />
        <Text style={styles.noBattlesText}>
          {language === 'pt'
            ? 'Nenhuma batalha concluída ainda'
            : '尚未完成任何对战'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={colors.gradients.ocean} style={styles.header}>
        <Text style={styles.title}>{t('arena.title')}</Text>
        <Text style={styles.subtitle}>
          {language === 'pt'
            ? 'Compete com outros restaurantes!'
            : '与其他餐厅竞争！'}
        </Text>

        {/* Your Rank Card */}
        <Card style={styles.rankCard}>
          <View style={styles.rankCardContent}>
            <View style={styles.rankCardLeft}>
              <Text style={styles.rankCardLabel}>{t('arena.yourRank')}</Text>
              <Text style={styles.rankCardValue}>#{stats?.monthlyRank || '-'}</Text>
            </View>
            <LeagueBadge
              league={stats?.league || 'bronze'}
              size="md"
              points={stats?.leaguePoints}
            />
          </View>
        </Card>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['leaderboard', 'leagues', 'battles'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {t(`arena.${tab}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardContainer}>
            <FlatList
              data={leaderboard}
              keyExtractor={(item) => item.restaurantId}
              renderItem={renderLeaderboardItem}
              scrollEnabled={false}
              ListHeaderComponent={
                <Text style={styles.leaderboardTitle}>
                  {t('arena.monthlyRanking')}
                </Text>
              }
            />
          </View>
        )}
        {activeTab === 'leagues' && renderLeaguesSection()}
        {activeTab === 'battles' && renderBattlesSection()}

        <View style={{ height: spacing[20] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral.white,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing[1],
    marginBottom: spacing[4],
  },
  rankCard: {
    marginTop: spacing[2],
  },
  rankCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankCardLeft: {},
  rankCardLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
  },
  rankCardValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.neutral[800],
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  leaderboardContainer: {
    padding: spacing[4],
  },
  leaderboardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing[4],
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[2],
    ...shadows.sm,
  },
  leaderboardItemHighlight: {
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[300],
  },
  leaderboardTopItem: {
    ...shadows.md,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: colors.neutral.white,
    fontWeight: '700',
    fontSize: typography.fontSize.sm,
  },
  rankText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  playerDetails: {
    marginLeft: spacing[2],
    flex: 1,
  },
  playerName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  leagueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  leagueTagText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  leaguesContainer: {
    padding: spacing[4],
  },
  currentLeagueCard: {
    marginBottom: spacing[6],
  },
  currentLeagueHeader: {
    marginBottom: spacing[3],
  },
  currentLeagueTitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentLeagueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  currentLeagueInfo: {
    flex: 1,
  },
  currentLeagueName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral.white,
  },
  currentLeaguePoints: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255,255,255,0.9)',
  },
  nextLeagueText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing[1],
  },
  leaguesSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing[4],
  },
  leagueTierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  leagueTierCardActive: {
    borderWidth: 2,
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  leagueTierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  leagueTierBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueTierBadgeLocked: {
    opacity: 0.5,
  },
  leagueTierIcon: {
    fontSize: 24,
  },
  leagueTierInfo: {},
  leagueTierName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  leagueTierNameLocked: {
    color: colors.neutral[400],
  },
  leagueTierThreshold: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
  },
  currentTag: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  currentTagText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  battlesContainer: {
    padding: spacing[4],
  },
  battleCard: {
    marginBottom: spacing[6],
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  battleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  battleTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  battleTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  battleTimerText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
  },
  battleStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  battleStat: {
    flex: 1,
    alignItems: 'center',
  },
  battleStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  battleStatLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing[1],
  },
  battleStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  prizesContainer: {
    marginBottom: spacing[4],
  },
  prizesTitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  prizeRank: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  prizeValue: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  joinBattleButton: {
    backgroundColor: colors.neutral.white,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  joinBattleText: {
    color: colors.rarity.epic,
    fontSize: typography.fontSize.base,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing[4],
  },
  noBattles: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  noBattlesText: {
    marginTop: spacing[3],
    color: colors.neutral[400],
    fontSize: typography.fontSize.base,
  },
});

export default ArenaScreen;
