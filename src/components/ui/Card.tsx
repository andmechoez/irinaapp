import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  onClick?: () => void;
}

const paddingStyles: Record<string, string> = {
  sm: 'p-4', // 16px
  md: 'p-6', // 24px
  lg: 'p-8', // 32px
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  animate = true,
  onClick,
}: CardProps) {
  return (
    <div
      className={`
        bg-bg-card rounded-[var(--radius-xl)]
        border border-border/60
        shadow-[var(--shadow-card)]
        transition-all duration-300 ease-out
        ${onClick ? 'cursor-pointer hover:shadow-[var(--shadow-card-hover)] active:scale-[0.98]' : ''}
        ${animate ? 'animate-slide-up' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}
