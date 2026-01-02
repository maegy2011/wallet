import { errorHandler, AppError } from './errorHandler';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle HTTP errors
        const error = this.handleHttpError(response, data);
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        };
      }

      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      // Handle network errors
      const apiError = errorHandler.networkError(
        error instanceof Error ? error.message : 'Network error occurred',
        { url, options: config }
      );

      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
          details: apiError.details
        }
      };
    }
  }

  private handleHttpError(response: Response, data: any): AppError {
    const status = response.status;
    const message = data?.error?.message || data?.message || response.statusText;

    switch (status) {
      case 400:
        return errorHandler.validationError(message, data);
      case 401:
        return errorHandler.authenticationError(message, data);
      case 403:
        return errorHandler.authorizationError(message, data);
      case 404:
        return errorHandler.notFoundError(message, data);
      case 429:
        return errorHandler.createError('RATE_LIMIT', 'Too many requests', data);
      case 500:
      case 502:
      case 503:
      case 504:
        return errorHandler.serverError(message, data);
      default:
        return errorHandler.createError('HTTP_ERROR', message, { status, data });
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken() {
    delete this.defaultHeaders.Authorization;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export hook for React components
export function useApi() {
  return {
    get: apiClient.get.bind(apiClient),
    post: apiClient.post.bind(apiClient),
    put: apiClient.put.bind(apiClient),
    patch: apiClient.patch.bind(apiClient),
    delete: apiClient.delete.bind(apiClient),
    setAuthToken: apiClient.setAuthToken.bind(apiClient),
    removeAuthToken: apiClient.removeAuthToken.bind(apiClient),
  };
}