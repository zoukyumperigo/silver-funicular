'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getDisciplineLabel, getDisciplineIcon } from '@/lib/utils';
import type { DisciplineType } from '@/types';

const TRIVIUM: DisciplineType[] = ['grammar', 'logic', 'rhetoric'];
const QUADRIVIUM: DisciplineType[] = ['arithmetic', 'geometry', 'music', 'astronomy'];

interface DisciplineCardProps {
  discipline: DisciplineType;
}

function DisciplineCard({ discipline }: DisciplineCardProps) {
  return (
    <Link href={`/library?discipline=${discipline}`}>
      <Card className="group cursor-pointer transition-all hover:border-burgundy-500 hover:shadow-card-hover">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 text-4xl transition-transform group-hover:scale-110">
            {getDisciplineIcon(discipline)}
          </div>
          <h3 className="font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
            {getDisciplineLabel(discipline)}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DisciplineNav() {
  return (
    <div className="space-y-8">
      {/* Trivium */}
      <div>
        <div className="mb-4 flex items-center">
          <div className="flex-1">
            <h2 className="font-display text-3xl font-bold text-burgundy-700 dark:text-burgundy-400">
              The Trivium
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              The foundation of classical learning: language, thought, and expression
            </p>
          </div>
          <Link
            href="/library?category=trivium"
            className="text-sm font-medium text-burgundy-600 hover:underline dark:text-burgundy-400"
          >
            Browse All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {TRIVIUM.map(discipline => (
            <DisciplineCard key={discipline} discipline={discipline} />
          ))}
        </div>
      </div>

      {/* Quadrivium */}
      <div>
        <div className="mb-4 flex items-center">
          <div className="flex-1">
            <h2 className="font-display text-3xl font-bold text-burgundy-700 dark:text-burgundy-400">
              The Quadrivium
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              The mathematical arts: number, space, harmony, and celestial motion
            </p>
          </div>
          <Link
            href="/library?category=quadrivium"
            className="text-sm font-medium text-burgundy-600 hover:underline dark:text-burgundy-400"
          >
            Browse All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {QUADRIVIUM.map(discipline => (
            <DisciplineCard key={discipline} discipline={discipline} />
          ))}
        </div>
      </div>
    </div>
  );
}
