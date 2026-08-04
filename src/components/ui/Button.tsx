import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-salud-blue text-white hover:bg-salud-blue-light active:scale-[0.97] shadow-md hover:shadow-lg',
  secondary:
    'bg-salud-blue-soft text-salud-blue hover:bg-blue-200 active:scale-[0.97]',
  ghost:
    'bg-transparent text-text-secondary hover:bg-bg-elevated active:scale-[0.97]',
  danger:
    'bg-salud-red-soft text-salud-red hover:bg-red-200 active:scale-[0.97]',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs min-h-[32px]',
  md: 'px-4 py-2 text-sm min-h-[40px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-[var(--radius-md)]
        transition-all duration-200 ease-out
        cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
