import React, { useState } from 'react';
import clsx from 'clsx';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  filterComponent,
  emptyMessage = 'No records found.',
  pageSize = 10,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data by search term across all text columns
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => {
      if (typeof val === 'string' || typeof val === 'number') {
        return String(val).toLowerCase().includes(term);
      }
      return false;
    });
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={clsx('w-full flex flex-col', className)}>
      {/* Top Search & Filter Bar */}
      {(searchable || filterComponent) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          {searchable ? (
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-textMuted"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-[#081226]/80 text-sm text-slate-100 placeholder:text-brand-textMuted pl-10 pr-4 py-2 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            </div>
          ) : (
            <div />
          )}
          {filterComponent && <div className="w-full sm:w-auto">{filterComponent}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#071126]/60">
        <table className="w-full text-left text-sm text-slate-200">
          <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-brand-textMuted border-b border-white/[0.06]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={clsx(
                    'px-5 py-3.5 tracking-wider font-medium',
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  className="hover:bg-brand-cyan/[0.03] transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={clsx('px-5 py-3.5 whitespace-nowrap', col.className)}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-brand-textMuted"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400">
                      <Inbox size={22} />
                    </div>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredData.length > pageSize && (
        <div className="flex items-center justify-between mt-4 px-2 text-xs text-brand-textMuted">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of{' '}
            {filteredData.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-xl border border-white/10 bg-[#081226] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-xl border border-white/10 bg-[#081226] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
