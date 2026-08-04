import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// =============================================
// Breadcrumb — Navegación jerárquica
// =============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Navegación" className={`flex items-center gap-1.5 text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={14} className="text-text-tertiary" />}
            {isLast ? (
              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="text-text-tertiary hover:text-salud-blue transition-colors flex items-center gap-1.5 font-medium"
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span className="text-text-tertiary flex items-center gap-1.5 font-medium">
                {item.icon}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
