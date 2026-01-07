import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'gold';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'border-transparent bg-burgundy-500 text-white': variant === 'default',
          'border-transparent bg-parchment-200 text-burgundy-900 dark:bg-parchment-800 dark:text-parchment-100':
            variant === 'secondary',
          'border-transparent bg-red-600 text-white': variant === 'destructive',
          'border-burgundy-300 text-burgundy-700 dark:border-burgundy-700 dark:text-burgundy-400':
            variant === 'outline',
          'border-transparent bg-gold-500 text-white': variant === 'gold',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
