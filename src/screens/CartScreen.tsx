import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useCartStore,
  useAuthStore,
  usePlayerStatsStore,
  useOrdersStore,
  useSettingsStore,
} from '../store';
import { Card, Button, MissionCard } from '../components';
import { colors, spacing, typography, borderRadius, shadows, getRarityStyle } from '../utils/theme';
import { formatCurrency, generateDailyMission } from '../utils/gamification';
import { Order, OrderItem } from '../types';

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const restaurant = useAuthStore((state) => state.restaurant);
  const items = useCartStore((state) => state.items);
  const currentMission = useCartStore((state) => state.currentMission);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscount = useCartStore((state) => state.getDiscount);
  const getTotal = useCartStore((state) => state.getTotal);
  const getXpReward = useCartStore((state) => state.getXpReward);
  const getSeaCoinReward = useCartStore((state) => state.getSeaCoinReward);
  const setMission = useCartStore((state) => state.setMission);
  const addXp = usePlayerStatsStore((state) => state.addXp);
  const addSeaCoins = usePlayerStatsStore((state) => state.addSeaCoins);
  const incrementOrders = usePlayerStatsStore((state) => state.incrementOrders);
  const addOrder = useOrdersStore((state) => state.addOrder);

  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate mission if none exists
  React.useEffect(() => {
    if (!currentMission && items.length > 0) {
      const mission = generateDailyMission(language);
      setMission(mission);
    }
  }, [items.length]);

  const handleQuantityChange = (productId: string, delta: number, currentQty: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      Alert.alert(
        t('common.confirm'),
        language === 'pt'
          ? 'Remover este produto do carrinho?'
          : '从购物车中删除此产品？',
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.confirm'), onPress: () => removeItem(productId) },
        ]
      );
    } else {
      updateQuantity(productId, newQty);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const xpEarned = getXpReward();
    const coinsEarned = getSeaCoinReward();

    // Create order
    const order: Order = {
      id: `ord_${Date.now()}`,
      restaurantId: restaurant?.id || '',
      items: items,
      subtotal: getSubtotal(),
      discount: getDiscount(),
      total: getTotal(),
      status: 'pending',
      mission: currentMission!,
      xpEarned,
      seaCoinsEarned: coinsEarned,
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notes,
    };

    // Add order and rewards
    addOrder(order);
    addXp(xpEarned);
    addSeaCoins(coinsEarned);
    incrementOrders(getTotal());

    // Clear cart
    clearCart();

    setIsProcessing(false);

    // Navigate to success screen
    navigation.replace('OrderSuccess', {
      orderId: order.id,
      xpEarned,
      coinsEarned,
    });
  };

  const renderCartItem = (item: OrderItem) => {
    const rarityStyle = getRarityStyle(item.product.rarity);

    return (
      <View key={item.productId} style={styles.cartItem}>
        <View
          style={[styles.itemImage, { borderColor: rarityStyle.borderColor }]}
        >
          <LinearGradient
            colors={rarityStyle.gradient as [string, string]}
            style={styles.itemImageGradient}
          >
            <Text style={styles.itemEmoji}>🦐</Text>
          </LinearGradient>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product.name[language]}
          </Text>
          <Text style={styles.itemPrice}>
            {formatCurrency(item.unitPrice)}/{item.product.unit}
          </Text>
          <View style={styles.itemBonuses}>
            <Text style={styles.bonusText}>+{item.product.xpBonus * item.quantity} XP</Text>
            <Text style={styles.bonusText}>+{item.product.seaCoinBonus * item.quantity} 🪙</Text>
          </View>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => handleQuantityChange(item.productId, -1, item.quantity)}
            style={styles.quantityButton}
          >
            <Ionicons name="remove" size={18} color={colors.neutral[600]} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => handleQuantityChange(item.productId, 1, item.quantity)}
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={18} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>{formatCurrency(item.totalPrice)}</Text>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('orders.cart')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.neutral[300]} />
          <Text style={styles.emptyTitle}>{t('orders.emptyCart')}</Text>
          <Text style={styles.emptySubtitle}>{t('orders.addItems')}</Text>
          <Button
            title={t('catalog.title')}
            onPress={() => navigation.navigate('Catalog')}
            style={{ marginTop: spacing[6] }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('orders.cart')}</Text>
        <TouchableOpacity onPress={clearCart}>
          <Ionicons name="trash-outline" size={24} color={colors.status.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Mission */}
        {currentMission && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orders.currentMission')}</Text>
            <MissionCard mission={currentMission} />
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('orders.cart')} ({items.length} {language === 'pt' ? 'itens' : '件商品'})
          </Text>
          <Card style={styles.itemsCard}>
            {items.map(renderCartItem)}
          </Card>
        </View>

        {/* Delivery Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders.notes')}</Text>
          <Card style={styles.notesCard}>
            <TextInput
              style={styles.notesInput}
              placeholder={
                language === 'pt'
                  ? 'Adicione notas para a entrega...'
                  : '添加配送备注...'
              }
              placeholderTextColor={colors.neutral[400]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </Card>
        </View>

        {/* Rewards Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders.missionRewards')}</Text>
          <Card variant="gradient" gradient={colors.gradients.ocean} style={styles.rewardsCard}>
            <View style={styles.rewardsRow}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <View>
                  <Text style={styles.rewardValue}>+{getXpReward()}</Text>
                  <Text style={styles.rewardLabel}>XP</Text>
                </View>
              </View>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>🪙</Text>
                <View>
                  <Text style={styles.rewardValue}>+{getSeaCoinReward()}</Text>
                  <Text style={styles.rewardLabel}>SeaCoins</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('orders.subtotal')}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(getSubtotal())}</Text>
            </View>
            {getDiscount() > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('orders.discount')}</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -{formatCurrency(getDiscount())}
                </Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('orders.total')}</Text>
              <Text style={styles.totalValue}>{formatCurrency(getTotal())}</Text>
            </View>
          </Card>
        </View>

        <View style={{ height: spacing[20] }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <Button
          title={t('orders.placeOrder')}
          onPress={handlePlaceOrder}
          loading={isProcessing}
          size="lg"
          gradient={colors.gradients.ocean}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.neutral[700],
    marginTop: spacing[4],
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[500],
    marginTop: spacing[2],
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing[3],
  },
  itemsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
  },
  itemImageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  itemName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  itemPrice: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  itemBonuses: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  bonusText: {
    fontSize: 10,
    color: colors.primary[600],
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    marginHorizontal: spacing[2],
  },
  quantityButton: {
    padding: spacing[2],
  },
  quantityText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.neutral[800],
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.neutral[800],
    minWidth: 60,
    textAlign: 'right',
  },
  notesCard: {
    padding: spacing[3],
  },
  notesInput: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[800],
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rewardsCard: {
    padding: spacing[4],
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
    justifyContent: 'center',
  },
  rewardIcon: {
    fontSize: 32,
  },
  rewardValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral.white,
  },
  rewardLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  rewardDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing[4],
  },
  summaryCard: {
    padding: spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.neutral[800],
  },
  discountValue: {
    color: colors.status.success,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[3],
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  totalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.primary[600],
  },
  footer: {
    padding: spacing[4],
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
});

export default CartScreen;
