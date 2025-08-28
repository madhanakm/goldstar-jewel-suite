import { API_CONFIG } from '@/config/api';
import { SecureCookieService } from '@/utils/secureCookies';
import { secureLogger } from '@/utils/sanitizer';

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

export interface LoginSession {
  id?: number;
  email: string;
  loginTime: string;
  expiryTime: string;
  isActive: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    this.token = SecureCookieService.getAuthToken();
    const userData = SecureCookieService.getUserData();
    if (userData) {
      try {
        this.user = userData;
      } catch (error) {
        secureLogger.error('Error parsing user data', error);
        this.clearAuth();
      }
    }
    
    // Validate session on initialization
    if (this.token && this.user) {
      const loginTime = localStorage.getItem('login_time');
      if (loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
        
        console.log('Session validation - Hours since login:', hoursDiff);
        if (hoursDiff >= 10) {
          console.log('Session expired, clearing auth');
          this.clearAuth();
        } else {
          console.log('Session valid, keeping auth');
        }
      } else {
        console.log('No login time found, clearing auth');
        this.clearAuth();
      }
    } else {
      console.log('No token or user found');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      this.token = data.jwt;
      this.user = data.user;
      
      SecureCookieService.setAuthToken(data.jwt);
      SecureCookieService.setUserData(data.user);
      
      // Session tracking disabled for now
      // await this.createLoginSession(data.user.email);
      
      return data;
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
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      
      this.token = data.jwt;
      this.user = data.user;
      
      SecureCookieService.setAuthToken(data.jwt);
      SecureCookieService.setUserData(data.user);
      
      return data;
    } catch (error) {
      secureLogger.error('Registration error', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(code: string, password: string, passwordConfirmation: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          password,
          passwordConfirmation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Password reset failed');
      }

      const data: AuthResponse = await response.json();
      
      this.token = data.jwt;
      this.user = data.user;
      
      SecureCookieService.setAuthToken(data.jwt);
      SecureCookieService.setUserData(data.user);
      
      return data;
    } catch (error) {
      secureLogger.error('Reset password error', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Clear session from API if user exists
    if (this.user?.email) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN_DETAILS}?filters[userid][$eq]=${encodeURIComponent(this.user.email)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const sessionId = data.data[0].id;
            await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN_DETAILS}/${sessionId}`, {
              method: 'DELETE'
            });
          }
        }
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
    
    // Clear cookies and instance variables
    this.token = null;
    this.user = null;
    SecureCookieService.clearAuth();
  }

  isAuthenticated(): boolean {
    const token = SecureCookieService.getAuthToken();
    const userData = SecureCookieService.getUserData();
    
    if (!token || !userData) {
      return false;
    }
    
    this.token = token;
    this.user = userData;
    return true;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  private clearAuth(): void {
    this.token = null;
    this.user = null;
    SecureCookieService.clearAuth();
  }



  private async createLoginSession(email: string): Promise<void> {
    try {
      const now = new Date();
      const sessionData = {
        userid: email,
        logintime: now.toISOString()
      };
      
      // Check if session exists
      const existingResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN_DETAILS}?filters[userid][$eq]=${encodeURIComponent(email)}`);
      
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        
        if (existingData.data && existingData.data.length > 0) {
          // Update existing session
          const sessionId = existingData.data[0].id;
          await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN_DETAILS}/${sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: sessionData })
          });
        } else {
          // Create new session
          await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN_DETAILS}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: sessionData })
          });
        }
      }
    } catch (error) {
      console.error('Error managing login session:', error);
    }
  }

  private async endLoginSession(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN_DETAILS}?filters[userid][$eq]=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const sessionId = data.data[0].id;
          await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN_DETAILS}/${sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: { isActive: false }
            })
          });
        }
      }
    } catch (error) {
      console.error('Error ending login session:', error);
    }
  }

  // Helper method for making authenticated API calls
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

export const authService = AuthService.getInstance();