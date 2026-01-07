export * from './database';

// Additional types for the application

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: 'trivium' | 'quadrivium';
  discipline: string;
  description?: string;
  cover_url?: string;
  publisher?: string;
  publication_year?: number;
  language: string;
}

export interface UserBook extends Book {
  user_book_id: string;
  condition: string;
  format: string;
  availability: string;
  price?: number;
  owner: {
    id: string;
    username: string;
    avatar_url?: string;
    location?: string;
  };
}

export interface Match {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    reputation_score: number;
  };
  my_book: Book;
  their_book: Book;
  match_score: number;
  status: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: 'trivium' | 'quadrivium';
  discipline: string;
  price: number;
  thumbnail_url?: string;
  instructor: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  student_count: number;
  rating: number;
}
