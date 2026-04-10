import React from 'react';
import { cn } from './utils.js';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'glass rounded-lg border border-[rgba(200,170,120,0.08)] shadow-[var(--shadow-md)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <div
      className={cn('text-base font-bold tracking-[-0.01em] text-[var(--text)]', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <div className={cn('text-sm text-[var(--text3)]', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}

