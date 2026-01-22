import React from 'react';
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
import {
  useAuthStore,
  usePlayerStatsStore,
  useSettingsStore,
} from '../store';
import { Card, XPBar, LeagueBadge, AchievementBadge } from '../components';
import { colors, spacing, typography, borderRadius, shadows, getLeagueStyle } from '../utils/theme';
import { formatCurrency, ACHIEVEMENTS } from '../utils/gamification';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const restaurant = useAuthStore((state) => state.restaurant);
  const logout = useAuthStore((state) => state.logout);
  const stats = usePlayerStatsStore((state) => state.stats);

  const leagueStyle = getLeagueStyle(stats?.league || 'bronze');

  // Get achievements with progress
  const achievementsWithProgress = ACHIEVEMENTS.map((ach) => ({
    ...ach,
    progress: stats?.achievements.find((a) => a.id === ach.id)?.progress || 0,
    unlockedAt: stats?.achievements.find((a) => a.id === ach.id)?.unlockedAt,
  }));

  const unlockedAchievements = achievementsWithProgress.filter((a) => a.unlockedAt);
  const lockedAchievements = achievementsWithProgress.filter((a) => !a.unlockedAt);

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: t('profile.editProfile'),
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'brush-outline',
      label: t('profile.editAvatar'),
      onPress: () => navigation.navigate('EditAvatar'),
    },
    {
      icon: 'receipt-outline',
      label: t('orders.orderHistory'),
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      icon: 'bag-outline',
      label: t('profile.inventory'),
      onPress: () => navigation.navigate('Inventory'),
    },
    {
      icon: 'settings-outline',
      label: t('profile.settings'),
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient colors={colors.gradients.ocean} style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={leagueStyle.gradient as [string, string]}
              style={styles.avatarBorder}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>🏪</Text>
              </View>
            </LinearGradient>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => navigation.navigate('EditAvatar')}
            >
              <Ionicons name="pencil" size={14} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>

          {/* Restaurant Info */}
          <Text style={styles.restaurantName}>{restaurant?.name}</Text>
          <Text style={styles.ownerName}>{restaurant?.ownerName}</Text>

          {/* Level Badge */}
          <View style={styles.levelContainer}>
            <LinearGradient
              colors={colors.gradients.gold}
              style={styles.levelBadge}
            >
              <Text style={styles.levelText}>
                {t('profile.level')} {stats?.level || 1}
              </Text>
            </LinearGradient>
          </View>

          {/* XP Progress */}
          <View style={styles.xpContainer}>
            <XPBar
              level={stats?.level || 1}
              currentXp={stats?.currentXp || 0}
              xpToNext={stats?.xpToNextLevel || 1000}
              showLevel={false}
            />
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <LeagueBadge league={stats?.league || 'bronze'} size="sm" showLabel={false} />
            <Text style={styles.statValue}>
              {t(`arena.leagueTiers.${stats?.league || 'bronze'}`)}
            </Text>
            <Text style={styles.statLabel}>{t('home.currentLeague')}</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🪙</Text>
            <Text style={styles.statValue}>
              {(stats?.seaCoins || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>{t('shop.seaCoins')}</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{stats?.streak || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.currentStreak')}</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.totalOrders')}</Text>
          </Card>
        </View>

        {/* Total Stats */}
        <View style={styles.section}>
          <Card style={styles.totalStatsCard}>
            <View style={styles.totalStatRow}>
              <View style={styles.totalStatItem}>
                <Text style={styles.totalStatLabel}>{t('profile.totalXp')}</Text>
                <Text style={styles.totalStatValue}>
                  {(stats?.totalXp || 0).toLocaleString()} XP
                </Text>
              </View>
              <View style={styles.totalStatDivider} />
              <View style={styles.totalStatItem}>
                <Text style={styles.totalStatLabel}>{t('profile.totalSpent')}</Text>
                <Text style={styles.totalStatValue}>
                  {formatCurrency(stats?.totalSpent || 0)}
                </Text>
              </View>
              <View style={styles.totalStatDivider} />
              <View style={styles.totalStatItem}>
                <Text style={styles.totalStatLabel}>{t('profile.bestStreak')}</Text>
                <Text style={styles.totalStatValue}>
                  {stats?.longestStreak || 0} {language === 'pt' ? 'dias' : '天'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.achievements')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[...unlockedAchievements, ...lockedAchievements.slice(0, 3)]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.achievementsList}
            renderItem={({ item }) => (
              <AchievementBadge
                achievement={item}
                size="md"
                showProgress
                onPress={() => navigation.navigate('AchievementDetail', { achievementId: item.id })}
              />
            )}
          />
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Card style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={colors.neutral[600]}
                  />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* Member Since */}
        <Text style={styles.memberSince}>
          {t('profile.memberSince')}{' '}
          {restaurant?.createdAt
            ? new Date(restaurant.createdAt).toLocaleDateString(
                language === 'pt' ? 'pt-PT' : 'zh-CN'
              )
            : '-'}
        </Text>

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
    alignItems: 'center',
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[4],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing[3],
  },
  avatarBorder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 4,
  },
  avatar: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  restaurantName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral.white,
    marginBottom: spacing[1],
  },
  ownerName: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing[4],
  },
  levelContainer: {
    marginBottom: spacing[4],
  },
  levelBadge: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  levelText: {
    color: colors.neutral[800],
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
  xpContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    marginTop: -spacing[6],
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing[4],
    marginBottom: spacing[3],
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing[1],
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[800],
    marginTop: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  section: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: '600',
  },
  totalStatsCard: {
    padding: spacing[4],
  },
  totalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[200],
  },
  totalStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    marginBottom: spacing[1],
  },
  totalStatValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  achievementsList: {
    paddingVertical: spacing[2],
    gap: spacing[4],
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[700],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    color: colors.status.error,
    fontWeight: '600',
  },
  memberSince: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginTop: spacing[6],
  },
});

export default ProfileScreen;
