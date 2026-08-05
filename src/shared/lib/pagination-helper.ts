export interface PaginationOptions {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  startIndex: number
  endIndex: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export function normalizePage(page: number, totalPages: number) {
  if (totalPages <= 0) return 1
  return Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages)
}

export function paginateItems<T>(
  items: T[],
  { page, pageSize }: PaginationOptions,
): PaginationResult<T> {
  const safePageSize = Math.max(Math.trunc(pageSize) || 1, 1)
  const totalItems = items.length
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1)
  const currentPage = normalizePage(page, totalPages)
  const startIndex = (currentPage - 1) * safePageSize
  const endIndex = Math.min(startIndex + safePageSize, totalItems)

  return {
    items: items.slice(startIndex, endIndex),
    page: currentPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  }
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
) {
  const safeTotalPages = Math.max(Math.trunc(totalPages) || 1, 1)
  const safeCurrentPage = normalizePage(currentPage, safeTotalPages)
  const start = Math.max(safeCurrentPage - siblingCount, 1)
  const end = Math.min(safeCurrentPage + siblingCount, safeTotalPages)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}
