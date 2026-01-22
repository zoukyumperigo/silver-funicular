import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Restaurant,
  PlayerStats,
  Product,
  Order,
  OrderItem,
  Mission,
  Achievement,
  Clan,
  LeaderboardEntry,
  WeeklyBattle,
  Reward,
  AppNotification,
  LeagueTier,
} from '../types';
import { changeLanguage } from '../i18n';

// ============================================
// Auth Store
// ============================================
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  restaurant: Restaurant | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateRestaurant: (data: Partial<Restaurant>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: false,
      restaurant: null,
      token: null,
      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({
          isAuthenticated: true,
          isLoading: false,
          restaurant: {
            id: 'rest_001',
            name: 'Restaurante Dragão Dourado',
            ownerName: 'Li Wei',
            email,
            phone: '+351 912 345 678',
            address: {
              street: 'Rua da Alegria, 123',
              city: 'Lisboa',
              postalCode: '1200-001',
              region: 'Lisboa',
            },
            avatar: {
              baseImage: 'dragon',
              accessories: ['chef_hat'],
              frame: 'gold',
              background: 'ocean',
            },
            createdAt: new Date(),
            language: 'pt',
          },
          token: 'mock_token_123',
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          restaurant: null,
          token: null,
        });
      },
      updateRestaurant: (data) => {
        set((state) => ({
          restaurant: state.restaurant
            ? { ...state.restaurant, ...data }
            : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// Player Stats Store (Gamification)
// ============================================
interface PlayerStatsState {
  stats: PlayerStats | null;
  initializeStats: (restaurantId: string) => void;
  addXp: (amount: number) => void;
  addSeaCoins: (amount: number) => void;
  spendSeaCoins: (amount: number) => boolean;
  updateStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  updateLeague: (league: LeagueTier) => void;
  incrementOrders: (amount: number) => void;
}

const XP_PER_LEVEL = 1000;
const XP_MULTIPLIER = 1.5;

const calculateXpToNextLevel = (level: number): number => {
  return Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
};

export const usePlayerStatsStore = create<PlayerStatsState>()(
  persist(
    (set, get) => ({
      stats: null,
      initializeStats: (restaurantId: string) => {
        set({
          stats: {
            odysplayerId: restaurantId,
            level: 1,
            currentXp: 0,
            totalXp: 0,
            xpToNextLevel: XP_PER_LEVEL,
            seaCoins: 100,
            totalSeaCoinsEarned: 100,
            league: 'bronze',
            leaguePoints: 0,
            monthlyRank: 0,
            streak: 0,
            longestStreak: 0,
            totalOrders: 0,
            totalSpent: 0,
            achievements: [],
            unlockedRewards: [],
            clanId: undefined,
          },
        });
      },
      addXp: (amount: number) => {
        set((state) => {
          if (!state.stats) return state;

          let newXp = state.stats.currentXp + amount;
          let newLevel = state.stats.level;
          let xpToNext = state.stats.xpToNextLevel;

          while (newXp >= xpToNext) {
            newXp -= xpToNext;
            newLevel++;
            xpToNext = calculateXpToNextLevel(newLevel);
          }

          return {
            stats: {
              ...state.stats,
              currentXp: newXp,
              totalXp: state.stats.totalXp + amount,
              level: newLevel,
              xpToNextLevel: xpToNext,
            },
          };
        });
      },
      addSeaCoins: (amount: number) => {
        set((state) => {
          if (!state.stats) return state;
          return {
            stats: {
              ...state.stats,
              seaCoins: state.stats.seaCoins + amount,
              totalSeaCoinsEarned: state.stats.totalSeaCoinsEarned + amount,
            },
          };
        });
      },
      spendSeaCoins: (amount: number) => {
        const state = get();
        if (!state.stats || state.stats.seaCoins < amount) return false;
        set({
          stats: {
            ...state.stats,
            seaCoins: state.stats.seaCoins - amount,
          },
        });
        return true;
      },
      updateStreak: () => {
        set((state) => {
          if (!state.stats) return state;
          const newStreak = state.stats.streak + 1;
          return {
            stats: {
              ...state.stats,
              streak: newStreak,
              longestStreak: Math.max(newStreak, state.stats.longestStreak),
            },
          };
        });
      },
      unlockAchievement: (achievementId: string) => {
        set((state) => {
          if (!state.stats) return state;
          const alreadyUnlocked = state.stats.achievements.find(
            (a) => a.id === achievementId
          );
          if (alreadyUnlocked) return state;

          // Achievement would be added from a separate achievements list
          return state;
        });
      },
      updateLeague: (league: LeagueTier) => {
        set((state) => {
          if (!state.stats) return state;
          return {
            stats: {
              ...state.stats,
              league,
            },
          };
        });
      },
      incrementOrders: (amount: number) => {
        set((state) => {
          if (!state.stats) return state;
          return {
            stats: {
              ...state.stats,
              totalOrders: state.stats.totalOrders + 1,
              totalSpent: state.stats.totalSpent + amount,
            },
          };
        });
      },
    }),
    {
      name: 'player-stats-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// Cart Store
// ============================================
interface CartState {
  items: OrderItem[];
  currentMission: Mission | null;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setMission: (mission: Mission) => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getXpReward: () => number;
  getSeaCoinReward: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  currentMission: null,
  addItem: (product: Product, quantity: number) => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.productId === product.id
      );
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  totalPrice: (item.quantity + quantity) * item.unitPrice,
                }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            product,
            quantity,
            unitPrice: product.price,
            totalPrice: product.price * quantity,
          },
        ],
      };
    });
  },
  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },
  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      ),
    }));
  },
  clearCart: () => {
    set({ items: [], currentMission: null });
  },
  setMission: (mission: Mission) => {
    set({ currentMission: mission });
  },
  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
  },
  getDiscount: () => {
    // Discount logic based on missions, promotions, etc.
    return 0;
  },
  getTotal: () => {
    const state = get();
    return state.getSubtotal() - state.getDiscount();
  },
  getXpReward: () => {
    const state = get();
    const baseXp = Math.floor(state.getTotal() / 10); // 1 XP per €0.10
    const bonusXp = state.items.reduce(
      (sum, item) => sum + item.product.xpBonus * item.quantity,
      0
    );
    const missionBonus = state.currentMission?.bonusXpReward || 0;
    return baseXp + bonusXp + missionBonus;
  },
  getSeaCoinReward: () => {
    const state = get();
    const baseCoins = Math.floor(state.getTotal() / 5); // 1 SeaCoin per €0.05
    const bonusCoins = state.items.reduce(
      (sum, item) => sum + item.product.seaCoinBonus * item.quantity,
      0
    );
    const missionBonus = state.currentMission?.seaCoinReward || 0;
    return baseCoins + bonusCoins + missionBonus;
  },
}));

