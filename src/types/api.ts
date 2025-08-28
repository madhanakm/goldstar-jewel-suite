// Centralized API types for better type safety
export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Product {
  id: number;
  product: string;
  touch: string;
  weight: string;
  qty: string;
  code: string;
  trayno?: string;
  making_charges_or_wastages?: string;
}

export interface Rate {
  id: number;
  product: string;
  price: string;
}

export interface Sale {
  id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  products: Product[];
}

export interface Tray {
  id: number;
  trayno: string;
}