import { useEffect, useMemo, useState } from "react";

/**
 * Client-side pagination for lists the API returns in full.
 *
 *   const pg = usePagination(filteredRows);           // 10 per page
 *   rows = pg.pageItems
 *   <Pagination {...pg.paginationProps} />
 *
 * `resetKey` (optional) sends the user back to page 1 when filters/search change.
 */
export default function usePagination(items = [], initialPageSize = 10, resetKey = "") {
  const list = Array.isArray(items) ? items : [];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Filter/search changed -> back to first page
  useEffect(() => { setPage(1); }, [resetKey, pageSize]);

  // List shrank (e.g. last row on the page was deleted) -> clamp
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const pageItems = useMemo(
    () => list.slice((page - 1) * pageSize, page * pageSize),
    [list, page, pageSize]
  );

  return {
    pageItems,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    /** First row number on this page (for "#" columns) */
    offset: (page - 1) * pageSize,
    paginationProps: {
      page,
      pageSize,
      total,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    },
  };
}