// ============================================
// Orders Store
// ============================================
interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      currentOrder: null,
      addOrder: (order: Order) => {
        set((state) => ({
          orders: [order, ...state.orders],
          currentOrder: order,
        }));
      },
      updateOrderStatus: (orderId: string, status: Order['status']) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        }));
      },
      setCurrentOrder: (order: Order | null) => {
        set({ currentOrder: order });
      },
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// Products Store
// ============================================
interface ProductsState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  getProductsByCategory: (category: string) => Product[];
  getProductsByRarity: (rarity: string) => Product[];
  searchProducts: (query: string) => Product[];
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [
    'seafood_frozen',
    'seafood_fresh',
    'sushi_rice',
    'sauces',
    'vegetables',
    'specialty',
  ],
  isLoading: false,
  fetchProducts: async () => {
    set({ isLoading: true });
    // Simulated API call - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ products: MOCK_PRODUCTS, isLoading: false });
  },
  getProductsByCategory: (category: string) => {
    return get().products.filter((p) => p.category === category);
  },
  getProductsByRarity: (rarity: string) => {
    return get().products.filter((p) => p.rarity === rarity);
  },
  searchProducts: (query: string) => {
    const lowerQuery = query.toLowerCase();
    return get().products.filter(
      (p) =>
        p.name.pt.toLowerCase().includes(lowerQuery) ||
        p.name.zh.includes(query)
    );
  },
}));

