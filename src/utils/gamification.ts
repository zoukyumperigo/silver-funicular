// ============================================
// SEAFOOD QUEST - Gamification Utilities
// ============================================

import { LeagueTier, ProductRarity, Mission, MissionObjective, Achievement } from '../types';

// XP Calculation Constants
const BASE_XP_PER_EURO = 10;
const STREAK_BONUS_MULTIPLIER = 0.1;
const MAX_STREAK_BONUS = 2.0;

// SeaCoin Constants
const BASE_COINS_PER_EURO = 2;
const PROMO_COIN_MULTIPLIER = 1.5;

// League Thresholds
export const LEAGUE_THRESHOLDS: Record<LeagueTier, number> = {
  bronze: 0,
  silver: 1000,
  gold: 3000,
  platinum: 7500,
  diamond: 15000,
};

// Rarity XP Multipliers
export const RARITY_XP_MULTIPLIERS: Record<ProductRarity, number> = {
  common: 1.0,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0,
};

// Calculate XP from order
export const calculateOrderXp = (
  orderTotal: number,
  streak: number,
  productBonuses: number = 0
): number => {
  const baseXp = Math.floor(orderTotal * BASE_XP_PER_EURO);
  const streakMultiplier = Math.min(
    1 + streak * STREAK_BONUS_MULTIPLIER,
    MAX_STREAK_BONUS
  );
  const totalXp = Math.floor((baseXp + productBonuses) * streakMultiplier);
  return totalXp;
};

// Calculate SeaCoins from order
export const calculateOrderSeaCoins = (
  orderTotal: number,
  hasPromotion: boolean = false,
  productBonuses: number = 0
): number => {
  const baseCoins = Math.floor(orderTotal * BASE_COINS_PER_EURO);
  const multiplier = hasPromotion ? PROMO_COIN_MULTIPLIER : 1;
  return Math.floor((baseCoins + productBonuses) * multiplier);
};

// Get current league based on points
export const getCurrentLeague = (points: number): LeagueTier => {
  if (points >= LEAGUE_THRESHOLDS.diamond) return 'diamond';
  if (points >= LEAGUE_THRESHOLDS.platinum) return 'platinum';
  if (points >= LEAGUE_THRESHOLDS.gold) return 'gold';
  if (points >= LEAGUE_THRESHOLDS.silver) return 'silver';
  return 'bronze';
};

// Get points needed for next league
export const getPointsToNextLeague = (
  currentPoints: number,
  currentLeague: LeagueTier
): number | null => {
  const leagues: LeagueTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = leagues.indexOf(currentLeague);

  if (currentIndex >= leagues.length - 1) return null;

  const nextLeague = leagues[currentIndex + 1];
  return LEAGUE_THRESHOLDS[nextLeague] - currentPoints;
};

// Calculate level from total XP
export const calculateLevel = (totalXp: number): { level: number; currentXp: number; xpToNext: number } => {
  const BASE_XP = 1000;
  const MULTIPLIER = 1.5;

  let level = 1;
  let xpRequired = BASE_XP;
  let remainingXp = totalXp;

  while (remainingXp >= xpRequired) {
    remainingXp -= xpRequired;
    level++;
    xpRequired = Math.floor(BASE_XP * Math.pow(MULTIPLIER, level - 1));
  }

  return {
    level,
    currentXp: remainingXp,
    xpToNext: xpRequired,
  };
};

