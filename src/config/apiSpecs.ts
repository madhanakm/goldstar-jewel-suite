// API Specifications for Goldstar Jewel Suite
// Strapi Backend Integration

export const API_SPECS = {
  BASE_URL: 'https://jewelapi.sricashway.com',
  VERSION: 'v1',
  
  // Authentication Endpoints
  AUTH: {
    LOGIN: {
      endpoint: '/api/auth/local',
      method: 'POST',
      body: { identifier: 'string', password: 'string' },
      response: { jwt: 'string', user: 'User' }
    },
    REGISTER: {
      endpoint: '/api/auth/local/register',
      method: 'POST',
      body: { username: 'string', email: 'string', password: 'string' },
      response: { jwt: 'string', user: 'User' }
    },
    FORGOT_PASSWORD: {
      endpoint: '/api/auth/forgot-password',
      method: 'POST',
      body: { email: 'string' }
    },
    RESET_PASSWORD: {
      endpoint: '/api/auth/reset-password',
      method: 'POST',
      body: { code: 'string', password: 'string', passwordConfirmation: 'string' }
    }
  },

  // Product Management
  PRODUCTS: {
    GET_ALL: {
      endpoint: '/api/products',
      method: 'GET',
      params: { 'pagination[page]': 'number', 'pagination[pageSize]': 'number', 'populate': '*' },
      filters: { category: 'string', status: 'string', search: 'string' }
    },
    GET_BY_ID: {
      endpoint: '/api/products/:id',
      method: 'GET',
      params: { populate: '*' }
    },
    CREATE: {
      endpoint: '/api/products',
      method: 'POST',
      body: { data: 'ProductFormData' }
    },
    UPDATE: {
      endpoint: '/api/products/:id',
      method: 'PUT',
      body: { data: 'Partial<ProductFormData>' }
    },
    DELETE: {
      endpoint: '/api/products/:id',
      method: 'DELETE'
    },
    SEARCH_BARCODE: {
      endpoint: '/api/products',
      method: 'GET',
      params: { 'filters[barcode][$eq]': 'string', populate: '*' }
    }
  },

  // Customer Management
  CUSTOMERS: {
    GET_ALL: {
      endpoint: '/api/customers',
      method: 'GET',
      params: { 'pagination[page]': 'number', 'pagination[pageSize]': 'number' },
      filters: { name: 'string', phone: 'string' }
    },
    CREATE: {
      endpoint: '/api/customers',
      method: 'POST',
      body: { data: 'CustomerFormData' }
    },
    UPDATE: {
      endpoint: '/api/customers/:id',
      method: 'PUT',
      body: { data: 'Partial<CustomerFormData>' }
    }
  },

  // Sales Management
  SALES: {
    GET_ALL: {
      endpoint: '/api/sales',
      method: 'GET',
      params: { 'pagination[page]': 'number', 'pagination[pageSize]': 'number', populate: '*' },
      filters: { payment_status: 'string', date_from: 'string', date_to: 'string' }
    },
    CREATE: {
      endpoint: '/api/sales',
      method: 'POST',
      body: { data: 'SaleFormData' }
    }
  },

  // Sales Items
  SALE_ITEMS: {
    CREATE: {
      endpoint: '/api/sale-items',
      method: 'POST',
      body: { data: 'SaleItemFormData' }
    }
  },

  // Purchase Management
  PURCHASES: {
    GET_ALL: {
      endpoint: '/api/purchases',
      method: 'GET',
      params: { 'pagination[page]': 'number', 'pagination[pageSize]': 'number', populate: '*' }
    },
    CREATE: {
      endpoint: '/api/purchases',
      method: 'POST',
      body: { data: 'PurchaseFormData' }
    }
  },

  // Purchase Masters
  PURCHASE_MASTERS: {
    GET_ALL: {
      endpoint: '/api/purchase-masters',
      method: 'GET',
      params: { populate: '*' }
    },
    CREATE: {
      endpoint: '/api/purchase-masters',
      method: 'POST',
      body: { data: 'PurchaseMasterFormData' }
    }
  },

  // Sales Masters
  SALES_MASTERS: {
    GET_ALL: {
      endpoint: '/api/sales-masters',
      method: 'GET',
      params: { populate: '*' }
    },
    CREATE: {
      endpoint: '/api/sales-masters',
      method: 'POST',
      body: { data: 'SalesMasterFormData' }
    }
  },

  // Locker Room Management
  LOCKER_ROOMS: {
    GET_ALL: {
      endpoint: '/api/locker-rooms',
      method: 'GET',
      params: { populate: '*' }
    },
    CREATE: {
      endpoint: '/api/locker-rooms',
      method: 'POST',
      body: { data: 'LockerRoomFormData' }
    },
    UPDATE: {
      endpoint: '/api/locker-rooms/:id',
      method: 'PUT',
      body: { data: 'Partial<LockerRoomFormData>' }
    }
  },

  // Tray Management
  TRAYS: {
    GET_ALL: {
      endpoint: '/api/trays',
      method: 'GET',
      params: { populate: '*' }
    },
    CREATE: {
      endpoint: '/api/trays',
      method: 'POST',
      body: { data: 'TrayFormData' }
    }
  },

  // Rate Management
  RATES: {
    GET_ALL: {
      endpoint: '/api/rates',
      method: 'GET'
    },
    CREATE: {
      endpoint: '/api/rates',
      method: 'POST',
      body: { data: 'RateFormData' }
    },
    UPDATE: {
      endpoint: '/api/rates/:id',
      method: 'PUT',
      body: { data: 'Partial<RateFormData>' }
    }
  },

  // Login Session Tracking
  LOGIN_DETAILS: {
    GET_BY_USER: {
      endpoint: '/api/logindetails',
      method: 'GET',
      params: { 'filters[userid][$eq]': 'string' }
    },
    CREATE: {
      endpoint: '/api/logindetails',
      method: 'POST',
      body: { data: { userid: 'string', logintime: 'string' } }
    },
    UPDATE: {
      endpoint: '/api/logindetails/:id',
      method: 'PUT',
      body: { data: 'Partial<LoginSession>' }
    },
    DELETE: {
      endpoint: '/api/logindetails/:id',
      method: 'DELETE'
    }
  }
} as const;

// Data Models
export interface ProductFormData {
  name: string;
  category: string;
  weight: number;
  purity: string;
  purchase_price: number;
  making_charges: number;
  stone_charges?: number;
  other_charges?: number;
  description?: string;
  stock_quantity: number;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  kyc_status?: 'verified' | 'pending' | 'rejected';
}

export interface SaleFormData {
  customer_id: number;
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  payment_method: string;
  date: string;
}

export interface SaleItemFormData {
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PurchaseFormData {
  vendor_name: string;
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  date: string;
}

export interface LockerRoomFormData {
  room_number: string;
  capacity: number;
  status: 'active' | 'inactive';
  description?: string;
}

export interface TrayFormData {
  tray_number: string;
  locker_room_id: number;
  capacity: number;
  current_items: number;
}

export interface RateFormData {
  metal_type: string;
  purity: string;
  rate_per_gram: number;
  date: string;
}

// Response Types
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
}

export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginSession {
  id?: number;
  userid: string;
  logintime: string;
  isActive?: boolean;
}