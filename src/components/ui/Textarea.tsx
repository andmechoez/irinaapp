import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          className={`
            w-full px-3 py-2 min-w-0
            rounded-[var(--radius-md)] border-2 border-border 
            bg-bg-card text-text-primary text-sm
            focus:border-salud-blue focus:ring-2 focus:ring-salud-blue/20 focus:outline-none
            transition-all duration-200 placeholder:text-text-tertiary resize-y
            ${error ? 'border-salud-red focus:border-salud-red focus:ring-salud-red/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
