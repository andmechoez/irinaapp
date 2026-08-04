import type { ReactNode } from 'react';

// =============================================
// Badge — Etiquetas de estado y categoría
// =============================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-bg-elevated text-text-secondary',
  success: 'bg-salud-green-soft text-salud-green',
  warning: 'bg-salud-amber-soft text-salud-amber',
  danger: 'bg-salud-red-soft text-salud-red',
  info: 'bg-salud-blue-soft text-salud-blue',
  purple: 'bg-purple-100 text-purple-700',
};

const dotColors: Record<string, string> = {
  default: 'bg-text-tertiary',
  success: 'bg-salud-green',
  warning: 'bg-salud-amber',
  danger: 'bg-salud-red',
  info: 'bg-salud-blue',
  purple: 'bg-purple-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function Badge({ children, variant = 'default', size = 'sm', dot = false, className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-bold
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
