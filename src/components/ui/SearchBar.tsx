import { Search, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import Input from './Input';

// =============================================
// SearchBar — Búsqueda con debounce
// =============================================

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Buscar...',
  value,
  onChange,
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={<Search size={18} />}
        className="pr-9"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-text-tertiary hover:text-text-primary cursor-pointer transition-colors z-10"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/** Hook for debounced search */
export function useSearchDebounce(delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    const timer = setTimeout(() => setDebouncedTerm(value), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return { searchTerm, debouncedTerm, setSearchTerm: handleSearch };
}
