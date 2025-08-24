import { API_CONFIG } from '@/constants';
import { getFromStorage, setToStorage, removeFromStorage } from '@/utils';

export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    this.token = getFromStorage('auth_token', null);
    this.user = getFromStorage('user_data', null);
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { apiService } = await import('./api');
      const response = await apiService.publicPost<AuthResponse>('/api/auth/local', credentials);
      
      this.token = response.data.jwt;
      this.user = response.data.user;
      
      setToStorage('auth_token', response.data.jwt);
      setToStorage('user_data', response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const { apiService } = await import('./api');
      const response = await apiService.publicPost<AuthResponse>('/api/auth/local/register', userData);
      
      this.token = response.data.jwt;
      this.user = response.data.user;
      
      setToStorage('auth_token', response.data.jwt);
      setToStorage('user_data', response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    removeFromStorage('auth_token');
    removeFromStorage('user_data');
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  // Helper method for making authenticated API calls
  async authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { apiService } = await import('./api');
    const response = await apiService.get<T>(endpoint, options);
    return response.data;
  }
}

export const authService = AuthService.getInstance();