# Alexandria - System Architecture

## 🏛️ Vision
Alexandria is the world's premier digital community for Liberal Arts knowledge, combining classical education principles with modern marketplace dynamics.

## 📐 Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Alexandria Platform                       │
├─────────────────────────────────────────────────────────────┤
│  Browser App (React/Next.js)                                 │
│  ├── The Library (Content Repository)                        │
│  ├── The Agora (Marketplace)                                 │
│  ├── The Match System (Book Trading)                         │
│  └── The Academy (Educational Content)                       │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Next.js API Routes)                              │
│  ├── Authentication & Authorization                          │
│  ├── Book Management                                         │
│  ├── Match Algorithm Engine                                  │
│  ├── Transaction Processing                                  │
│  └── Search & Discovery                                      │
├─────────────────────────────────────────────────────────────┤
│  Backend Services (Supabase)                                 │
│  ├── PostgreSQL Database                                     │
│  ├── Real-time Subscriptions                                 │
│  ├── Storage (Book covers, PDFs, videos)                     │
│  ├── Authentication (Email, OAuth)                           │
│  └── Edge Functions                                          │
├─────────────────────────────────────────────────────────────┤
│  External Services                                            │
│  ├── Payment Gateway (Stripe)                                │
│  ├── Email Service (SendGrid/Resend)                         │
│  ├── Search Engine (Algolia/Meilisearch)                     │
│  └── CDN (Vercel Edge Network)                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Authentication**: NextAuth.js + Supabase Auth

