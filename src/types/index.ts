// Common Types
export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, any>;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  icon: any;
  description: string;
  color: string;
  onClick?: () => void;
}

export interface SidebarCategory {
  category: string;
  items: NavigationItem[];
}

export interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

// Form Types
export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

// Status Types
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type KYCStatus = 'verified' | 'pending' | 'rejected';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

// Re-export existing types
export * from './product';
export * from './api';