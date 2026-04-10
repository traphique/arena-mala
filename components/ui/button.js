import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-95',
        ghost: 'bg-transparent hover:bg-[rgba(200,170,120,0.06)] text-[var(--text2)]',
        glass:
          'bg-[rgba(200,170,120,0.06)] text-[var(--text2)] border border-[rgba(200,170,120,0.12)] hover:bg-[rgba(212,148,60,0.12)] hover:text-[var(--accent)]',
        danger:
          'bg-[rgba(239,83,80,0.12)] text-[var(--red)] border border-[rgba(239,83,80,0.25)] hover:bg-[rgba(239,83,80,0.18)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'glass',
      size: 'md',
    },
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

