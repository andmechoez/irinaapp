import type { ReactNode } from 'react';
import { FileX } from 'lucide-react';

// =============================================
// EmptyState — Estado vacío para listas/tablas
// =============================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
        {icon || <FileX size={28} className="text-text-tertiary" />}
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