// Format large numbers for display
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Format currency
export const formatCurrency = (amount: number, currency: string = '€'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

// Calculate streak bonus percentage
export const getStreakBonusPercentage = (streak: number): number => {
  return Math.min(streak * STREAK_BONUS_MULTIPLIER * 100, (MAX_STREAK_BONUS - 1) * 100);
};

// Generate daily mission
export const generateDailyMission = (language: 'pt' | 'zh'): Mission => {
  const missionTypes = [
    {
      name: { pt: 'Encomenda Rápida', zh: '快速订单' },
      description: {
        pt: 'Faça uma encomenda de pelo menos €50',
        zh: '下一个至少50欧元的订单',
      },
      objectives: [
        {
          id: 'obj_min_amount',
          description: { pt: 'Gastar pelo menos €50', zh: '消费至少50欧元' },
          type: 'min_amount' as const,
          target: 50,
          current: 0,
          isCompleted: false,
        },
      ],
      baseXpReward: 100,
      seaCoinReward: 50,
    },
    {
      name: { pt: 'Explorador de Sabores', zh: '味道探索者' },
      description: {
        pt: 'Encomende produtos de 3 categorias diferentes',
        zh: '订购3个不同类别的产品',
      },
      objectives: [
        {
          id: 'obj_categories',
          description: { pt: '3 categorias diferentes', zh: '3个不同类别' },
          type: 'category_count' as const,
          target: 3,
          current: 0,
          isCompleted: false,
        },
      ],
      baseXpReward: 150,
      seaCoinReward: 75,
    },
    {
      name: { pt: 'Caçador de Raridades', zh: '稀有猎人' },
      description: {
        pt: 'Inclua um produto épico ou lendário na encomenda',
        zh: '订单中包含一个史诗或传奇产品',
      },
      objectives: [
        {
          id: 'obj_rarity',
          description: { pt: 'Produto épico/lendário', zh: '史诗/传奇产品' },
          type: 'rarity_count' as const,
          target: 1,
          current: 0,
          isCompleted: false,
        },
      ],
      baseXpReward: 200,
      seaCoinReward: 100,
    },
  ];

  const randomMission = missionTypes[Math.floor(Math.random() * missionTypes.length)];

  return {
    id: `mission_daily_${Date.now()}`,
    type: 'daily_challenge',
    name: randomMission.name,
    description: randomMission.description,
    objectives: randomMission.objectives,
    baseXpReward: randomMission.baseXpReward,
    bonusXpReward: Math.floor(randomMission.baseXpReward * 0.5),
    seaCoinReward: randomMission.seaCoinReward,
    timeLimit: 24 * 60 * 60 * 1000, // 24 hours
    isCompleted: false,
  };
};

// Check if mission objectives are completed
export const checkMissionCompletion = (mission: Mission): boolean => {
  return mission.objectives.every((obj) => obj.isCompleted);
};

// Update mission progress based on order
export const updateMissionProgress = (
  mission: Mission,
  orderTotal: number,
  categoryCount: number,
  rarityProducts: { epic: number; legendary: number }
): Mission => {
  const updatedObjectives = mission.objectives.map((obj) => {
    let newCurrent = obj.current;

    switch (obj.type) {
      case 'min_amount':
        newCurrent = orderTotal;
        break;
      case 'category_count':
        newCurrent = categoryCount;
        break;
      case 'rarity_count':
        newCurrent = rarityProducts.epic + rarityProducts.legendary;
        break;
    }

    const isCompleted = newCurrent >= (obj.target as number);

    return {
      ...obj,
      current: newCurrent,
      isCompleted,
    };
  });

  return {
    ...mission,
    objectives: updatedObjectives,
    isCompleted: checkMissionCompletion({ ...mission, objectives: updatedObjectives }),
    completedAt: checkMissionCompletion({ ...mission, objectives: updatedObjectives })
      ? new Date()
      : undefined,
  };
};

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_order',
    name: { pt: 'Primeira Aventura', zh: '首次冒险' },
    description: { pt: 'Complete a sua primeira encomenda', zh: '完成您的第一个订单' },
    category: 'orders',
    icon: '🎉',
    rarity: 'common',
    requirement: { type: 'orders_count', value: 1 },
    xpReward: 50,
    seaCoinReward: 25,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'ach_sushi_master',
    name: { pt: 'Mestre do Sushi', zh: '寿司大师' },
    description: { pt: 'Encomende 100kg de arroz para sushi', zh: '订购100公斤寿司米' },
    category: 'orders',
    icon: '🍣',
    rarity: 'epic',
    requirement: { type: 'products_tried', value: 100 },
    xpReward: 500,
    seaCoinReward: 250,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'ach_seafood_king',
    name: { pt: 'Rei do Seafood', zh: '海鲜之王' },
    description: { pt: 'Gaste €10,000 em seafood', zh: '在海鲜上消费10000欧元' },
    category: 'spending',
    icon: '👑',
    rarity: 'legendary',
    requirement: { type: 'total_spent', value: 10000 },
    xpReward: 1000,
    seaCoinReward: 500,
    progress: 0,
    maxProgress: 10000,
  },
  {
    id: 'ach_loyal_customer',
    name: { pt: 'Cliente Fiel', zh: '忠实顾客' },
    description: { pt: 'Mantenha uma streak de 30 dias', zh: '保持30天连续记录' },
    category: 'consistency',
    icon: '🏆',
    rarity: 'epic',
    requirement: { type: 'streak', value: 30 },
    xpReward: 750,
    seaCoinReward: 400,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: 'ach_streak_warrior',
    name: { pt: 'Guerreiro da Consistência', zh: '连续战士' },
    description: { pt: 'Mantenha uma streak de 7 dias', zh: '保持7天连续记录' },
    category: 'consistency',
    icon: '🔥',
    rarity: 'rare',
    requirement: { type: 'streak', value: 7 },
    xpReward: 200,
    seaCoinReward: 100,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'ach_champion',
    name: { pt: 'Campeão', zh: '冠军' },
    description: { pt: 'Alcance a liga Ouro', zh: '达到黄金联赛' },
    category: 'competition',
    icon: '🏅',
    rarity: 'rare',
    requirement: { type: 'league_reached', value: 3 },
    xpReward: 300,
    seaCoinReward: 150,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'ach_clan_hero',
    name: { pt: 'Herói do Clã', zh: '公会英雄' },
    description: { pt: 'Junte-se a um clã', zh: '加入一个公会' },
    category: 'social',
    icon: '⚔️',
    rarity: 'common',
    requirement: { type: 'clan_joined', value: 1 },
    xpReward: 100,
    seaCoinReward: 50,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'ach_legendary_hunter',
    name: { pt: 'Caçador de Lendários', zh: '传奇猎人' },
    description: { pt: 'Encomende 10 produtos lendários', zh: '订购10个传奇产品' },
    category: 'exploration',
    icon: '✨',
    rarity: 'legendary',
    requirement: { type: 'products_tried', value: 10 },
    xpReward: 800,
    seaCoinReward: 400,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'ach_big_spender',
    name: { pt: 'Grande Gastador', zh: '大买家' },
    description: { pt: 'Faça uma encomenda de €500 ou mais', zh: '下一个500欧元以上的订单' },
    category: 'spending',
    icon: '💰',
    rarity: 'rare',
    requirement: { type: 'total_spent', value: 500 },
    xpReward: 250,
    seaCoinReward: 125,
    progress: 0,
    maxProgress: 500,
  },
  {
    id: 'ach_battle_victor',
    name: { pt: 'Vencedor de Batalhas', zh: '战斗胜利者' },
    description: { pt: 'Ganhe 5 batalhas semanais', zh: '赢得5场每周对战' },
    category: 'competition',
    icon: '⚔️',
    rarity: 'epic',
    requirement: { type: 'battles_won', value: 5 },
    xpReward: 600,
    seaCoinReward: 300,
    progress: 0,
    maxProgress: 5,
  },
];

