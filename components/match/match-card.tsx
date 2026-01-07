'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, X, Star, ArrowDownUp } from 'lucide-react';
import { getDisciplineLabel } from '@/lib/utils';
import type { UserBook } from '@/types';

interface MatchCardProps {
  book: UserBook;
  onSwipe: (direction: 'like' | 'dislike' | 'superlike') => void;
}

const SWIPE_THRESHOLD = 100;

export function MatchCard({ book, onSwipe }: MatchCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      // Swiped far enough
      setExitX(info.offset.x > 0 ? 1000 : -1000);
      onSwipe(info.offset.x > 0 ? 'like' : 'dislike');
    } else {
      // Snap back
      x.set(0);
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
    >
      <Card className="overflow-hidden">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={book.cover_url || '/images/book-placeholder.png'}
            alt={book.title}
            fill
            className="object-cover"
            draggable={false}
            sizes="(max-width: 640px) 100vw, 640px"
          />

          {/* Swipe indicators */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-green-500/80"
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          >
            <Heart className="h-24 w-24 text-white" />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-red-500/80"
            style={{ opacity: useTransform(x, [0, -100], [0, 1]) }}
          >
            <X className="h-24 w-24 text-white" />
          </motion.div>

          {/* Book info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <div className="mb-2 flex gap-2">
              <Badge variant="gold">{getDisciplineLabel(book.discipline)}</Badge>
              <Badge variant="secondary">{book.condition.replace('_', ' ')}</Badge>
            </div>
            <h2 className="font-serif text-2xl font-bold">{book.title}</h2>
            <p className="mt-1 text-lg">{book.author}</p>
            {book.owner && (
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20" />
                <div>
                  <p className="text-sm font-medium">@{book.owner.username}</p>
                  {book.owner.location && (
                    <p className="text-xs opacity-80">{book.owner.location}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => onSwipe('dislike')}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="gold"
              size="lg"
              className="flex-1"
              onClick={() => onSwipe('superlike')}
            >
              <Star className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => onSwipe('like')}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Swipe right if you want to trade, left to skip
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
