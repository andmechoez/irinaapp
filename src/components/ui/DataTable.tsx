import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Input from './Input';

// =============================================
// DataTable — Tabla genérica con paginación y ordenamiento
// =============================================

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  itemsPerPage?: number;
}

type SortDirection = 'asc' | 'desc' | null;

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  emptyState,
  onRowClick,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle local sorting
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0;
    
    // Using any here to bypass complex generic key extraction
    const valA = (a as any)[sortKey];
    const valB = (b as any)[sortKey];

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle local filtering if onSearch is not provided
  const filteredData = onSearch 
    ? sortedData 
    : sortedData.filter(item => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return Object.values(item as Record<string, unknown>).some(val => 
          String(val).toLowerCase().includes(searchLower)
        );
      });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortDirection(null); setSortKey(null); }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to page 1 on sort
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
    setCurrentPage(1); // Reset to page 1 on search
  };

  return (
    <div className="bg-bg-card rounded-[var(--radius-xl)] border border-border/60 shadow-card overflow-hidden flex flex-col transition-shadow hover:shadow-card-hover duration-300">
      
      {/* Header / Search bar */}
      {searchable && (
        <div className="p-4 border-b border-border/40">
          <div className="max-w-sm">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              icon={<Search size={18} />}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="bg-bg-elevated/50 text-xs uppercase text-text-secondary font-bold">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.accessorKey)}
                  className={`px-4 py-3 border-b border-border/40 ${col.sortable ? 'cursor-pointer hover:bg-bg-elevated select-none transition-colors' : ''} ${col.className || ''}`}
                  onClick={() => col.sortable && handleSort(String(col.accessorKey))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="flex flex-col opacity-50">
                        <ChevronUp size={10} className={sortKey === col.accessorKey && sortDirection === 'asc' ? 'text-salud-blue opacity-100' : ''} />
                        <ChevronDown size={10} className={sortKey === col.accessorKey && sortDirection === 'desc' ? 'text-salud-blue opacity-100 -mt-0.5' : '-mt-0.5'} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0 border-b border-border/40">
                  {emptyState || (
                    <div className="py-12 text-center text-text-tertiary font-medium">
                      No se encontraron resultados
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`border-b border-border/40 last:border-0 hover:bg-salud-blue-soft/10 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={String(col.accessorKey)} className={`px-4 py-3.5 ${col.className || ''}`}>
                      {col.cell ? col.cell(item) : String((item as any)[col.accessorKey] || '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-border/40 flex items-center justify-between bg-bg-primary/50">
          <span className="text-xs text-text-tertiary font-medium px-2">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-[var(--radius-sm)] border border-border/60 text-text-secondary disabled:opacity-30 hover:bg-bg-elevated transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-3 text-sm font-semibold text-text-primary">
              {currentPage} <span className="text-text-tertiary font-normal mx-1">de</span> {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-[var(--radius-sm)] border border-border/60 text-text-secondary disabled:opacity-30 hover:bg-bg-elevated transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
