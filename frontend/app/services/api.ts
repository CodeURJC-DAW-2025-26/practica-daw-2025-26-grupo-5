/**
 * HTTP ERROR CLASS
 * Custom error class that encapsulates HTTP error responses from the backend
 * 
 * Properties:
 * - status: HTTP status code (401, 404, 500, etc.)
 * - statusText: HTTP status text (Unauthorized, Not Found, etc.)
 * - message: Custom error message (often from backend API response)
 * 
 * Usage: catch (error) { if (error instanceof HttpError) { handle by status } }
 */

/**
 * Fetch API wrapper - Native HTTP client replacing axios
 * This module provides a lightweight HTTP client using the native Fetch API
 * that follows the professor's recommended pattern: validate response.ok, throw HttpError, include token in headers
 * 
 * Key Features:
 * - JWT Bearer token authentication: Automatically attaches JWT token from localStorage to all requests
 * - FormData & Blob support: Handles multipart/form-data for file uploads and binary responses
 * - Custom HttpError class: Throws structured errors with status codes and messages from backend
 * - Dynamic query parameter builder: Supports arrays, null filtering, and nested objects
 * - Automatic content-type detection: Handles JSON, images, and text responses
 * 
 * Base URL: Constructs from window.location.origin + '/api' to work with Spring Boot context path (/api)
 * Authentication: Reads JWT token from localStorage.token automatically on each request
 * Credentials: Includes credentials mode for cookie-based session management
 */

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function buildUrl(endpoint: string, params?: Record<string, any>): string {
  let url = endpoint;
  if (params) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryString.append(key, String(v)));
        } else {
          queryString.set(key, String(value));
        }
      }
    });
    if (queryString.toString()) {
      url += (url.includes('?') ? '&' : '?') + queryString.toString();
    }
  }
  return url;
}

// MODIFY: Change localStorage key if token storage changes
function getToken(): string | null {
  // Get token from localStorage (using JWT). Modify here if backend changes token location
  return localStorage.getItem('token');
}

// Core HTTP function: All api.get/post/patch/delete call this
// MODIFY: Add logging, caching, retry logic here (centralized)
async function request<T = any>(
  method: string,
  endpoint: string,
  data?: any,
  params?: Record<string, any>
): Promise<T> {
  // Build full URL: http://localhost:5173/api/v1/users/me + ?params
  // MODIFY: Change /api if backend context path changes
  const baseURL = window.location.origin + '/api';
  const fullUrl = baseURL + buildUrl(endpoint, params);
  
  const headers: Record<string, string> = {};
  
  // Add JWT token to every request. MODIFY: Change header name if backend expects different auth scheme
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Header format: "Bearer <token>"
  }

  const options: RequestInit = {
    method,
    credentials: 'include', // Include cookies for session auth
    headers,
  };

  // Handle request body
  // Handle request body: FormData (multipart) or JSON
  // MODIFY: Add XML support if backend requires XML (detect via endpoint pattern)
  if (data) {
    if (data instanceof FormData) {
      // FormData: File uploads (photo, product images). Browser auto-sets boundary
      options.body = data;
    } else if (typeof data === 'object') {
      // JSON: Regular API calls (login, update profile, create product)
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  // Execute HTTP request. MODIFY: Add retry logic, circuit breaker here
  const response = await fetch(fullUrl, options);
  
  // Error handling: Check response status (200-299 = success)
  // MODIFY: Add 401 handler to refresh token or redirect to login
  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      // Extract error message from backend response
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // Response not JSON (e.g., HTML error page)
    }
    
    throw new HttpError(response.status, response.statusText, errorMessage);
  }

  // Response parsing: Detect content type and parse accordingly
  // MODIFY: Add XML parsing if backend returns XML responses
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    // API returns JSON (most common: user data, products, transactions)
    return await response.json();
  } else if (contentType?.includes('image/')) {
    // Backend returns binary image (profile photos, product images)
    return await response.blob() as any;
  } else {
    // Plain text response
    return await response.text() as any;
  }
}

const api = {
  get: <T = any>(endpoint: string, params?: { params?: Record<string, any> }) => {
    const queryParams = (params as any)?.params;
    return request<T>('GET', endpoint, undefined, queryParams);
  },
  post: <T = any>(endpoint: string, data?: any, params?: Record<string, any>) => request<T>('POST', endpoint, data, params),
  put: <T = any>(endpoint: string, data?: any, params?: Record<string, any>) => request<T>('PUT', endpoint, data, params),
  delete: <T = any>(endpoint: string, params?: Record<string, any>) => request<T>('DELETE', endpoint, undefined, params),
  patch: <T = any>(endpoint: string, data?: any, params?: Record<string, any>) => request<T>('PATCH', endpoint, data, params),
};

export default api;
