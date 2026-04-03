'use client';
import React, { useState } from 'react';
import { Search, SlidersHorizontal, Download, MoreVertical, ChevronUp, ChevronDown, Columns3 } from 'lucide-react';
import { cn } from '../ui/utils';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface BonsaiTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  className?: string;
}

export function BonsaiTable({
  columns, data, onRowClick, searchable = true,
  filterable = true, pagination = true, className,
}: BonsaiTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(c => c.key));
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const itemsPerPage = 10;

  const handleSort = (key: string) => {
    if (sortColumn === key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(key); setSortDirection('asc'); }
  };

  const visibleColumns = columns.filter(c => selectedColumns.includes(c.key));
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const pageData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={cn("rounded-xl border border-stone-200/60 bg-white/50 backdrop-blur-sm overflow-hidden", className)}>
      {/* Toolbar */}
      {(searchable || filterable) && (
        <div className="px-5 py-3 flex items-center justify-between gap-4 border-b border-stone-100/60">
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-[13px] rounded-lg bg-stone-50/80 border border-stone-200/50 text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-300 transition-colors"
              />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {filterable && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowColumnChooser(!showColumnChooser)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
              >
                <Columns3 className="w-3.5 h-3.5" />
                Columns
              </button>
              {showColumnChooser && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-stone-200/60 shadow-lg p-1.5 z-10">
                  {columns.map(col => (
                    <label key={col.key} className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-stone-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col.key)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedColumns([...selectedColumns, col.key]);
                          else setSelectedColumns(selectedColumns.filter(k => k !== col.key));
                        }}
                        className="w-3.5 h-3.5 rounded border-stone-300 text-stone-800 focus:ring-stone-300"
                      />
                      <span className="text-[12px] text-stone-600">{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100/60">
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3 text-left text-[11px] font-medium text-stone-400 uppercase tracking-[0.06em]",
                    col.sortable && "cursor-pointer hover:text-stone-600 select-none",
                    col.width
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && sortColumn === col.key && (
                      sortDirection === 'asc'
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-stone-50 last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-stone-50/60 group"
                )}
              >
                {visibleColumns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-[13px] text-stone-700">
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-3 py-3.5">
                  <button className="p-1 text-stone-300 hover:text-stone-500 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-5 py-3 border-t border-stone-100/60 flex items-center justify-between">
          <p className="text-[12px] text-stone-400">
            {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-[12px] text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-md disabled:opacity-30 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-7 h-7 text-[12px] rounded-md transition-colors",
                  currentPage === page
                    ? "bg-stone-800 text-white"
                    : "text-stone-500 hover:bg-stone-50"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-[12px] text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-md disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
