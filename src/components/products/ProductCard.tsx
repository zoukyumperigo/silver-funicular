import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { colors, borderRadius, typography, spacing, getRarityStyle, shadows } from '../../utils/theme';
import { useSettingsStore, useCartStore } from '../../store';
import { formatCurrency } from '../../utils/gamification';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  variant?: 'grid' | 'list' | 'compact';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  variant = 'grid',
}) => {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const addItem = useCartStore((state) => state.addItem);
  const rarityStyle = getRarityStyle(product.rarity);

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.compactContainer, { borderLeftColor: rarityStyle.borderColor }]}
      >
        <View style={styles.compactImageContainer}>
          <View style={[styles.compactPlaceholder, { backgroundColor: rarityStyle.backgroundColor }]}>
            <Text style={styles.compactPlaceholderText}>🦐</Text>
          </View>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {product.name[language]}
          </Text>
          <Text style={styles.compactPrice}>
            {formatCurrency(product.price)}/{product.unit}
          </Text>
        </View>
        <TouchableOpacity onPress={handleAddToCart} style={styles.compactAddButton}>
          <Ionicons name="add" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.listContainer}
      >
        <View style={[styles.listImageContainer, { borderColor: rarityStyle.borderColor }]}>
          <LinearGradient
            colors={rarityStyle.gradient as [string, string]}
            style={styles.listImageGradient}
          >
            <Text style={styles.listPlaceholderText}>🦐</Text>
          </LinearGradient>
          {product.isPromotion && (
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>
                {product.promotionMultiplier}x
              </Text>
            </View>
          )}
        </View>
        <View style={styles.listInfo}>
          <View style={styles.listHeader}>
            <Text style={[styles.rarityLabel, { color: rarityStyle.textColor }]}>
              {t(`rarity.${product.rarity}`)}
            </Text>
            {product.stockLevel < 50 && (
              <Text style={styles.lowStockLabel}>{t('catalog.lowStock')}</Text>
            )}
          </View>
          <Text style={styles.listName} numberOfLines={2}>
            {product.name[language]}
          </Text>
          <Text style={styles.listDescription} numberOfLines={1}>
            {product.description[language]}
          </Text>
          <View style={styles.listFooter}>
            <Text style={styles.listPrice}>
              {formatCurrency(product.price)}
              <Text style={styles.listUnit}>/{product.unit}</Text>
            </Text>
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusText}>+{product.xpBonus} XP</Text>
              <Text style={styles.bonusText}>+{product.seaCoinBonus} 🪙</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleAddToCart} style={styles.listAddButton}>
          <Ionicons name="add-circle" size={32} color={colors.primary[500]} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // Grid variant (default)
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.gridContainer, { borderColor: rarityStyle.borderColor }]}
    >
      {/* Rarity glow effect */}
      <View style={[styles.rarityGlow, { backgroundColor: rarityStyle.borderColor }]} />

      {/* Image Section */}
      <View style={styles.gridImageContainer}>
        <LinearGradient
          colors={rarityStyle.gradient as [string, string]}
          style={styles.gridImageGradient}
        >
          <Text style={styles.gridPlaceholderText}>🦐</Text>
        </LinearGradient>

        {/* Rarity Badge */}
        <View style={[styles.rarityBadge, { backgroundColor: rarityStyle.borderColor }]}>
          <Text style={styles.rarityBadgeText}>
            {t(`rarity.${product.rarity}`).substring(0, 1).toUpperCase()}
          </Text>
        </View>

        {/* Promotion Badge */}
        {product.isPromotion && (
          <LinearGradient
            colors={colors.gradients.sunset}
            style={styles.promoBadge}
          >
            <Text style={styles.promoBadgeText}>
              {product.promotionMultiplier}x XP
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={2}>
          {product.name[language]}
        </Text>

        <View style={styles.gridBonusRow}>
          <View style={styles.bonusPill}>
            <Text style={styles.bonusPillText}>+{product.xpBonus} XP</Text>
          </View>
          <View style={[styles.bonusPill, styles.coinPill]}>
            <Text style={styles.bonusPillText}>+{product.seaCoinBonus} 🪙</Text>
          </View>
        </View>

        <View style={styles.gridFooter}>
          <View>
            <Text style={styles.gridPrice}>{formatCurrency(product.price)}</Text>
            <Text style={styles.gridUnit}>/{product.unit}</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={styles.gridAddButton}
          >
            <LinearGradient
              colors={colors.gradients.ocean}
              style={styles.gridAddButtonGradient}
            >
              <Ionicons name="add" size={20} color={colors.neutral.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stock indicator */}
        {product.stockLevel < 50 && (
          <View style={styles.stockWarning}>
            <Ionicons name="warning" size={12} color={colors.status.warning} />
            <Text style={styles.stockWarningText}>{t('catalog.lowStock')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Variant Styles
  gridContainer: {
    width: '48%',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: spacing[4],
    ...shadows.md,
  },
  rarityGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.8,
  },
  gridImageContainer: {
    height: 120,
    position: 'relative',
  },
  gridImageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridPlaceholderText: {
    fontSize: 48,
  },
  rarityBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityBadgeText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
  promoBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  promoBadgeText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  gridInfo: {
    padding: spacing[3],
  },
  gridName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: spacing[2],
    height: 36,
  },
  gridBonusRow: {
    flexDirection: 'row',
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  bonusPill: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  coinPill: {
    backgroundColor: colors.secondary[100],
  },
  bonusPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary[700],
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  gridUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
  },
  gridAddButton: {
    overflow: 'hidden',
    borderRadius: borderRadius.full,
  },
  gridAddButtonGradient: {
    padding: spacing[2],
    borderRadius: borderRadius.full,
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  stockWarningText: {
    fontSize: typography.fontSize.xs,
    color: colors.status.warning,
  },

  // List Variant Styles
  listContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[3],
    alignItems: 'center',
    ...shadows.sm,
  },
  listImageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
  },
  listImageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listPlaceholderText: {
    fontSize: 36,
  },
  promoTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.status.warning,
    paddingVertical: 2,
    alignItems: 'center',
  },
  promoTagText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: '700',
  },
  listInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  rarityLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lowStockLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.status.warning,
  },
  listName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  listDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  listPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  listUnit: {
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    color: colors.neutral[500],
  },
  bonusContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  bonusText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: '500',
  },
  listAddButton: {
    marginLeft: spacing[2],
  },

  // Compact Variant Styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: spacing[2],
    marginBottom: spacing[2],
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  compactImageContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  compactPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactPlaceholderText: {
    fontSize: 20,
  },
  compactInfo: {
    flex: 1,
    marginLeft: spacing[2],
  },
  compactName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  compactPrice: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
  },
  compactAddButton: {
    backgroundColor: colors.primary[500],
    padding: spacing[2],
    borderRadius: borderRadius.full,
  },
});

export default ProductCard;
