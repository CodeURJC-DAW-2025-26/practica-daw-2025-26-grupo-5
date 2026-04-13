export default interface ApiResponseDTO<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string>;
}
