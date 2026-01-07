'use client';

import { useState } from 'react';
import { MatchCard } from '@/components/match/match-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, TrendingUp } from 'lucide-react';
import type { UserBook } from '@/types';

// Mock data for the match feed
const mockMatchFeed: UserBook[] = [
  {
    id: '1',
    user_book_id: 'ub1',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'trivium',
    discipline: 'logic',
    cover_url: 'https://covers.openlibrary.org/b/id/8282947-L.jpg',
    language: 'en',
    condition: 'very_good',
    format: 'physical',
    availability: 'available',
    owner: {
      id: 'user1',
      username: 'stoic_reader',
      avatar_url: undefined,
      location: 'Athens, GA',
    },
  },
  {
    id: '2',
    user_book_id: 'ub2',
    title: 'Phaedrus',
    author: 'Plato',
    category: 'trivium',
    discipline: 'rhetoric',
    cover_url: 'https://covers.openlibrary.org/b/id/8267916-L.jpg',
    language: 'en',
    condition: 'like_new',
    format: 'physical',
    availability: 'available',
    owner: {
      id: 'user2',
      username: 'philosophy_fan',
      avatar_url: undefined,
      location: 'Cambridge, MA',
    },
  },
  {
    id: '3',
    user_book_id: 'ub3',
    title: 'The Quadrivium',
    author: 'Various Authors',
    category: 'quadrivium',
    discipline: 'arithmetic',
    language: 'en',
    condition: 'new',
    format: 'physical',
    availability: 'available',
    owner: {
      id: 'user3',
      username: 'math_scholar',
      avatar_url: undefined,
      location: 'Princeton, NJ',
    },
  },
];

export default function MatchPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState(0);
  const [likes, setLikes] = useState(0);

  const handleSwipe = (direction: 'like' | 'dislike' | 'superlike') => {
    if (direction === 'like' || direction === 'superlike') {
      setLikes(prev => prev + 1);
      // In real app, check if it's a mutual match
      if (Math.random() > 0.7) {
        setMatches(prev => prev + 1);
      }
    }

    // Move to next card
    setCurrentIndex(prev => (prev + 1) % mockMatchFeed.length);
  };

  const currentBook = mockMatchFeed[currentIndex];

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-burgundy-200 bg-white dark:border-burgundy-800 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-4xl font-bold text-burgundy-700 dark:text-burgundy-400 md:text-5xl">
            Book Matching
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Discover books from other scholars and find your perfect trading partners
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <Heart className="mb-2 h-8 w-8 text-burgundy-500" />
              <div className="font-display text-3xl font-bold text-burgundy-700 dark:text-burgundy-400">
                {likes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <Sparkles className="mb-2 h-8 w-8 text-gold-500" />
              <div className="font-display text-3xl font-bold text-burgundy-700 dark:text-burgundy-400">
                {matches}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Matches</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <TrendingUp className="mb-2 h-8 w-8 text-green-500" />
              <div className="font-display text-3xl font-bold text-burgundy-700 dark:text-burgundy-400">
                85%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Match Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Match Feed */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardContent className="p-0">
                {mockMatchFeed.length > 0 ? (
                  <div className="relative mx-auto flex min-h-[600px] max-w-md items-center justify-center">
                    <MatchCard book={currentBook} onSwipe={handleSwipe} />
                  </div>
                ) : (
                  <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
                    <div className="mb-4 text-6xl">📚</div>
                    <h3 className="font-serif text-2xl font-semibold text-burgundy-700 dark:text-burgundy-400">
                      No more books for now
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Check back later for new potential matches!
                    </p>
                    <Button variant="default" className="mt-6">
                      Adjust Preferences
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mt-4 bg-burgundy-50 dark:bg-burgundy-950/20">
              <CardContent className="p-6">
                <h3 className="mb-3 font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
                  How Matching Works
                </h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>Swipe Right (Like):</strong> Interested in trading for this book
                  </p>
                  <p>
                    <strong>Swipe Left (Pass):</strong> Not interested right now
                  </p>
                  <p>
                    <strong>Star (Super Like):</strong> Really want this book—owner gets notified!
                  </p>
                  <p className="mt-4 text-burgundy-600 dark:text-burgundy-400">
                    When you like a book from someone who wants one of yours, it's a match! You'll
                    both be notified to arrange a trade.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Your Matches */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-serif text-xl font-semibold text-burgundy-700 dark:text-burgundy-400">
                  Recent Matches
                </h3>

                {matches > 0 ? (
                  <div className="space-y-4">
                    {Array.from({ length: Math.min(matches, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-burgundy-200 p-3 dark:border-burgundy-800"
                      >
                        <div className="h-12 w-12 rounded bg-parchment-200 dark:bg-parchment-800" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">New Match!</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {['stoic_reader', 'philosophy_fan', 'math_scholar'][i % 3]}
                          </p>
                        </div>
                        <Badge variant="gold">New</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-3 text-4xl">💫</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No matches yet. Keep swiping!
                    </p>
                  </div>
                )}

                <Button variant="outline" className="mt-4 w-full">
                  View All Matches
                </Button>
              </CardContent>
            </Card>

            {/* Match Preferences */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="mb-4 font-serif text-xl font-semibold text-burgundy-700 dark:text-burgundy-400">
                  Your Preferences
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Preferred Disciplines</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="gold">Logic</Badge>
                      <Badge variant="secondary">Geometry</Badge>
                      <Badge variant="secondary">Rhetoric</Badge>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Distance</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Within 50 miles</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Condition</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Good or better
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="mt-4 w-full">
                  Edit Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
