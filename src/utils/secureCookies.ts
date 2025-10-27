// Secure storage management for authentication
export class SecureCookieService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  static setAuthToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static setUserData(userData: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  static getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUserData(): any {
    const data = localStorage.getItem(this.USER_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}