// Pagination wrapper from Spring Data endpoints (/v1/products?page=0&size=10)
// content: array of items (products, users, transactions), page: current page (0-indexed), last: true if final page
// MODIFY: Add totalPages field if backend pagination format changes
export default interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  last: boolean;
}
