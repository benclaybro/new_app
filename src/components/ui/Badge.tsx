import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: string;
  children: React.ReactNode;
}

export const Badge = ({ variant, children, className, ...props }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};