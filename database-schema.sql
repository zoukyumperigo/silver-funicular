-- ================================================
-- Alexandria Database Schema
-- Backend: Supabase (PostgreSQL 15+)
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================

CREATE TYPE book_category AS ENUM ('trivium', 'quadrivium');

CREATE TYPE discipline_type AS ENUM (
  'grammar',
  'logic',
  'rhetoric',
  'arithmetic',
  'geometry',
  'music',
  'astronomy'
);

CREATE TYPE book_condition AS ENUM (
  'new',
  'like_new',
  'very_good',
  'good',
  'acceptable'
);

CREATE TYPE book_format AS ENUM ('physical', 'digital', 'both');

CREATE TYPE availability_status AS ENUM (
  'available',
  'trading',
  'sold',
  'not_available'
);

CREATE TYPE wishlist_priority AS ENUM ('high', 'medium', 'low');

CREATE TYPE match_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'completed',
  'expired'
);

CREATE TYPE swipe_action AS ENUM ('like', 'dislike', 'superlike', 'skip');

CREATE TYPE listing_status AS ENUM ('active', 'sold', 'cancelled');

CREATE TYPE transaction_status AS ENUM (
  'pending',
  'paid',
  'shipped',
  'completed',
  'refunded',
  'cancelled'
);

CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE content_type AS ENUM ('video', 'text', 'mixed', 'quiz');

-- ================================================
-- USER PROFILES
-- ================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT, -- City-level only for privacy
  disciplines discipline_type[] DEFAULT '{}',
  reputation_score INTEGER DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create index on username for fast lookups
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_disciplines ON profiles USING GIN(disciplines);

-- ================================================
-- BOOKS
-- ================================================

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  category book_category NOT NULL,
  discipline discipline_type NOT NULL,
  description TEXT,
  cover_url TEXT,
  publisher TEXT,
  publication_year INTEGER,
  language TEXT DEFAULT 'en',
  page_count INTEGER,
  goodreads_id TEXT,
  open_library_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_year CHECK (publication_year > 1000 AND publication_year <= EXTRACT(YEAR FROM NOW()))
);

-- Indexes for book search and filtering
CREATE INDEX idx_books_title ON books USING GIN(to_tsvector('english', title));
CREATE INDEX idx_books_author ON books USING GIN(to_tsvector('english', author));
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_discipline ON books(discipline);
CREATE INDEX idx_books_isbn ON books(isbn);

-- ================================================
-- USER BOOK INVENTORY
-- ================================================

CREATE TABLE user_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  condition book_condition NOT NULL,
  format book_format NOT NULL,
  availability availability_status DEFAULT 'available',
  price DECIMAL(10, 2), -- null if not for sale, only for trade
  trade_preferences JSONB DEFAULT '{}', -- { "preferred_disciplines": [], "preferred_authors": [] }
  notes TEXT,
  location TEXT, -- Can differ from user's primary location
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_price CHECK (price IS NULL OR price > 0),
  UNIQUE(user_id, book_id, format) -- User can't have duplicate of same book format
);

-- Critical indexes for match algorithm
CREATE INDEX idx_user_books_user ON user_books(user_id);
CREATE INDEX idx_user_books_book ON user_books(book_id);
CREATE INDEX idx_user_books_availability ON user_books(availability) WHERE availability = 'available';
CREATE INDEX idx_user_books_trade_prefs ON user_books USING GIN(trade_preferences);

-- ================================================
-- WISHLISTS
-- ================================================

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  priority wishlist_priority DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_book ON wishlists(book_id);
CREATE INDEX idx_wishlists_priority ON wishlists(priority);

-- ================================================
-- SWIPE INTERACTIONS
-- ================================================

CREATE TABLE swipe_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_book_id UUID NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
  action swipe_action NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, target_book_id) -- Can't swipe on same book twice
);

CREATE INDEX idx_swipe_user ON swipe_interactions(user_id);
CREATE INDEX idx_swipe_target ON swipe_interactions(target_book_id);
CREATE INDEX idx_swipe_action ON swipe_interactions(action);

-- ================================================
-- BOOK MATCHES (The "Cross-Look" System)
-- ================================================

CREATE TABLE book_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_a_book_id UUID NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
  user_b_book_id UUID NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
  status match_status DEFAULT 'pending',
  match_score INTEGER DEFAULT 50, -- Algorithm confidence: 0-100
  user_a_accepted BOOLEAN DEFAULT FALSE,
  user_b_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  completed_at TIMESTAMPTZ,

  CONSTRAINT valid_match_score CHECK (match_score >= 0 AND match_score <= 100),
  CONSTRAINT different_users CHECK (user_a_id != user_b_id),
  CONSTRAINT different_books CHECK (user_a_book_id != user_b_book_id)
);

CREATE INDEX idx_matches_user_a ON book_matches(user_a_id);
CREATE INDEX idx_matches_user_b ON book_matches(user_b_id);
CREATE INDEX idx_matches_status ON book_matches(status);
CREATE INDEX idx_matches_created ON book_matches(created_at DESC);