// ============================================
// Arena Store (Leaderboards, Battles)
// ============================================
interface ArenaState {
  leaderboard: LeaderboardEntry[];
  currentBattle: WeeklyBattle | null;
  myBattleScore: number;
  fetchLeaderboard: () => Promise<void>;
  fetchCurrentBattle: () => Promise<void>;
  updateBattleScore: (score: number) => void;
}

export const useArenaStore = create<ArenaState>((set) => ({
  leaderboard: [],
  currentBattle: null,
  myBattleScore: 0,
  fetchLeaderboard: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ leaderboard: MOCK_LEADERBOARD });
  },
  fetchCurrentBattle: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ currentBattle: MOCK_BATTLE });
  },
  updateBattleScore: (score: number) => {
    set({ myBattleScore: score });
  },
}));

// ============================================
// Clan Store
// ============================================
interface ClanState {
  clan: Clan | null;
  availableClans: Clan[];
  fetchClan: (clanId: string) => Promise<void>;
  fetchAvailableClans: () => Promise<void>;
  joinClan: (clanId: string) => Promise<void>;
  leaveClan: () => void;
  sendChatMessage: (message: string) => void;
}

export const useClanStore = create<ClanState>((set, get) => ({
  clan: null,
  availableClans: [],
  fetchClan: async (clanId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ clan: MOCK_CLAN });
  },
  fetchAvailableClans: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ availableClans: [MOCK_CLAN] });
  },
  joinClan: async (clanId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ clan: MOCK_CLAN });
  },
  leaveClan: () => {
    set({ clan: null });
  },
  sendChatMessage: (message: string) => {
    const state = get();
    if (!state.clan) return;
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'rest_001',
      senderName: 'Dragão Dourado',
      message,
      timestamp: new Date(),
      type: 'text' as const,
    };
    set({
      clan: {
        ...state.clan,
        chatMessages: [...state.clan.chatMessages, newMessage],
      },
    });
  },
}));

// ============================================
// Rewards Store
// ============================================
interface RewardsState {
  rewards: Reward[];
  myRewards: Reward[];
  fetchRewards: () => Promise<void>;
  redeemReward: (rewardId: string) => Promise<boolean>;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  rewards: [],
  myRewards: [],
  fetchRewards: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ rewards: MOCK_REWARDS });
  },
  redeemReward: async (rewardId: string) => {
    const state = get();
    const reward = state.rewards.find((r) => r.id === rewardId);
    if (!reward) return false;

    const playerStats = usePlayerStatsStore.getState();
    const success = playerStats.spendSeaCoins(reward.cost);
    if (success) {
      set({ myRewards: [...state.myRewards, reward] });
    }
    return success;
  },
}));

