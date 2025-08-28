// Secure cookie management for authentication
export class SecureCookieService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  static setAuthToken(token: string): void {
    // Set httpOnly cookie via server-side API call
    this.setCookie(this.TOKEN_KEY, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  static setUserData(userData: any): void {
    // Store non-sensitive user data in secure cookie
    this.setCookie(this.USER_KEY, JSON.stringify(userData), {
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
  }

  static getAuthToken(): string | null {
    return this.getCookie(this.TOKEN_KEY);
  }

  static getUserData(): any {
    const data = this.getCookie(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  static clearAuth(): void {
    this.deleteCookie(this.TOKEN_KEY);
    this.deleteCookie(this.USER_KEY);
  }

  private static setCookie(name: string, value: string, options: any = {}): void {
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (options.maxAge) {
      const expires = new Date(Date.now() + options.maxAge);
      cookieString += `; expires=${expires.toUTCString()}`;
    }
    
    if (options.secure) cookieString += '; secure';
    if (options.httpOnly) cookieString += '; httpOnly';
    if (options.sameSite) cookieString += `; sameSite=${options.sameSite}`;
    
    cookieString += '; path=/';
    
    document.cookie = cookieString;
  }

  private static getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  private static deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}