-- ================================================
-- MARKETPLACE LISTINGS (The Agora)
-- ================================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_book_id UUID NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  shipping_options JSONB DEFAULT '{}', -- { "standard": 5.99, "express": 12.99, "pickup": 0 }
  status listing_status DEFAULT 'active',
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_listing_price CHECK (price > 0)
);

CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status) WHERE status = 'active';
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = TRUE;

-- ================================================
-- TRANSACTIONS
-- ================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT UNIQUE,
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_total CHECK (total_amount = amount + shipping_cost)
);

CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_listing ON transactions(listing_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ================================================
-- COURSES (The Academy)
-- ================================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category book_category NOT NULL,
  discipline discipline_type NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  thumbnail_url TEXT,
  status course_status DEFAULT 'draft',
  student_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status) WHERE status = 'published';
CREATE INDEX idx_courses_discipline ON courses(discipline);
CREATE INDEX idx_courses_slug ON courses(slug);

-- ================================================
-- LESSONS
-- ================================================

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_type content_type NOT NULL,
  content_url TEXT,
  content_text TEXT, -- For text-based lessons
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_preview BOOLEAN DEFAULT FALSE, -- Free preview lessons
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(course_id, slug),
  CONSTRAINT valid_order CHECK (order_index > 0)
);

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);

-- ================================================
-- ENROLLMENTS
-- ================================================

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}', -- { "lesson_id": { "completed": true, "completed_at": "timestamp" } }
  completion_percentage INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, course_id),
  CONSTRAINT valid_progress CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ================================================
-- REVIEWS & RATINGS
-- ================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT review_target CHECK (
    (reviewee_id IS NOT NULL AND course_id IS NULL) OR
    (reviewee_id IS NULL AND course_id IS NOT NULL)
  )
);

CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_course ON reviews(course_id);

-- ================================================
-- NOTIFICATIONS
-- ================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'match_found', 'trade_accepted', 'message', 'sale', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ================================================
-- MESSAGES (For match negotiations)
-- ================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES book_matches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Books table is publicly readable
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are viewable by everyone" ON books FOR SELECT USING (true);

-- Profiles: Public read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User Books: Public read (for discovery), users manage their own
CREATE POLICY "User books are viewable by everyone" ON user_books FOR SELECT USING (true);
CREATE POLICY "Users can insert own books" ON user_books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON user_books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON user_books FOR DELETE USING (auth.uid() = user_id);

-- Wishlists: Private, only owner can see/modify
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist items" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist items" ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- Swipe Interactions: Private
CREATE POLICY "Users can view own swipes" ON swipe_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own swipes" ON swipe_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Book Matches: Users can see matches they're part of
CREATE POLICY "Users can view their matches" ON book_matches
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users can update their matches" ON book_matches
  FOR UPDATE USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Listings: Public read, sellers manage their own
CREATE POLICY "Active listings are viewable by everyone" ON listings FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own listings" ON listings FOR ALL USING (auth.uid() = seller_id);

-- Notifications: Private
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_books_updated_at BEFORE UPDATE ON user_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to find potential matches
CREATE OR REPLACE FUNCTION find_potential_matches(p_user_id UUID)
RETURNS TABLE (
  match_user_id UUID,
  my_book_id UUID,
  their_book_id UUID,
  match_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH my_books AS (
    SELECT id, book_id FROM user_books
    WHERE user_id = p_user_id AND availability = 'available'
  ),
  my_wishlist AS (
    SELECT book_id FROM wishlists
    WHERE user_id = p_user_id
  ),
  users_who_want_my_books AS (
    SELECT DISTINCT w.user_id, w.book_id as wanted_book_id, mb.id as my_book_id
    FROM wishlists w
    INNER JOIN my_books mb ON w.book_id = mb.book_id
    WHERE w.user_id != p_user_id
  )
  SELECT
    uwmb.user_id,
    uwmb.my_book_id,
    ub.id as their_book_id,
    -- Simple scoring: base 50 + 25 if same discipline + 25 if good condition
    (50 +
     CASE WHEN b.discipline = b2.discipline THEN 25 ELSE 0 END +
     CASE WHEN ub.condition IN ('new', 'like_new') THEN 25 ELSE 0 END
    )::INTEGER as match_score
  FROM users_who_want_my_books uwmb
  INNER JOIN user_books ub ON ub.user_id = uwmb.user_id
  INNER JOIN my_wishlist mw ON mw.book_id = ub.book_id
  INNER JOIN books b ON b.id = ub.book_id
  INNER JOIN my_books mb ON mb.id = uwmb.my_book_id
  INNER JOIN books b2 ON b2.id = mb.book_id
  WHERE ub.availability = 'available'
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SEED DATA (Sample for testing)
-- ================================================

-- This will be populated via application or migration scripts
-- Sample disciplines mapping:
-- Trivium: Grammar (language, literature), Logic (philosophy, critical thinking), Rhetoric (communication, persuasion)
-- Quadrivium: Arithmetic (number theory), Geometry (spatial reasoning), Music (harmony, theory), Astronomy (celestial mechanics)