// ============================================
// Notifications Store
// ============================================
interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAsRead: (notificationId: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

// ============================================
// Settings Store
// ============================================
interface SettingsState {
  language: 'pt' | 'zh';
  pushNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  battleAlerts: boolean;
  clanMessages: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  setLanguage: (lang: 'pt' | 'zh') => void;
  toggleSetting: (key: keyof Omit<SettingsState, 'language' | 'setLanguage' | 'toggleSetting'>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'pt',
      pushNotifications: true,
      orderUpdates: true,
      promotions: true,
      battleAlerts: true,
      clanMessages: true,
      soundEnabled: true,
      vibrationEnabled: true,
      darkMode: false,
      setLanguage: (lang: 'pt' | 'zh') => {
        changeLanguage(lang);
        set({ language: lang });
      },
      toggleSetting: (key) => {
        set((state) => ({ [key]: !state[key] } as Partial<SettingsState>));
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// Mock Data
// ============================================
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: { pt: 'Camarão Tigre Gigante', zh: '巨型虎虾' },
    description: {
      pt: 'Camarão tigre premium congelado, ideal para pratos especiais',
      zh: '优质冷冻虎虾，适合特色菜肴',
    },
    category: 'seafood_frozen',
    rarity: 'legendary',
    price: 45.99,
    unit: 'kg',
    imageUrl: 'tiger_shrimp.jpg',
    stockLevel: 50,
    xpBonus: 100,
    seaCoinBonus: 50,
    isPromotion: false,
  },
  {
    id: 'prod_002',
    name: { pt: 'Lulas Inteiras', zh: '整只鱿鱼' },
    description: {
      pt: 'Lulas frescas congeladas de alta qualidade',
      zh: '高品质冷冻新鲜鱿鱼',
    },
    category: 'seafood_frozen',
    rarity: 'rare',
    price: 18.50,
    unit: 'kg',
    imageUrl: 'squid.jpg',
    stockLevel: 200,
    xpBonus: 30,
    seaCoinBonus: 15,
    isPromotion: true,
    promotionMultiplier: 1.5,
  },
  {
    id: 'prod_003',
    name: { pt: 'Arroz para Sushi Premium', zh: '高级寿司米' },
    description: {
      pt: 'Arroz japonês de grão curto, perfeito para sushi',
      zh: '日本短粒米，完美制作寿司',
    },
    category: 'sushi_rice',
    rarity: 'epic',
    price: 8.99,
    unit: 'kg',
    imageUrl: 'sushi_rice.jpg',
    stockLevel: 500,
    xpBonus: 20,
    seaCoinBonus: 10,
    isPromotion: false,
  },
  {
    id: 'prod_004',
    name: { pt: 'Polvo Congelado', zh: '冷冻章鱼' },
    description: {
      pt: 'Polvo inteiro congelado, textura macia',
      zh: '整只冷冻章鱼，口感柔软',
    },
    category: 'seafood_frozen',
    rarity: 'epic',
    price: 32.00,
    unit: 'kg',
    imageUrl: 'octopus.jpg',
    stockLevel: 80,
    xpBonus: 60,
    seaCoinBonus: 30,
    isPromotion: false,
  },
  {
    id: 'prod_005',
    name: { pt: 'Salmão Atlântico', zh: '大西洋三文鱼' },
    description: {
      pt: 'Filetes de salmão atlântico fresco',
      zh: '新鲜大西洋三文鱼片',
    },
    category: 'seafood_fresh',
    rarity: 'rare',
    price: 24.99,
    unit: 'kg',
    imageUrl: 'salmon.jpg',
    stockLevel: 150,
    xpBonus: 40,
    seaCoinBonus: 20,
    isPromotion: true,
    promotionMultiplier: 2,
  },
  {
    id: 'prod_006',
    name: { pt: 'Molho de Soja Premium', zh: '优质酱油' },
    description: {
      pt: 'Molho de soja japonês autêntico',
      zh: '正宗日本酱油',
    },
    category: 'sauces',
    rarity: 'common',
    price: 5.99,
    unit: 'L',
    imageUrl: 'soy_sauce.jpg',
    stockLevel: 300,
    xpBonus: 5,
    seaCoinBonus: 3,
    isPromotion: false,
  },
  {
    id: 'prod_007',
    name: { pt: 'Atum Rabilho', zh: '蓝鳍金枪鱼' },
    description: {
      pt: 'Atum rabilho de qualidade sashimi',
      zh: '刺身级蓝鳍金枪鱼',
    },
    category: 'seafood_fresh',
    rarity: 'legendary',
    price: 89.99,
    unit: 'kg',
    imageUrl: 'bluefin_tuna.jpg',
    stockLevel: 20,
    xpBonus: 200,
    seaCoinBonus: 100,
    isPromotion: false,
  },
  {
    id: 'prod_008',
    name: { pt: 'Mexilhões', zh: '青口贝' },
    description: {
      pt: 'Mexilhões frescos do Atlântico',
      zh: '新鲜大西洋青口贝',
    },
    category: 'seafood_fresh',
    rarity: 'common',
    price: 6.99,
    unit: 'kg',
    imageUrl: 'mussels.jpg',
    stockLevel: 400,
    xpBonus: 10,
    seaCoinBonus: 5,
    isPromotion: false,
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    restaurantId: 'rest_010',
    restaurantName: 'Palácio Imperial',
    avatar: { baseImage: 'palace', accessories: [], frame: 'diamond', background: 'gold' },
    score: 15420,
    league: 'diamond',
    change: 0,
  },
  {
    rank: 2,
    restaurantId: 'rest_005',
    restaurantName: 'Jardim do Dragão',
    avatar: { baseImage: 'dragon', accessories: [], frame: 'platinum', background: 'red' },
    score: 12350,
    league: 'platinum',
    change: 1,
  },
  {
    rank: 3,
    restaurantId: 'rest_003',
    restaurantName: 'Casa do Mar',
    avatar: { baseImage: 'wave', accessories: [], frame: 'gold', background: 'blue' },
    score: 11200,
    league: 'platinum',
    change: -1,
  },
];

const MOCK_BATTLE: WeeklyBattle = {
  id: 'battle_001',
  weekNumber: 4,
  year: 2024,
  participants: [
    {
      restaurantId: 'rest_001',
      restaurantName: 'Dragão Dourado',
      avatar: { baseImage: 'dragon', accessories: [], frame: 'gold', background: 'ocean' },
      score: 2450,
      rank: 5,
    },
  ],
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  status: 'active',
  prizePool: [
    { rank: 1, seaCoins: 5000, xp: 2000, specialReward: 'exclusive_avatar' },
    { rank: 2, seaCoins: 3000, xp: 1500 },
    { rank: 3, seaCoins: 2000, xp: 1000 },
  ],
};

const MOCK_CLAN: Clan = {
  id: 'clan_001',
  name: 'Mestres do Mar',
  tag: 'MAR',
  description: 'Os melhores restaurantes de Lisboa unidos!',
  region: 'Lisboa',
  emblem: {
    shape: 'shield',
    primaryColor: '#1E90FF',
    secondaryColor: '#FFD700',
    icon: 'anchor',
  },
  leaderId: 'rest_010',
  members: [
    {
      restaurantId: 'rest_010',
      restaurantName: 'Palácio Imperial',
      role: 'leader',
      joinedAt: new Date(),
      weeklyContribution: 5000,
      totalContribution: 25000,
    },
  ],
  level: 5,
  totalXp: 50000,
  weeklyScore: 12000,
  monthlyRank: 3,
  createdAt: new Date(),
  chatMessages: [],
};

const MOCK_REWARDS: Reward[] = [
  {
    id: 'reward_001',
    name: { pt: '10% Desconto', zh: '10% 折扣' },
    description: { pt: '10% de desconto na próxima encomenda', zh: '下次订单10%折扣' },
    category: 'discount',
    cost: 500,
    imageUrl: 'discount_10.png',
    value: { type: 'percentage_discount', amount: 10 },
  },
  {
    id: 'reward_002',
    name: { pt: 'Entrega Prioritária', zh: '优先配送' },
    description: { pt: 'Entrega prioritária garantida', zh: '保证优先配送' },
    category: 'priority_delivery',
    cost: 300,
    imageUrl: 'priority.png',
    value: { type: 'delivery_upgrade' },
  },
  {
    id: 'reward_003',
    name: { pt: 'Moldura Dourada', zh: '金色边框' },
    description: { pt: 'Moldura exclusiva para o avatar', zh: '头像专属边框' },
    category: 'avatar_item',
    cost: 1000,
    imageUrl: 'gold_frame.png',
    requiredLevel: 10,
    value: { type: 'avatar_item', itemId: 'frame_gold_premium' },
  },
];
