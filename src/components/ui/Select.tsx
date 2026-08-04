import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  className?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`
            w-full h-[40px] px-3 py-2 min-w-0
            rounded-[var(--radius-md)] border border-border 
            bg-bg-card text-text-primary text-sm
            focus:border-salud-blue focus:ring-2 focus:ring-salud-blue/20 focus:outline-none
            transition-all duration-200
            ${error ? 'border-salud-red focus:border-salud-red focus:ring-salud-red/20' : ''}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
