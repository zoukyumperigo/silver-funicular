import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useRewardsStore,
  usePlayerStatsStore,
  useSettingsStore,
} from '../store';
import { Card, Button } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { Reward, RewardCategory } from '../types';

type FilterType = 'all' | RewardCategory;

export const ShopScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const rewards = useRewardsStore((state) => state.rewards);
  const myRewards = useRewardsStore((state) => state.myRewards);
  const fetchRewards = useRewardsStore((state) => state.fetchRewards);
  const redeemReward = useRewardsStore((state) => state.redeemReward);
  const stats = usePlayerStatsStore((state) => state.stats);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchRewards();
  }, []);

  const categories: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: language === 'pt' ? 'Todos' : '全部', icon: 'grid' },
    { key: 'discount', label: t('shop.categories.discount'), icon: 'pricetag' },
    { key: 'free_product', label: t('shop.categories.free_product'), icon: 'gift' },
    { key: 'priority_delivery', label: t('shop.categories.priority_delivery'), icon: 'rocket' },
    { key: 'avatar_item', label: t('shop.categories.avatar_item'), icon: 'person' },
  ];

  const filteredRewards =
    activeFilter === 'all'
      ? rewards
      : rewards.filter((r) => r.category === activeFilter);

  const handleRedeem = async (reward: Reward) => {
    if (!stats) return;

    if (stats.seaCoins < reward.cost) {
      Alert.alert(
        t('common.error'),
        t('shop.notEnough'),
        [{ text: 'OK' }]
      );
      return;
    }

    if (reward.requiredLevel && stats.level < reward.requiredLevel) {
      Alert.alert(
        t('common.error'),
        t('shop.levelRequired', { level: reward.requiredLevel }),
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      t('common.confirm'),
      language === 'pt'
        ? `Resgatar "${reward.name[language]}" por ${reward.cost} SeaCoins?`
        : `用 ${reward.cost} 海币兑换"${reward.name[language]}"？`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            const success = await redeemReward(reward.id);
            if (success) {
              Alert.alert(
                t('common.success'),
                t('shop.redeemed'),
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const renderRewardCard = ({ item }: { item: Reward }) => {
    const isOwned = myRewards.some((r) => r.id === item.id);
    const canAfford = (stats?.seaCoins || 0) >= item.cost;
    const meetsLevel = !item.requiredLevel || (stats?.level || 0) >= item.requiredLevel;
    const isAvailable = canAfford && meetsLevel && !isOwned;

    const getCategoryIcon = () => {
      switch (item.category) {
        case 'discount':
          return '🏷️';
        case 'free_product':
          return '🎁';
        case 'priority_delivery':
          return '🚀';
        case 'avatar_item':
          return '👤';
        case 'exclusive_item':
          return '⭐';
        default:
          return '🎁';
      }
    };

    return (
      <Card
        style={[styles.rewardCard, isOwned && styles.rewardCardOwned]}
        variant="elevated"
      >
        {/* Category Icon */}
        <View style={styles.rewardIconContainer}>
          <LinearGradient
            colors={
              isOwned
                ? [colors.status.success, colors.status.success]
                : colors.gradients.gold
            }
            style={styles.rewardIconGradient}
          >
            <Text style={styles.rewardIcon}>{getCategoryIcon()}</Text>
          </LinearGradient>
          {item.requiredLevel && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lv.{item.requiredLevel}</Text>
            </View>
          )}
        </View>

        {/* Reward Info */}
        <Text style={styles.rewardName} numberOfLines={2}>
          {item.name[language]}
        </Text>
        <Text style={styles.rewardDescription} numberOfLines={2}>
          {item.description[language]}
        </Text>

        {/* Cost & Action */}
        <View style={styles.rewardFooter}>
          <View style={styles.costContainer}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text
              style={[
                styles.costValue,
                !canAfford && !isOwned && styles.costValueInsufficient,
              ]}
            >
              {item.cost.toLocaleString()}
            </Text>
          </View>

          {isOwned ? (
            <View style={styles.ownedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
              <Text style={styles.ownedText}>
                {language === 'pt' ? 'Obtido' : '已获得'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleRedeem(item)}
              disabled={!isAvailable}
              style={[
                styles.redeemButton,
                !isAvailable && styles.redeemButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.redeemButtonText,
                  !isAvailable && styles.redeemButtonTextDisabled,
                ]}
              >
                {t('shop.redeem')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={colors.gradients.gold} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('shop.title')}</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>{t('shop.balance')}</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.coinIconLarge}>🪙</Text>
              <Text style={styles.balanceValue}>
                {(stats?.seaCoins || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* My Rewards Quick Access */}
        {myRewards.length > 0 && (
          <TouchableOpacity
            style={styles.myRewardsButton}
            onPress={() => navigation.navigate('MyRewards')}
          >
            <Text style={styles.myRewardsText}>
              {language === 'pt'
                ? `${myRewards.length} recompensas obtidas`
                : `已获得 ${myRewards.length} 个奖励`}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.secondary[700]} />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item.key)}
              style={[
                styles.categoryChip,
                activeFilter === item.key && styles.categoryChipActive,
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={
                  activeFilter === item.key
                    ? colors.neutral.white
                    : colors.neutral[600]
                }
              />
              <Text
                style={[
                  styles.categoryChipText,
                  activeFilter === item.key && styles.categoryChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Rewards Grid */}
      <FlatList
        data={filteredRewards}
        keyExtractor={(item) => item.id}
        renderItem={renderRewardCard}
        numColumns={2}
        contentContainerStyle={styles.rewardsGrid}
        columnWrapperStyle={styles.rewardsRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>
              {language === 'pt'
                ? 'Nenhuma recompensa disponível'
                : '没有可用的奖励'}
            </Text>
          </View>
        }
      />
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[800],
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  coinIconLarge: {
    fontSize: 24,
  },
  balanceValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[800],
  },
  myRewardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    marginTop: spacing[4],
    alignSelf: 'center',
  },
  myRewardsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.secondary[700],
  },
  categoriesContainer: {
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  categoriesList: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
  },
  categoryChipActive: {
    backgroundColor: colors.secondary[500],
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.neutral.white,
  },
  rewardsGrid: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  rewardsRow: {
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '48%',
    marginBottom: spacing[4],
    padding: spacing[4],
  },
  rewardCardOwned: {
    borderWidth: 2,
    borderColor: colors.status.success,
  },
  rewardIconContainer: {
    alignItems: 'center',
    marginBottom: spacing[3],
    position: 'relative',
  },
  rewardIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardIcon: {
    fontSize: 32,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  levelBadgeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: '700',
  },
  rewardName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: spacing[1],
    height: 36,
  },
  rewardDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing[3],
    height: 32,
  },
  rewardFooter: {
    alignItems: 'center',
    gap: spacing[2],
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  coinIcon: {
    fontSize: 16,
  },
  costValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.secondary[600],
  },
  costValueInsufficient: {
    color: colors.status.error,
  },
  redeemButton: {
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  redeemButtonDisabled: {
    backgroundColor: colors.neutral[200],
  },
  redeemButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  redeemButtonTextDisabled: {
    color: colors.neutral[400],
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  ownedText: {
    color: colors.status.success,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
  },
  emptyText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
  },
});

export default ShopScreen;
