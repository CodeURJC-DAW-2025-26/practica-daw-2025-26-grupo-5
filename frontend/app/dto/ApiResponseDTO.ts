// Generic wrapper for all API responses from backend
// success: operation result, data: actual payload (UserDTO, ProductDTO[], etc.), message: human-readable message
// errors: field-level validation errors (used for form error display)
export default interface ApiResponseDTO<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string>;
}
