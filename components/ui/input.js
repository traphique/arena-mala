import React from 'react';
import { cn } from './utils.js';

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-[rgba(200,170,120,0.12)] bg-[rgba(200,170,120,0.04)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
        className
      )}
      {...props}
    />
  );
});

