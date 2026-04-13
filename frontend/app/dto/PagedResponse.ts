export default interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  last: boolean;
}
