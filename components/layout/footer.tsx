import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-burgundy-200 bg-parchment-100 dark:border-burgundy-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-burgundy-500 to-burgundy-700 text-white shadow-md">
                <span className="font-display text-2xl font-bold">Α</span>
              </div>
              <span className="font-display text-xl font-bold text-burgundy-700 dark:text-burgundy-400">
                Alexandria
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              The digital successor to the ancient Library of Alexandria. Preserving and sharing
              Liberal Arts knowledge for the modern age.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
              Explore
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/library"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  The Library
                </Link>
              </li>
              <li>
                <Link
                  href="/agora"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  The Agora
                </Link>
              </li>
              <li>
                <Link
                  href="/match"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  Book Matching
                </Link>
              </li>
              <li>
                <Link
                  href="/academy"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  The Academy
                </Link>
              </li>
            </ul>
          </div>

          {/* Disciplines */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
              Disciplines
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/library?category=trivium"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  The Trivium
                </Link>
              </li>
              <li>
                <Link
                  href="/library?category=quadrivium"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  The Quadrivium
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-burgundy-700 dark:text-burgundy-400">
              Company
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-burgundy-600 dark:text-gray-400 dark:hover:text-burgundy-400"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-burgundy-200 pt-8 text-center text-sm text-gray-600 dark:border-burgundy-800 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Alexandria. All rights reserved. Built with reverence
            for classical learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
