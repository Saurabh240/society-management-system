import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

/** Builds [1, "…", 4, 5, 6, "…", 20] style page lists. */
const buildPages = (page, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) { pages.add(2); pages.add(3); pages.add(4); }
  if (page >= totalPages - 2) { pages.add(totalPages - 1); pages.add(totalPages - 2); pages.add(totalPages - 3); }
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
};

/**
 * Shared pagination bar (1-indexed `page`).
 * Used by every list so paging looks and behaves the same everywhere.
 * Renders nothing when there are no rows; hides the page buttons when everything fits on one page.
 */
export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  disabled = false,
  className = "",
}) {
  if (!total) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Nothing worth paging and no way to change size -> keep UI quiet
  if (totalPages === 1 && total <= Math.min(...pageSizeOptions)) {
    return (
      <p className={`text-sm text-gray-500 mt-4 ${className}`}>
        Showing <span className="font-medium text-gray-900">{total}</span> {total === 1 ? "result" : "results"}
      </p>
    );
  }

  const btn =
    "min-w-9 h-9 px-2 rounded-lg border text-sm font-semibold transition flex items-center justify-center";

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 ${className}`}>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <p>
          Showing <span className="font-medium text-gray-900">{from}</span>–
          <span className="font-medium text-gray-900">{to}</span> of{" "}
          <span className="font-medium text-gray-900">{total}</span>
        </p>
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>Rows</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            aria-label="Previous page"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={`${btn} border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ChevronLeft size={16} />
          </button>

          {buildPages(page, totalPages).map((p) =>
            typeof p === "string" ? (
              <span key={p} className="px-1 text-gray-400 select-none">…</span>
            ) : (
              <button
                key={p}
                type="button"
                disabled={disabled}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
                className={`${btn} ${
                  p === page
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={`${btn} border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
