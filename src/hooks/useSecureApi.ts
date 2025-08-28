import { useState } from 'react';
import { sanitizeInput, validateInput } from '@/utils/sanitizer';

export const useSecureApi = () => {
  const [loading, setLoading] = useState(false);

  const secureRequest = async (url: string, method = 'GET', data?: any) => {
    setLoading(true);
    try {
      // Sanitize URL parameters
      const sanitizedUrl = sanitizeInput(url);
      
      // Validate and sanitize request data
      if (data && typeof data === 'object') {
        const sanitizedData = Object.keys(data).reduce((acc, key) => {
          const value = data[key];
          if (typeof value === 'string') {
            if (validateInput(value)) {
              acc[key] = sanitizeInput(value);
            } else {
              throw new Error(`Invalid input for field: ${key}`);
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as any);
        data = sanitizedData;
      }

      const response = await fetch(sanitizedUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  return { secureRequest, loading };
};