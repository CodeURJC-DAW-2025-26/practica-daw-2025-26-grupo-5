/**
 * Fetch API wrapper - Native HTTP client replacing axios
 * Follows professor's pattern: validate response.ok, throw HttpError, include token in headers
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

function getToken(): string | null {
  // Get token from localStorage (if using JWT)
  return localStorage.getItem('token');
}

async function request<T = any>(
  method: string,
  endpoint: string,
  data?: any,
  params?: Record<string, any>
): Promise<T> {
  const baseURL = window.location.origin + '/api';
  const fullUrl = baseURL + buildUrl(endpoint, params);
  
  const headers: Record<string, string> = {};
  
  // Add token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    credentials: 'include', // Include cookies for session auth
    headers,
  };

  // Handle request body
  if (data) {
    if (data instanceof FormData) {
      // FormData - let browser set Content-Type with boundary
      options.body = data;
    } else if (typeof data === 'object') {
      // JSON - set Content-Type header
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  const response = await fetch(fullUrl, options);
  
  // Validate response - follow professor's pattern
  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If response is not JSON, use statusText
    }
    
    throw new HttpError(response.status, response.statusText, errorMessage);
  }

  // Parse response based on content-type
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return await response.json();
  } else if (contentType?.includes('image/')) {
    return await response.blob() as any;
  } else {
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
