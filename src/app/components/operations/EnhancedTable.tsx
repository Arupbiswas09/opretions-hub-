import React, { useState } from 'react';
import { Search, Filter, Download, MoreVertical, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { cn } from '../ui/utils';
import { BulkActionsToolbar } from './BulkActionsToolbar';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface EnhancedTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
}

export function EnhancedTable({
  columns,
  data,
  onRowClick,
  searchable = true,
  filterable = true,
  pagination = true,
  selectable = true,
  onSelectionChange,
  className,
}: EnhancedTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(c => c.key));
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(data.map((_, idx) => idx.toString()));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const visibleColumns = columns.filter(col => selectedColumns.includes(col.key));
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {selectable && selectedRows.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedRows.size}
          onClearSelection={() => setSelectedRows(new Set())}
          onDelete={() => console.log('Delete selected')}
          onEmail={() => console.log('Email selected')}
          onTag={() => console.log('Tag selected')}
          onExport={() => console.log('Export selected')}
        />
      )}

      <div
        className={cn('rounded-xl overflow-hidden', className)}
        style={{
          background: 'var(--table-shell-bg)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid var(--border)',
          boxShadow: 'inset 0 1px 0 var(--hub-stat-tile-highlight)',
        }}
      >
        {/* Table Header */}
        {(searchable || filterable) && (
          <div
            className="p-4 flex items-center justify-between gap-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {/* Search */}
            {searchable && (
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                    style={{
                      background: 'var(--input-background)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {filterable && (
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-[background-color] duration-[120ms] ease-out text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)]"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColumnChooser(!showColumnChooser)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-[background-color] duration-[120ms] ease-out text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)]"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Columns</span>
                </button>

                {showColumnChooser && (
                  <div
                    className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg p-2 z-10"
                    style={{
                      background: 'var(--user-menu-bg)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {columns.map(col => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-[background-color] duration-[120ms] hover:bg-[var(--row-hover-bg)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(col.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColumns([...selectedColumns, col.key]);
                            } else {
                              setSelectedColumns(selectedColumns.filter(k => k !== col.key));
                            }
                          }}
                          className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-primary"
                        />
                        <span className="text-sm text-stone-700 dark:text-stone-300">{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-[background-color] duration-[120ms] ease-out text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)]"
                style={{ border: '1px solid var(--border)' }}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {selectable && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-primary"
                    />
                  </th>
                )}
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600 dark:text-stone-400 transition-[background-color] duration-[120ms] ease-out',
                      column.sortable && 'cursor-pointer hover:bg-[var(--row-hover-bg)]',
                      column.width
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody style={{ borderColor: 'var(--border)' }} className="divide-y divide-[color:var(--border)]">
              {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => {
                const rowId = index.toString();
                const isSelected = selectedRows.has(rowId);
                return (
                  <tr
                    key={index}
                    className={cn(
                      'transition-[background-color] duration-[120ms] ease-out',
                      isSelected && 'bg-primary/5 dark:bg-white/[0.04]',
                      onRowClick && 'cursor-pointer hover:bg-[var(--row-hover-bg)]',
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-primary"
                        />
                      </td>
                    )}
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm text-stone-800 dark:text-stone-200"
                        onClick={() => onRowClick?.(row)}
                      >
                        {row[column.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="p-1 rounded text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-[background-color] duration-[120ms] hover:bg-[var(--row-hover-bg)]"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div
            className="p-4 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="text-sm text-stone-600 dark:text-stone-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg transition-[background-color] duration-[120ms] ease-out text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: '1px solid var(--border)' }}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg border transition-[background-color] duration-[120ms] ease-out',
                      currentPage === page
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)]',
                    )}
                    style={
                      currentPage === page
                        ? undefined
                        : { borderColor: 'var(--border)' }
                    }
                  >
                    {page}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg transition-[background-color] duration-[120ms] ease-out text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: '1px solid var(--border)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
