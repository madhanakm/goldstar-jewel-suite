import { useState, useEffect } from 'react';

// Secure storage hook to replace direct localStorage usage
export const useSecureStorage = (key: string, defaultValue: any = null) => {
  const [value, setValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key); // Use sessionStorage instead of localStorage
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: any) => {
    try {
      setValue(newValue);
      if (newValue === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      // Handle storage errors silently
    }
  };

  return [value, setStoredValue];
};

// Secure token management
export const secureTokenStorage = {
  setToken: (token: string) => {
    // In production, consider using httpOnly cookies
    sessionStorage.setItem('auth_token', token);
  },
  
  getToken: (): string | null => {
    return sessionStorage.getItem('auth_token');
  },
  
  removeToken: () => {
    sessionStorage.removeItem('auth_token');
  }
};