import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProductsStore, useCartStore, useSettingsStore } from '../store';
import { ProductCard, Button } from '../components';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { Product, ProductCategory, ProductRarity } from '../types';
import { formatCurrency } from '../utils/gamification';

type FilterType = 'all' | ProductCategory | ProductRarity;

export const CatalogScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const products = useProductsStore((state) => state.products);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const isLoading = useProductsStore((state) => state.isLoading);
  const cartItems = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories: { key: FilterType; label: string }[] = [
    { key: 'all', label: language === 'pt' ? 'Todos' : '全部' },
    { key: 'seafood_frozen', label: t('categories.seafood_frozen') },
    { key: 'seafood_fresh', label: t('categories.seafood_fresh') },
    { key: 'sushi_rice', label: t('categories.sushi_rice') },
    { key: 'sauces', label: t('categories.sauces') },
    { key: 'legendary', label: '✨ ' + t('rarity.legendary') },
    { key: 'epic', label: '💜 ' + t('rarity.epic') },
    { key: 'rare', label: '💙 ' + t('rarity.rare') },
  ];

  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.pt.toLowerCase().includes(query) ||
          p.name.zh.includes(searchQuery) ||
          p.description.pt.toLowerCase().includes(query)
      );
    }

    // Apply category/rarity filter
    if (activeFilter !== 'all') {
      if (['legendary', 'epic', 'rare', 'common'].includes(activeFilter)) {
        result = result.filter((p) => p.rarity === activeFilter);
      } else {
        result = result.filter((p) => p.category === activeFilter);
      }
    }

    return result;
  }, [products, searchQuery, activeFilter]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      variant={viewMode}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{t('catalog.title')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={styles.viewModeButton}
            >
              <Ionicons
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={22}
                color={colors.neutral[600]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filtersContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item.key)}
              style={[
                styles.filterChip,
                activeFilter === item.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fish" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>
              {searchQuery
                ? language === 'pt'
                  ? 'Nenhum produto encontrado'
                  : '未找到产品'
                : language === 'pt'
                ? 'A carregar produtos...'
                : '加载产品中...'}
            </Text>
          </View>
        }
      />

      {/* Cart Summary Bar */}
      {cartItemCount > 0 && (
        <View style={styles.cartBar}>
          <LinearGradient
            colors={colors.gradients.ocean}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cartBarGradient}
          >
            <View style={styles.cartInfo}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
              <View style={styles.cartTextContainer}>
                <Text style={styles.cartLabel}>{t('orders.cart')}</Text>
                <Text style={styles.cartTotal}>{formatCurrency(getTotal())}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={styles.cartButton}
            >
              <Text style={styles.cartButtonText}>{t('orders.checkout')}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primary[600]} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[800],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  viewModeButton: {
    padding: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.neutral[800],
  },
  filtersContainer: {
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.neutral.white,
  },
  productsContainer: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  gridRow: {
    justifyContent: 'space-between',
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
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  cartBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  cartBadge: {
    backgroundColor: colors.neutral.white,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: colors.primary[600],
    fontWeight: '700',
    fontSize: typography.fontSize.sm,
  },
  cartTextContainer: {},
  cartLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.xs,
  },
  cartTotal: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  cartButtonText: {
    color: colors.primary[600],
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
  },
});

export default CatalogScreen;
