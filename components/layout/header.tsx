'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Library, ShoppingBag, Repeat, GraduationCap, Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-burgundy-200 bg-white/95 backdrop-blur-sm dark:border-burgundy-800 dark:bg-gray-950/95">
      <div className="container mx-auto px-4">
        {/* Top bar with logo and search */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-burgundy-500 to-burgundy-700 text-white shadow-md">
              <span className="font-display text-2xl font-bold">Α</span>
            </div>
            <span className="hidden font-display text-2xl font-bold text-burgundy-700 dark:text-burgundy-400 md:inline">
              Alexandria
            </span>
          </Link>

          {/* Search bar - desktop */}
          <div className="mx-4 hidden flex-1 max-w-2xl md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search books, authors, disciplines..."
                className="w-full pl-10 search-focus"
              />
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center space-x-6 lg:flex">
            <Link
              href="/library"
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-burgundy-600 dark:text-gray-300 dark:hover:text-burgundy-400"
            >
              <Library className="h-4 w-4" />
              <span>Library</span>
            </Link>
            <Link
              href="/agora"
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-burgundy-600 dark:text-gray-300 dark:hover:text-burgundy-400"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Agora</span>
            </Link>
            <Link
              href="/match"
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-burgundy-600 dark:text-gray-300 dark:hover:text-burgundy-400"
            >
              <Repeat className="h-4 w-4" />
              <span>Match</span>
            </Link>
            <Link
              href="/academy"
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-burgundy-600 dark:text-gray-300 dark:hover:text-burgundy-400"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Academy</span>
            </Link>
          </nav>

          {/* Auth buttons - desktop */}
          <div className="hidden items-center space-x-3 lg:flex">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="default" size="sm">
              Sign Up
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile search */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-burgundy-200 py-4 dark:border-burgundy-800 lg:hidden">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/library"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-burgundy-50 dark:text-gray-300 dark:hover:bg-burgundy-950"
              >
                <Library className="h-5 w-5" />
                <span>Library</span>
              </Link>
              <Link
                href="/agora"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-burgundy-50 dark:text-gray-300 dark:hover:bg-burgundy-950"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Agora</span>
              </Link>
              <Link
                href="/match"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-burgundy-50 dark:text-gray-300 dark:hover:bg-burgundy-950"
              >
                <Repeat className="h-5 w-5" />
                <span>Match</span>
              </Link>
              <Link
                href="/academy"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-burgundy-50 dark:text-gray-300 dark:hover:bg-burgundy-950"
              >
                <GraduationCap className="h-5 w-5" />
                <span>Academy</span>
              </Link>
              <div className="flex flex-col space-y-2 pt-3">
                <Button variant="ghost" className="w-full justify-start">
                  Sign In
                </Button>
                <Button variant="default" className="w-full">
                  Sign Up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
