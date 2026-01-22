import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useAuthStore,
  usePlayerStatsStore,
  useProductsStore,
  useArenaStore,
} from '../store';
import { Card, XPBar, LeagueBadge, ProductCard, MissionCard } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { generateDailyMission, getStreakBonusPercentage } from '../utils/gamification';
import { Mission } from '../types';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const restaurant = useAuthStore((state) => state.restaurant);
  const stats = usePlayerStatsStore((state) => state.stats);
  const products = useProductsStore((state) => state.products);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const fetchLeaderboard = useArenaStore((state) => state.fetchLeaderboard);

  const [refreshing, setRefreshing] = useState(false);
  const [dailyMission, setDailyMission] = useState<Mission | null>(null);

  useEffect(() => {
    loadData();
    // Generate daily mission
    const mission = generateDailyMission(restaurant?.language || 'pt');
    setDailyMission(mission);
  }, []);

  const loadData = async () => {
    await Promise.all([fetchProducts(), fetchLeaderboard()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const featuredProducts = products
    .filter((p) => p.rarity === 'legendary' || p.rarity === 'epic')
    .slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Greeting */}
        <LinearGradient
          colors={colors.gradients.ocean}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>
                {t('home.greeting', { name: restaurant?.name || 'Aventureiro' })}
              </Text>
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={16} color={colors.secondary[400]} />
                <Text style={styles.streakText}>
                  {t('home.streak', { days: stats?.streak || 0 })}
                </Text>
                {stats && stats.streak > 0 && (
                  <View style={styles.streakBonus}>
                    <Text style={styles.streakBonusText}>
                      +{getStreakBonusPercentage(stats.streak)}% XP
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={24} color={colors.neutral.white} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Player Stats Card */}
          <Card style={styles.statsCard} variant="elevated">
            <View style={styles.statsRow}>
              <XPBar
                level={stats?.level || 1}
                currentXp={stats?.currentXp || 0}
                xpToNext={stats?.xpToNextLevel || 1000}
              />
            </View>

            <View style={styles.statsFooter}>
              <View style={styles.statItem}>
                <LeagueBadge
                  league={stats?.league || 'bronze'}
                  size="sm"
                  showLabel={false}
                />
                <Text style={styles.statLabel}>
                  {t(`arena.leagueTiers.${stats?.league || 'bronze'}`)}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.seaCoinsContainer}>
                  <Text style={styles.seaCoinsIcon}>🪙</Text>
                  <Text style={styles.seaCoinsValue}>
                    {stats?.seaCoins?.toLocaleString() || 0}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{t('shop.seaCoins')}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.ordersValue}>{stats?.totalOrders || 0}</Text>
                <Text style={styles.statLabel}>{t('profile.totalOrders')}</Text>
              </View>
            </View>
          </Card>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Catalog')}
            >
              <LinearGradient
                colors={colors.gradients.ocean}
                style={styles.quickActionGradient}
              >
                <Ionicons name="cart" size={24} color={colors.neutral.white} />
              </LinearGradient>
              <Text style={styles.quickActionText}>{t('home.quickOrder')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Arena')}
            >
              <LinearGradient
                colors={colors.gradients.epic}
                style={styles.quickActionGradient}
              >
                <Ionicons name="trophy" size={24} color={colors.neutral.white} />
              </LinearGradient>
              <Text style={styles.quickActionText}>{t('nav.arena')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Clan')}
            >
              <LinearGradient
                colors={colors.gradients.clan}
                style={styles.quickActionGradient}
              >
                <Ionicons name="people" size={24} color={colors.neutral.white} />
              </LinearGradient>
              <Text style={styles.quickActionText}>{t('nav.clan')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Shop')}
            >
              <LinearGradient
                colors={colors.gradients.gold}
                style={styles.quickActionGradient}
              >
                <Ionicons name="gift" size={24} color={colors.neutral.white} />
              </LinearGradient>
              <Text style={styles.quickActionText}>{t('nav.shop')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Mission */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.dailyMission')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Missions')}>
              <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {dailyMission && <MissionCard mission={dailyMission} />}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.featuredProducts')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
              <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="grid"
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: product.id })
                }
              />
            ))}
          </View>
        </View>

        {/* Streak Reminder */}
        {stats && stats.streak === 0 && (
          <View style={styles.section}>
            <Card
              variant="gradient"
              gradient={colors.gradients.sunset}
              style={styles.reminderCard}
            >
              <View style={styles.reminderContent}>
                <Ionicons name="flame" size={32} color={colors.neutral.white} />
                <View style={styles.reminderTextContainer}>
                  <Text style={styles.reminderTitle}>{t('home.keepStreak')}</Text>
                  <Text style={styles.reminderSubtitle}>
                    Faça uma encomenda hoje e ganhe bónus XP!
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Bottom Spacing */}
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
    paddingBottom: spacing[8],
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral.white,
    marginBottom: spacing[1],
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  streakText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  streakBonus: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing[1],
  },
  streakBonusText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.white,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: spacing[2],
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.status.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: '700',
  },
  statsCard: {
    marginTop: spacing[2],
  },
  statsRow: {
    marginBottom: spacing[4],
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[200],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  seaCoinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  seaCoinsIcon: {
    fontSize: 20,
  },
  seaCoinsValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.secondary[600],
  },
  ordersValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  section: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  quickActionText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[600],
    marginTop: spacing[2],
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reminderCard: {
    marginTop: spacing[2],
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  reminderSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing[1],
  },
});

export default HomeScreen;