// Check and update achievement progress
export const checkAchievementProgress = (
  achievement: Achievement,
  stats: {
    ordersCount: number;
    totalSpent: number;
    streak: number;
    league: LeagueTier;
    hasClan: boolean;
    battlesWon: number;
  }
): Achievement => {
  let progress = 0;

  switch (achievement.requirement.type) {
    case 'orders_count':
      progress = stats.ordersCount;
      break;
    case 'total_spent':
      progress = stats.totalSpent;
      break;
    case 'streak':
      progress = stats.streak;
      break;
    case 'league_reached':
      const leagues: LeagueTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      progress = leagues.indexOf(stats.league) >= achievement.requirement.value ? 1 : 0;
      break;
    case 'clan_joined':
      progress = stats.hasClan ? 1 : 0;
      break;
    case 'battles_won':
      progress = stats.battlesWon;
      break;
  }

  const isUnlocked = progress >= achievement.maxProgress && !achievement.unlockedAt;

  return {
    ...achievement,
    progress: Math.min(progress, achievement.maxProgress),
    unlockedAt: isUnlocked ? new Date() : achievement.unlockedAt,
  };
};

// Get time remaining formatted
export const formatTimeRemaining = (endDate: Date, language: 'pt' | 'zh'): string => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) {
    return language === 'pt' ? 'Terminado' : '已结束';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return language === 'pt' ? `${days}d ${hours}h` : `${days}天 ${hours}小时`;
  }
  if (hours > 0) {
    return language === 'pt' ? `${hours}h ${minutes}m` : `${hours}小时 ${minutes}分钟`;
  }
  return language === 'pt' ? `${minutes}m` : `${minutes}分钟`;
};
