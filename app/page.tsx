import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DisciplineNav } from '@/components/library/discipline-nav';
import { BookCard } from '@/components/library/book-card';
import { ArrowRight, TrendingUp, Users, BookOpen, Zap } from 'lucide-react';

// Mock data - will be replaced with actual database queries
const featuredBooks = [
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
    description: 'The foundational work in geometry and mathematical reasoning.',
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
    description: 'The classical treatise on the art of persuasion.',
    publication_year: -350,
  },
  {
    id: '4',
    title: 'De Harmonica Institutione',
    author: 'Boethius',
    category: 'quadrivium' as const,
    discipline: 'music' as const,
    language: 'en',
    description: 'The medieval foundation of music theory.',
    publication_year: 500,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-burgundy-700 via-burgundy-600 to-burgundy-800 text-white">
        <div className="absolute inset-0 bg-[url('/patterns/greek-key.svg')] opacity-10" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              The Modern Library of Alexandria
            </h1>
            <p className="mt-6 text-lg text-burgundy-100 md:text-xl">
              Discover, trade, and master the Liberal Arts. Join a community dedicated to the
              Trivium and Quadrivium—the foundation of classical learning.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="gold" className="text-lg" asChild>
                <Link href="/library">
                  Explore the Library
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                asChild
              >
                <Link href="/match">
                  Start Trading Books
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: BookOpen, label: 'Books', value: '10,000+' },
              { icon: Users, label: 'Scholars', value: '5,000+' },
              { icon: TrendingUp, label: 'Trades', value: '2,500+' },
              { icon: Zap, label: 'Matches', value: '500/day' },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm"
              >
                <stat.icon className="mx-auto mb-2 h-8 w-8 text-gold-400" />
                <div className="font-display text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 text-sm text-burgundy-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="bg-white py-16 dark:bg-gray-950 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-burgundy-700 dark:text-burgundy-400 md:text-4xl">
                Featured in the Library
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Timeless works from the greatest minds in history
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/library">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {featuredBooks.map(book => (
              <BookCard key={book.id} book={book} showActions={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines Navigation */}
      <section className="parchment-bg py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-burgundy-700 dark:text-burgundy-400 md:text-4xl">
              Explore by Discipline
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Navigate the seven classical liberal arts
            </p>
          </div>

          <DisciplineNav />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 dark:bg-gray-950 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-burgundy-700 dark:text-burgundy-400 md:text-4xl">
              How Alexandria Works
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your journey to classical knowledge in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Build Your Library',
                description:
                  'Add books you own and create a wishlist of works you want to study. Categorize by the Trivium and Quadrivium.',
                icon: '📚',
              },
              {
                step: '2',
                title: 'Discover Matches',
                description:
                  'Our algorithm finds perfect trading partners—users who have what you want and want what you have.',
                icon: '🔄',
              },
              {
                step: '3',
                title: 'Trade or Buy',
                description:
                  'Connect with scholars, trade books, or purchase from the Agora. Join Academy courses to deepen your knowledge.',
                icon: '🤝',
              },
            ].map((item, i) => (
              <Card key={i} className="scholarly-card text-center">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold mx-auto text-3xl">
                    {item.icon}
                  </div>
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-burgundy-500 font-serif text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-burgundy-700 dark:text-burgundy-400">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-burgundy-700 to-burgundy-900 py-16 text-white md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Ready to Begin Your Classical Education?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-burgundy-100">
            Join thousands of scholars exploring the timeless wisdom of the Liberal Arts.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="gold" className="text-lg" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              asChild
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
