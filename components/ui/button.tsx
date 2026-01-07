import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gold';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-burgundy-500 text-white hover:bg-burgundy-600 focus-visible:ring-burgundy-500':
              variant === 'default',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600':
              variant === 'destructive',
            'border-2 border-burgundy-500 bg-transparent text-burgundy-700 hover:bg-burgundy-50 dark:text-burgundy-400 dark:hover:bg-burgundy-950':
              variant === 'outline',
            'bg-parchment-200 text-burgundy-900 hover:bg-parchment-300 dark:bg-parchment-800 dark:text-parchment-100':
              variant === 'secondary',
            'hover:bg-parchment-100 hover:text-burgundy-900 dark:hover:bg-parchment-800':
              variant === 'ghost',
            'text-burgundy-600 underline-offset-4 hover:underline dark:text-burgundy-400':
              variant === 'link',
            'bg-gold-500 text-white hover:bg-gold-600 focus-visible:ring-gold-500':
              variant === 'gold',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
