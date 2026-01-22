// ============================================
// SEAFOOD QUEST - Theme Configuration
// Maritime & Asian Elegant Theme
// ============================================

export const colors = {
  // Primary Colors - Ocean Theme
  primary: {
    50: '#E6F3FF',
    100: '#B3DBFF',
    200: '#80C3FF',
    300: '#4DABFF',
    400: '#1A93FF',
    500: '#0077E6',
    600: '#005CB3',
    700: '#004180',
    800: '#00264D',
    900: '#000B1A',
  },

  // Secondary Colors - Gold/Fortune
  secondary: {
    50: '#FFF9E6',
    100: '#FFEBB3',
    200: '#FFDD80',
    300: '#FFCF4D',
    400: '#FFC11A',
    500: '#E6A800',
    600: '#B38300',
    700: '#805E00',
    800: '#4D3900',
    900: '#1A1300',
  },

  // Rarity Colors
  rarity: {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B',
  },

  // League Colors
  league: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  },

  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Gradient combinations
  gradients: {
    ocean: ['#0077E6', '#00264D'],
    gold: ['#FFD700', '#E6A800'],
    sunset: ['#FF6B6B', '#FFB347'],
    legendary: ['#F59E0B', '#D97706'],
    epic: ['#A855F7', '#7C3AED'],
    rare: ['#3B82F6', '#1D4ED8'],
    clan: ['#10B981', '#047857'],
  },

  // Background Colors
  background: {
    primary: '#F0F9FF',
    secondary: '#FFFFFF',
    card: '#FFFFFF',
    dark: '#0F172A',
  },
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    chinese: 'System', // Will use system Chinese font
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  }),
};

// Rarity-based styling
export const getRarityStyle = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return {
        borderColor: colors.rarity.legendary,
        backgroundColor: `${colors.rarity.legendary}15`,
        textColor: colors.rarity.legendary,
        gradient: colors.gradients.legendary,
      };
    case 'epic':
      return {
        borderColor: colors.rarity.epic,
        backgroundColor: `${colors.rarity.epic}15`,
        textColor: colors.rarity.epic,
        gradient: colors.gradients.epic,
      };
    case 'rare':
      return {
        borderColor: colors.rarity.rare,
        backgroundColor: `${colors.rarity.rare}15`,
        textColor: colors.rarity.rare,
        gradient: colors.gradients.rare,
      };
    default:
      return {
        borderColor: colors.rarity.common,
        backgroundColor: `${colors.rarity.common}15`,
        textColor: colors.rarity.common,
        gradient: [colors.rarity.common, colors.neutral[400]],
      };
  }
};

// League-based styling
export const getLeagueStyle = (league: string) => {
  switch (league) {
    case 'diamond':
      return {
        color: colors.league.diamond,
        icon: '💎',
        gradient: ['#B9F2FF', '#87CEEB'],
      };
    case 'platinum':
      return {
        color: colors.league.platinum,
        icon: '⚪',
        gradient: ['#E5E4E2', '#C0C0C0'],
      };
    case 'gold':
      return {
        color: colors.league.gold,
        icon: '🥇',
        gradient: colors.gradients.gold,
      };
    case 'silver':
      return {
        color: colors.league.silver,
        icon: '🥈',
        gradient: ['#C0C0C0', '#A0A0A0'],
      };
    default:
      return {
        color: colors.league.bronze,
        icon: '🥉',
        gradient: ['#CD7F32', '#8B4513'],
      };
  }
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  getRarityStyle,
  getLeagueStyle,
};
