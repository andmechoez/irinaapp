import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightElement?: ReactNode;
  error?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, rightElement, error, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full h-[40px] px-3 py-2 min-w-0
            rounded-[var(--radius-md)] border border-border 
            bg-bg-card text-text-primary text-sm
            focus:border-salud-blue focus:ring-2 focus:ring-salud-blue/20 focus:outline-none
            transition-all duration-200 placeholder:text-text-tertiary
            ${icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${error ? 'border-salud-red focus:border-salud-red focus:ring-salud-red/20' : ''}
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
