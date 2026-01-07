'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Repeat } from 'lucide-react';
import { getDisciplineLabel, formatPrice } from '@/lib/utils';
import type { Book, UserBook } from '@/types';

interface BookCardProps {
  book: Book | UserBook;
  showActions?: boolean;
}

function isUserBook(book: Book | UserBook): book is UserBook {
  return 'user_book_id' in book;
}

export function BookCard({ book, showActions = true }: BookCardProps) {
  const coverUrl = book.cover_url || '/images/book-placeholder.png';
  const userBook = isUserBook(book) ? book : null;

  return (
    <Card className="group overflow-hidden">
      <Link href={`/library/book/${book.id}`}>
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-parchment-100 dark:bg-parchment-900">
          <Image
            src={coverUrl}
            alt={book.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant="gold" className="text-xs">
              {getDisciplineLabel(book.discipline)}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/library/book/${book.id}`}>
          <h3 className="font-serif text-lg font-semibold line-clamp-2 hover:text-burgundy-600 dark:hover:text-burgundy-400">
            {book.title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{book.author}</p>

        {userBook && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {userBook.condition.replace('_', ' ')}
            </Badge>
            {userBook.price && (
              <span className="font-serif text-lg font-semibold text-burgundy-600 dark:text-burgundy-400">
                {formatPrice(userBook.price)}
              </span>
            )}
          </div>
        )}

        {userBook?.owner && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-parchment-200 dark:bg-parchment-800" />
            <Link
              href={`/profile/${userBook.owner.username}`}
              className="text-xs text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
            >
              @{userBook.owner.username}
            </Link>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="grid grid-cols-3 gap-2 p-4 pt-0">
          <Button variant="outline" size="sm" title="Add to Wishlist">
            <Heart className="h-4 w-4" />
          </Button>
          {userBook?.price ? (
            <Button variant="default" size="sm" className="col-span-2" title="Buy Now">
              <ShoppingCart className="mr-1 h-4 w-4" />
              Buy
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="col-span-2" title="Find Trade">
              <Repeat className="mr-1 h-4 w-4" />
              Trade
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
