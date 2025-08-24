// General Helper Functions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const generateSKU = (category: string, index?: number): string => {
  const prefix = category.substring(0, 2).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const suffix = index ? index.toString().padStart(3, '0') : Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${suffix}`;
};

export const generateBarcode = (type: 'CODE128' | 'EAN13' = 'CODE128'): string => {
  if (type === 'EAN13') {
    // Generate 13-digit EAN barcode
    const prefix = '890'; // India country code
    const company = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const product = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const checkDigit = calculateEAN13CheckDigit(prefix + company + product);
    return prefix + company + product + checkDigit;
  } else {
    // Generate CODE128 barcode
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }
};

const calculateEAN13CheckDigit = (code: string): string => {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
};

// Array Helpers
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterBy = <T>(array: T[], filters: Partial<T>): T[] => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      return String(item[key as keyof T]).toLowerCase().includes(String(value).toLowerCase());
    });
  });
};

// Storage Helpers
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

// Debounce Helper
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Error Handling
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};