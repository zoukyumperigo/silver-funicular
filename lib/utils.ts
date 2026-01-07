import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge to resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in USD
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Format date in relative format (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get discipline display name
 */
export function getDisciplineLabel(discipline: string): string {
  const labels: Record<string, string> = {
    grammar: 'Grammar',
    logic: 'Logic',
    rhetoric: 'Rhetoric',
    arithmetic: 'Arithmetic',
    geometry: 'Geometry',
    music: 'Music',
    astronomy: 'Astronomy',
  };
  return labels[discipline] || discipline;
}

/**
 * Get discipline icon (emoji)
 */
export function getDisciplineIcon(discipline: string): string {
  const icons: Record<string, string> = {
    grammar: '📖',
    logic: '🧠',
    rhetoric: '🗣️',
    arithmetic: '🔢',
    geometry: '📐',
    music: '🎵',
    astronomy: '🌌',
  };
  return icons[discipline] || '📚';
}

/**
 * Get category label
 */
export function getCategoryLabel(category: 'trivium' | 'quadrivium'): string {
  return category === 'trivium' ? 'Trivium' : 'Quadrivium';
}

/**
 * Get book condition badge color
 */
export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    new: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    like_new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    very_good: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    good: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    acceptable: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };
  return colors[condition] || '';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
