# SeaFood Quest

A gamified mobile app for seafood distribution orders in Portugal, targeting Chinese restaurants.

## Overview

SeaFood Quest transforms the traditional ordering process into an engaging competitive gaming experience. Restaurants earn XP, SeaCoins, and achievements while placing orders, competing in leagues, and joining clans.

## Features

### Gamified Ordering System
- **Mission-Based Orders**: Each order is a "mission" with objectives and rewards
- **Product Rarity System**: Products categorized as Common, Rare, Epic, and Legendary
- **XP & SeaCoins**: Earn experience points and virtual currency with every order
- **Achievements**: Unlock badges like "Sushi Master", "Seafood King", "Loyal Customer"

### Competitive Mechanics
- **Monthly Leaderboards**: Compete for top positions based on order volume
- **League System**: Progress through Bronze, Silver, Gold, Platinum, and Diamond leagues
- **Weekly Battles**: Time-limited competitions between restaurants
- **Clan System**: Form groups with restaurants in the same region

### Rewards & Incentives
- **SeaCoins Currency**: Virtual currency earned through orders
- **Rewards Shop**: Redeem for discounts, free products, priority delivery
- **Streak Bonuses**: Extra XP for consecutive daily orders
- **Special Promotions**: Multiplier events for bonus rewards

### Technical Features
- **Bilingual Interface**: Full support for Portuguese and Chinese Simplified
- **Real-time Stock Integration**: Connected to warehouse inventory
- **Push Notifications**: Alerts for promotions, battles, and order updates
- **Analytics Dashboard**: Track engagement and performance metrics

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand with persistence
- **Navigation**: React Navigation 6
- **Styling**: StyleSheet with custom theme system
- **i18n**: i18next for internationalization
- **UI Components**: Custom components with Expo Linear Gradient

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Buttons, Cards, etc.
│   ├── gamification/   # XPBar, LeagueBadge, AchievementBadge
│   ├── products/       # ProductCard
│   └── missions/       # MissionCard
├── screens/            # App screens
│   ├── HomeScreen
│   ├── CatalogScreen
│   ├── ArenaScreen
│   ├── CartScreen
│   ├── ShopScreen
│   └── ProfileScreen
├── navigation/         # Navigation configuration
├── store/             # Zustand stores
├── types/             # TypeScript type definitions
├── i18n/              # Translations (pt, zh)
└── utils/             # Theme, gamification utilities
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Business Context

- **Company**: Frozen seafood and sushi rice distributor in Portugal
- **Target**: Chinese restaurants across Portugal
- **Operations**: 1000 pallet cold storage warehouse with truck logistics
- **Goals**:
  - Increase order frequency by 40%
  - Increase average order value by 25%
  - Improve customer retention
  - Generate behavioral data for stock optimization

## Gamification Mechanics

### XP System
- Base: 10 XP per euro spent
- Streak bonus: Up to 2x multiplier
- Product bonuses based on rarity
- Mission completion bonuses

### League Thresholds
- Bronze: 0 pts
- Silver: 1,000 pts
- Gold: 3,000 pts
- Platinum: 7,500 pts
- Diamond: 15,000 pts

### SeaCoin Rewards
- Base: 2 coins per euro spent
- Promotion multiplier: 1.5x
- Product-specific bonuses
- Mission rewards

## Localization

The app supports:
- **Portuguese (pt)**: Primary language for Portugal market
- **Chinese Simplified (zh)**: For Chinese restaurant owners

## License

Proprietary - All rights reserved
