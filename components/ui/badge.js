import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './utils.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[rgba(200,170,120,0.12)] bg-[rgba(200,170,120,0.06)] text-[var(--text2)]',
        primary: 'border-[rgba(212,148,60,0.18)] bg-[rgba(212,148,60,0.12)] text-[var(--accent)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

