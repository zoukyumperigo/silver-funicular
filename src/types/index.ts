// ============================================
// SEAFOOD QUEST - Core Type Definitions
// ============================================

// Product Rarity System
export type ProductRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Product {
  id: string;
  name: {
    pt: string;
    zh: string;
  };
  description: {
    pt: string;
    zh: string;
  };
  category: ProductCategory;
  rarity: ProductRarity;
  price: number;
  unit: string;
  imageUrl: string;
  stockLevel: number;
  xpBonus: number;
  seaCoinBonus: number;
  isPromotion: boolean;
  promotionMultiplier?: number;
}

export type ProductCategory =
  | 'seafood_frozen'
  | 'seafood_fresh'
  | 'sushi_rice'
  | 'sauces'
  | 'vegetables'
  | 'specialty';

// User & Restaurant System
export interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: Address;
  avatar: Avatar;
  createdAt: Date;
  language: 'pt' | 'zh';
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Avatar {
  baseImage: string;
  accessories: string[];
  frame: string;
  background: string;
}

// Gamification - Player Stats
export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface PlayerStats {
  odysplayerId: string;
  level: number;
  currentXp: number;
  totalXp: number;
  xpToNextLevel: number;
  seaCoins: number;
  totalSeaCoinsEarned: number;
  league: LeagueTier;
  leaguePoints: number;
  monthlyRank: number;
  streak: number;
  longestStreak: number;
  totalOrders: number;
  totalSpent: number;
  achievements: Achievement[];
  unlockedRewards: string[];
  clanId?: string;
}

// Achievements System
export type AchievementCategory =
  | 'orders'
  | 'spending'
  | 'consistency'
  | 'exploration'
  | 'competition'
  | 'social';

export interface Achievement {
  id: string;
  name: {
    pt: string;
    zh: string;
  };
  description: {
    pt: string;
    zh: string;
  };
  category: AchievementCategory;
  icon: string;
  rarity: ProductRarity;
  requirement: AchievementRequirement;
  xpReward: number;
  seaCoinReward: number;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface AchievementRequirement {
  type: 'orders_count' | 'total_spent' | 'streak' | 'products_tried' | 'league_reached' | 'clan_joined' | 'battles_won';
  value: number;
}

// Orders & Missions System
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type MissionType =
  | 'standard'
  | 'daily_challenge'
  | 'weekly_quest'
  | 'special_event';

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  mission: Mission;
  xpEarned: number;
  seaCoinsEarned: number;
  createdAt: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  notes?: string;
}

export interface Mission {
  id: string;
  type: MissionType;
  name: {
    pt: string;
    zh: string;
  };
  description: {
    pt: string;
    zh: string;
  };
  objectives: MissionObjective[];
  baseXpReward: number;
  bonusXpReward: number;
  seaCoinReward: number;
  timeLimit?: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface MissionObjective {
  id: string;
  description: {
    pt: string;
    zh: string;
  };
  type: 'min_amount' | 'specific_product' | 'category_count' | 'rarity_count';
  target: number | string;
  current: number;
  isCompleted: boolean;
}

// Competitive System
export interface LeaderboardEntry {
  rank: number;
  restaurantId: string;
  restaurantName: string;
  avatar: Avatar;
  score: number;
  league: LeagueTier;
  change: number;
}

export interface WeeklyBattle {
  id: string;
  weekNumber: number;
  year: number;
  participants: BattleParticipant[];
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  prizePool: BattlePrize[];
}

export interface BattleParticipant {
  restaurantId: string;
  restaurantName: string;
  avatar: Avatar;
  score: number;
  rank: number;
}

export interface BattlePrize {
  rank: number;
  seaCoins: number;
  xp: number;
  specialReward?: string;
}

// Clan System
export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  region: string;
  emblem: ClanEmblem;
  leaderId: string;
  members: ClanMember[];
  level: number;
  totalXp: number;
  weeklyScore: number;
  monthlyRank: number;
  createdAt: Date;
  chatMessages: ClanChatMessage[];
}

export interface ClanEmblem {
  shape: string;
  primaryColor: string;
  secondaryColor: string;
  icon: string;
}

export interface ClanMember {
  restaurantId: string;
  restaurantName: string;
  role: 'leader' | 'officer' | 'member';
  joinedAt: Date;
  weeklyContribution: number;
  totalContribution: number;
}

export interface ClanChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'achievement' | 'order' | 'system';
}

// Rewards Shop
export type RewardCategory =
  | 'discount'
  | 'free_product'
  | 'priority_delivery'
  | 'exclusive_item'
  | 'avatar_item';

export interface Reward {
  id: string;
  name: {
    pt: string;
    zh: string;
  };
  description: {
    pt: string;
    zh: string;
  };
  category: RewardCategory;
  cost: number;
  imageUrl: string;
  stock?: number;
  requiredLevel?: number;
  requiredLeague?: LeagueTier;
  validUntil?: Date;
  value: RewardValue;
}

export interface RewardValue {
  type: 'percentage_discount' | 'fixed_discount' | 'free_product' | 'delivery_upgrade' | 'avatar_item';
  amount?: number;
  productId?: string;
  itemId?: string;
}

// Notifications
export type NotificationType =
  | 'order_update'
  | 'achievement_unlocked'
  | 'level_up'
  | 'league_promotion'
  | 'battle_result'
  | 'clan_message'
  | 'promotion'
  | 'daily_challenge';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: {
    pt: string;
    zh: string;
  };
  message: {
    pt: string;
    zh: string;
  };
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// Analytics
export interface AnalyticsData {
  period: 'daily' | 'weekly' | 'monthly';
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: ProductAnalytics[];
  engagementScore: number;
  xpGained: number;
  achievementsUnlocked: number;
  leagueProgress: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

// App State Types
export interface AppState {
  isLoading: boolean;
  isAuthenticated: boolean;
  currentRestaurant: Restaurant | null;
  playerStats: PlayerStats | null;
  language: 'pt' | 'zh';
}
