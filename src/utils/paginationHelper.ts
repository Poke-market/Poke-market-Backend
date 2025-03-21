/**
 * Helper function to generate pagination information
 * @param totalItems Total number of items
 * @param currentPage Current page number
 * @param limit Items per page
 * @param getPageLink Function to generate page links
 * @returns Pagination information object
 */
export function generatePaginationInfo(
  totalItems: number,
  currentPage: number,
  limit: number,
  getPageLink: (page: number) => string,
) {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    count: totalItems,
    page: currentPage,
    pages: totalPages,
    prev: currentPage > 1 ? getPageLink(currentPage - 1) : null,
    next: currentPage < totalPages ? getPageLink(currentPage + 1) : null,
    first: currentPage > 1 ? getPageLink(1) : null,
    last: currentPage < totalPages ? getPageLink(totalPages) : null,
  };
}
