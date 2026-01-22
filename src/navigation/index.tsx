import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  HomeScreen,
  CatalogScreen,
  ArenaScreen,
  CartScreen,
  ShopScreen,
  ProfileScreen,
} from '../screens';
import { useAuthStore, useCartStore } from '../store';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

// Auth Screen (placeholder)
const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    await login('demo@seafoodquest.pt', 'demo123');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <View style={authStyles.container}>
      <LinearGradient colors={colors.gradients.ocean} style={authStyles.gradient}>
        <View style={authStyles.content}>
          <Text style={authStyles.logo}>🦐</Text>
          <Text style={authStyles.title}>SeaFood Quest</Text>
          <Text style={authStyles.subtitle}>{t('auth.subtitle')}</Text>

          <View style={authStyles.buttonContainer}>
            <View style={authStyles.button}>
              <Text style={authStyles.buttonText} onPress={handleLogin}>
                {t('auth.login')}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const authStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '700',
    color: colors.neutral.white,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing[8],
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: colors.neutral.white,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primary[600],
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
});

// Order Success Screen
const OrderSuccessScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { orderId, xpEarned, coinsEarned } = route.params;
  const { t } = useTranslation();

  return (
    <View style={successStyles.container}>
      <LinearGradient colors={colors.gradients.ocean} style={successStyles.gradient}>
        <View style={successStyles.content}>
          <Text style={successStyles.emoji}>🎉</Text>
          <Text style={successStyles.title}>{t('orders.orderPlaced')}</Text>
          <Text style={successStyles.orderId}>
            {t('orders.orderNumber', { id: orderId.slice(-6) })}
          </Text>

          <View style={successStyles.rewardsCard}>
            <Text style={successStyles.rewardsTitle}>{t('orders.missionRewards')}</Text>
            <View style={successStyles.rewardsRow}>
              <View style={successStyles.rewardItem}>
                <Text style={successStyles.rewardIcon}>⭐</Text>
                <Text style={successStyles.rewardValue}>+{xpEarned} XP</Text>
              </View>
              <View style={successStyles.rewardItem}>
                <Text style={successStyles.rewardIcon}>🪙</Text>
                <Text style={successStyles.rewardValue}>+{coinsEarned}</Text>
              </View>
            </View>
          </View>

          <View style={successStyles.button}>
            <Text
              style={successStyles.buttonText}
              onPress={() => navigation.navigate('Home')}
            >
              {t('common.done')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const successStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.neutral.white,
    marginBottom: spacing[2],
  },
  orderId: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing[8],
  },
  rewardsCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    width: '100%',
    marginBottom: spacing[8],
  },
  rewardsTitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  rewardValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  button: {
    backgroundColor: colors.neutral.white,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.xl,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primary[600],
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
});

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Cart: undefined;
  OrderSuccess: { orderId: string; xpEarned: number; coinsEarned: number };
  ProductDetail: { productId: string };
  Notifications: undefined;
  Settings: undefined;
  Missions: undefined;
  Clan: undefined;
  EditProfile: undefined;
  EditAvatar: undefined;
  OrderHistory: undefined;
  Inventory: undefined;
  Achievements: undefined;
  AchievementDetail: { achievementId: string };
  MyRewards: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Catalog: undefined;
  Arena: undefined;
  Shop: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Bar Icon with Badge
const TabBarIcon: React.FC<{
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  badge?: number;
}> = ({ name, focused, badge }) => {
  return (
    <View style={tabStyles.iconContainer}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? colors.primary[500] : colors.neutral[400]}
      />
      {badge !== undefined && badge > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.status.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

// Main Tab Navigator
const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[100],
          paddingTop: spacing[2],
          paddingBottom: spacing[2],
          height: 60,
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('nav.home'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{
          tabBarLabel: t('nav.catalog'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'grid' : 'grid-outline'}
              focused={focused}
              badge={cartItemCount}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Arena"
        component={ArenaScreen}
        options={{
          tabBarLabel: t('nav.arena'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'trophy' : 'trophy-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: t('nav.shop'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'gift' : 'gift-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('nav.profile'),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Placeholder screens for navigation
const PlaceholderScreen: React.FC<{ route: any }> = ({ route }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 18, color: colors.neutral[600] }}>
      {route.name} Screen
    </Text>
    <Text style={{ fontSize: 14, color: colors.neutral[400], marginTop: 8 }}>
      Coming soon...
    </Text>
  </View>
);

// Root Navigator
export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="OrderSuccess"
              component={OrderSuccessScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="ProductDetail" component={PlaceholderScreen} />
            <Stack.Screen name="Notifications" component={PlaceholderScreen} />
            <Stack.Screen name="Settings" component={PlaceholderScreen} />
            <Stack.Screen name="Missions" component={PlaceholderScreen} />
            <Stack.Screen name="Clan" component={PlaceholderScreen} />
            <Stack.Screen name="EditProfile" component={PlaceholderScreen} />
            <Stack.Screen name="EditAvatar" component={PlaceholderScreen} />
            <Stack.Screen name="OrderHistory" component={PlaceholderScreen} />
            <Stack.Screen name="Inventory" component={PlaceholderScreen} />
            <Stack.Screen name="Achievements" component={PlaceholderScreen} />
            <Stack.Screen name="AchievementDetail" component={PlaceholderScreen} />
            <Stack.Screen name="MyRewards" component={PlaceholderScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
