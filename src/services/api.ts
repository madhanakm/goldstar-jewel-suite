import { API_CONFIG } from '@/constants';
import { ApiResponse, ApiError } from '@/types';
import { authService } from './auth';
import { secureLogger, sanitizeInput } from '@/utils/sanitizer';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private abortControllers = new Map<string, AbortController>();

  private constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = API_CONFIG.timeout, retries = API_CONFIG.retryAttempts, ...options } = config;
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `${options.method || 'GET'}-${endpoint}`;
    
    // Cancel previous request if exists
    this.cancelRequest(requestId);
    
    // Create new abort controller
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);
    
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await this.fetchWithRetry(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }, retries);

      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { data: null as T };
      }

      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
      throw this.handleRequestError(error);
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number
  ): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, options);
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }
        
        // Retry on server errors (5xx) or network issues
        if (response.ok || i === retries) {
          return response;
        }
        
        // Exponential backoff
        await this.delay(Math.pow(2, i) * 1000);
      } catch (error) {
        if (i === retries) throw error;
        await this.delay(Math.pow(2, i) * 1000);
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = {};
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: response.statusText };
    }

    const error: ApiError = {
      message: sanitizeInput(errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`),
      status: response.status,
      details: errorData,
    };
    
    throw error;
  }

  private handleRequestError(error: unknown): ApiError {
    if (error instanceof Error && 'status' in error) {
      return error as ApiError;
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        message: 'Request was cancelled',
        status: 0,
        details: { type: 'AbortError' },
      };
    }
    
    return {
      message: sanitizeInput(error instanceof Error ? error.message : 'Network error occurred'),
      status: 0,
      details: { originalError: 'Error details sanitized' },
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const token = authService.getToken();
    if (!token) {
      const error: ApiError = {
        message: 'Authentication required',
        status: 401,
        details: { type: 'AuthenticationError' },
      };
      throw error;
    }

    return this.request<T>(endpoint, {
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        ...config.headers,
      },
    });
  }

  // Request cancellation
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // Public methods
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.authenticatedRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.authenticatedRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.authenticatedRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.authenticatedRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.authenticatedRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Public unauthenticated methods
  async publicGet<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async publicPost<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiService = ApiService.getInstance();