### Design System: "Academic-Chic"
- **Typography**: Crimson Text, EB Garamond (serif) + Inter (sans-serif)
- **Color Palette**:
  - Primary: Parchment (#F4ECD8)
  - Secondary: Deep Burgundy (#800020)
  - Accent: Academic Gold (#B8860B)
  - Dark Mode: Charcoal (#1E1E1E) with Ivory text
- **Textures**: Subtle parchment overlays, embossed borders
- **Components**: Card-based layouts, scholarly aesthetics

### Key Pages/Routes
```
/                         → Landing + Dashboard
/library                  → The Library (categorized content)
  /library/trivium        → Grammar, Logic, Rhetoric
  /library/quadrivium     → Arithmetic, Geometry, Music, Astronomy
/agora                    → Marketplace (buy/sell books)
  /agora/book/:id         → Individual book listing
/match                    → Book trading interface (swipe/discover)
/academy                  → Classes and tutorials
  /academy/course/:id     → Individual course
/profile/:username        → User profile + inventory
/settings                 → Account settings
```

## 🗄️ Backend Architecture (Supabase)

### Why Supabase?
1. **PostgreSQL**: Robust relational database with ACID compliance
2. **Real-time**: WebSocket subscriptions for match notifications
3. **Row-Level Security**: Fine-grained access control
4. **Storage**: Built-in file storage for book covers, PDFs
5. **Edge Functions**: Serverless functions for complex logic
6. **Type Safety**: Auto-generated TypeScript types

### Database Schema (Core Tables)

#### Users & Profiles
```sql
users (managed by Supabase Auth)
  - id (uuid, primary key)
  - email (text)
  - created_at (timestamp)

profiles
  - id (uuid, foreign key → users.id)
  - username (text, unique)
  - full_name (text)
  - bio (text)
  - avatar_url (text)
  - location (text)
  - disciplines (text[]) -- Trivium/Quadrivium interests
  - created_at (timestamp)
  - updated_at (timestamp)
```

#### Books & Inventory
```sql
books
  - id (uuid, primary key)
  - title (text)
  - author (text)
  - isbn (text, unique)
  - category (enum: trivium, quadrivium)
  - discipline (enum: grammar, logic, rhetoric, arithmetic, geometry, music, astronomy)
  - description (text)
  - cover_url (text)
  - publisher (text)
  - publication_year (int)
  - language (text)
  - created_at (timestamp)

user_books (User's book inventory)
  - id (uuid, primary key)
  - user_id (uuid, foreign key → users.id)
  - book_id (uuid, foreign key → books.id)
  - condition (enum: new, like_new, very_good, good, acceptable)
  - format (enum: physical, digital, both)
  - availability (enum: available, trading, sold, not_available)
  - price (decimal) -- null if not for sale
  - trade_preferences (jsonb) -- What they want in return
  - notes (text)
  - created_at (timestamp)
  - updated_at (timestamp)
```

#### Match System
```sql
wishlists
  - id (uuid, primary key)
  - user_id (uuid, foreign key → users.id)
  - book_id (uuid, foreign key → books.id)
  - priority (enum: high, medium, low)
  - created_at (timestamp)

book_matches
  - id (uuid, primary key)
  - user_a_id (uuid, foreign key → users.id)
  - user_b_id (uuid, foreign key → users.id)
  - user_a_book_id (uuid, foreign key → user_books.id)
  - user_b_book_id (uuid, foreign key → user_books.id)
  - status (enum: pending, accepted, declined, completed)
  - match_score (int) -- Algorithm confidence score
  - created_at (timestamp)
  - expires_at (timestamp)

swipe_interactions
  - id (uuid, primary key)
  - user_id (uuid, foreign key → users.id)
  - target_book_id (uuid, foreign key → user_books.id)
  - action (enum: like, dislike, superlike, skip)
  - created_at (timestamp)
```

#### Marketplace (Agora)
```sql
listings
  - id (uuid, primary key)
  - seller_id (uuid, foreign key → users.id)
  - user_book_id (uuid, foreign key → user_books.id)
  - price (decimal)
  - shipping_options (jsonb)
  - status (enum: active, sold, cancelled)
  - views (int)
  - created_at (timestamp)
  - updated_at (timestamp)

transactions
  - id (uuid, primary key)
  - listing_id (uuid, foreign key → listings.id)
  - buyer_id (uuid, foreign key → users.id)
  - seller_id (uuid, foreign key → users.id)
  - amount (decimal)
  - status (enum: pending, paid, shipped, completed, refunded)
  - stripe_payment_intent_id (text)
  - created_at (timestamp)
```

#### Academy
```sql
courses
  - id (uuid, primary key)
  - instructor_id (uuid, foreign key → users.id)
  - title (text)
  - description (text)
  - category (enum: trivium, quadrivium)
  - discipline (enum)
  - price (decimal)
  - thumbnail_url (text)
  - status (enum: draft, published, archived)
  - created_at (timestamp)

lessons
  - id (uuid, primary key)
  - course_id (uuid, foreign key → courses.id)
  - title (text)
  - content_type (enum: video, text, mixed)
  - content_url (text)
  - order_index (int)
  - duration_minutes (int)
  - created_at (timestamp)

enrollments
  - id (uuid, primary key)
  - user_id (uuid, foreign key → users.id)
  - course_id (uuid, foreign key → courses.id)
  - progress (jsonb) -- lesson completion tracking
  - enrolled_at (timestamp)
```

## 🔄 Match Algorithm Logic

### Cross-Look Book Matching

#### Matching Criteria
1. **Primary Match**: User A has Book X that User B wants, AND User B has Book Y that User A wants
2. **Secondary Factors**:
   - Geographic proximity (shipping costs)
   - Book condition compatibility
   - User ratings/reputation
   - Discipline alignment

#### Algorithm Flow
```typescript
// Pseudocode
function findMatches(userId: string) {
  // 1. Get user's available books
  const userBooks = getUserBooks(userId, { availability: 'available' });

  // 2. Get user's wishlist
  const wishlist = getUserWishlist(userId);

  // 3. Find users who want any of my books
  const interestedUsers = findUsersWithWishlistItems(userBooks);

  // 4. Check if those users have any of my wishlist items
  const matches = interestedUsers.filter(otherUser => {
    const theirBooks = getUserBooks(otherUser.id);
    return theirBooks.some(book =>
      wishlist.includes(book.book_id)
    );
  });

  // 5. Calculate match score
  return matches.map(match => ({
    ...match,
    score: calculateMatchScore(match)
  })).sort((a, b) => b.score - a.score);
}
```

### Swipe Interface Logic
- **Like**: Add to potential matches
- **Dislike**: Hide from feed
- **Super Like**: Priority notification to other user
- **Skip**: Temporarily hide, may reappear later

When mutual interest detected → Create `book_matches` record → Send real-time notifications

## 🔐 Security & Privacy

### Authentication Flow
1. Email/password or OAuth (Google, GitHub)
2. JWT tokens managed by Supabase
3. Refresh token rotation

### Authorization (Row-Level Security)
```sql
-- Example RLS policy
CREATE POLICY "Users can view their own books"
  ON user_books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public listings"
  ON listings FOR SELECT
  USING (status = 'active');
```

### Data Protection
- Passwords: Hashed with bcrypt
- Payment info: Never stored (Stripe handles)
- User locations: Fuzzy (city-level only)

## 🚀 Performance Optimizations

### Caching Strategy
- **Static Pages**: ISR (Incremental Static Regeneration)
- **API Responses**: React Query with stale-while-revalidate
- **Images**: Next.js Image Optimization + Vercel CDN
- **Search**: Algolia index for instant results

### Database Indexes
```sql
-- Critical indexes for performance
CREATE INDEX idx_user_books_user_id ON user_books(user_id);
CREATE INDEX idx_user_books_availability ON user_books(availability);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_book_matches_users ON book_matches(user_a_id, user_b_id);
CREATE INDEX idx_books_discipline ON books(discipline);
```

## 📱 Mobile Strategy (Phase 2)

### Capacitor vs React Native
**Recommendation: Capacitor**
- Reuse 95% of web codebase
- Native plugins for camera (book scanning)
- Push notifications
- Easier maintenance

### Mobile-Specific Features
- Barcode scanning for book ISBN
- Offline library access
- Push notifications for matches
- Location-based discovery

## 🧪 Testing Strategy

### Frontend
- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Visual Regression**: Chromatic/Percy

### Backend
- **API Tests**: Supertest
- **Database Tests**: pg-tap
- **Load Testing**: k6

## 📊 Analytics & Monitoring

### User Analytics
- PostHog or Mixpanel
- Track: book views, match success rate, conversion rates

### Error Tracking
- Sentry for frontend/backend errors
- Supabase logging for database queries

### Performance Monitoring
- Vercel Analytics
- Core Web Vitals tracking

## 🔮 Scalability Considerations

### Database
- **Current**: Single Supabase PostgreSQL instance
- **Future**: Read replicas for geographic distribution
- **Caching**: Redis for match algorithm results

### File Storage
- Supabase Storage → Cloudflare R2 (if cost optimization needed)
- Image transformations at edge

### Search
- **Phase 1**: PostgreSQL full-text search
- **Phase 2**: Algolia for sub-100ms results
- **Phase 3**: AI-powered semantic search

---

**Last Updated**: 2026-01-06
**Version**: 1.0.0
