import { BookCard } from '@/components/library/book-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid3x3, List } from 'lucide-react';
import { getDisciplineLabel, getCategoryLabel } from '@/lib/utils';
import type { DisciplineType } from '@/types';

// Mock data - will be replaced with database queries
const mockBooks = [
  {
    id: '1',
    title: 'The Republic',
    author: 'Plato',
    category: 'trivium' as const,
    discipline: 'logic' as const,
    cover_url: 'https://covers.openlibrary.org/b/id/8300152-L.jpg',
    language: 'en',
    description: 'A Socratic dialogue on justice and the ideal state.',
    publication_year: -380,
  },
  {
    id: '2',
    title: "Euclid's Elements",
    author: 'Euclid',
    category: 'quadrivium' as const,
    discipline: 'geometry' as const,
    cover_url: 'https://covers.openlibrary.org/b/id/8525550-L.jpg',
    language: 'en',
    description: 'The foundational work in geometry.',
    publication_year: -300,
  },
  {
    id: '3',
    title: 'On Rhetoric',
    author: 'Aristotle',
    category: 'trivium' as const,
    discipline: 'rhetoric' as const,
    cover_url: 'https://covers.openlibrary.org/b/id/8360839-L.jpg',
    language: 'en',
    description: 'The art of persuasion.',
    publication_year: -350,
  },
  {
    id: '4',
    title: 'Nicomachean Ethics',
    author: 'Aristotle',
    category: 'trivium' as const,
    discipline: 'logic' as const,
    cover_url: 'https://covers.openlibrary.org/b/id/8229886-L.jpg',
    language: 'en',
    description: 'Aristotle\'s work on ethics and virtue.',
    publication_year: -340,
  },
  {
    id: '5',
    title: 'The Almagest',
    author: 'Ptolemy',
    category: 'quadrivium' as const,
    discipline: 'astronomy' as const,
    language: 'en',
    description: 'Ancient astronomical treatise.',
    publication_year: 150,
  },
  {
    id: '6',
    title: 'Institutio Oratoria',
    author: 'Quintilian',
    category: 'trivium' as const,
    discipline: 'rhetoric' as const,
    language: 'en',
    description: 'Comprehensive training in rhetoric.',
    publication_year: 95,
  },
  {
    id: '7',
    title: 'De Institutione Arithmetica',
    author: 'Boethius',
    category: 'quadrivium' as const,
    discipline: 'arithmetic' as const,
    language: 'en',
    description: 'Foundation of medieval arithmetic.',
    publication_year: 500,
  },
  {
    id: '8',
    title: 'Ars Grammatica',
    author: 'Donatus',
    category: 'trivium' as const,
    discipline: 'grammar' as const,
    language: 'en',
    description: 'Classical Latin grammar textbook.',
    publication_year: 350,
  },
];

const disciplines: DisciplineType[] = [
  'grammar',
  'logic',
  'rhetoric',
  'arithmetic',
  'geometry',
  'music',
  'astronomy',
];

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-burgundy-200 bg-white dark:border-burgundy-800 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-4xl font-bold text-burgundy-700 dark:text-burgundy-400 md:text-5xl">
            The Library
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse the complete collection of Liberal Arts knowledge
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64">
            <div className="sticky top-20 space-y-6">
              {/* Category Filter */}
              <div className="rounded-lg border border-burgundy-200 bg-white p-4 dark:border-burgundy-800 dark:bg-gray-950">
                <h3 className="mb-3 font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
                  Category
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    All Categories
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    {getCategoryLabel('trivium')}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    {getCategoryLabel('quadrivium')}
                  </Button>
                </div>
              </div>

              {/* Discipline Filter */}
              <div className="rounded-lg border border-burgundy-200 bg-white p-4 dark:border-burgundy-800 dark:bg-gray-950">
                <h3 className="mb-3 font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
                  Disciplines
                </h3>
                <div className="flex flex-wrap gap-2">
                  {disciplines.map(discipline => (
                    <Badge
                      key={discipline}
                      variant="outline"
                      className="cursor-pointer hover:bg-burgundy-50 dark:hover:bg-burgundy-950"
                    >
                      {getDisciplineLabel(discipline)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div className="rounded-lg border border-burgundy-200 bg-white p-4 dark:border-burgundy-800 dark:bg-gray-950">
                <h3 className="mb-3 font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
                  Book Condition
                </h3>
                <div className="space-y-2">
                  {['New', 'Like New', 'Very Good', 'Good', 'Acceptable'].map(condition => (
                    <label key={condition} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-burgundy-300 text-burgundy-600 focus:ring-burgundy-500"
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format Filter */}
              <div className="rounded-lg border border-burgundy-200 bg-white p-4 dark:border-burgundy-800 dark:bg-gray-950">
                <h3 className="mb-3 font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
                  Format
                </h3>
                <div className="space-y-2">
                  {['Physical', 'Digital', 'Both'].map(format => (
                    <label key={format} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-burgundy-300 text-burgundy-600 focus:ring-burgundy-500"
                      />
                      <span>{format}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search and View Options */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by title, author, ISBN..."
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Sort
                </Button>
                <div className="flex rounded-md border border-burgundy-200 dark:border-burgundy-800">
                  <Button variant="ghost" size="icon" className="rounded-r-none">
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-l-none">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold">{mockBooks.length}</span> books
              </p>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {mockBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Load More */}
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg">
                Load More Books
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
