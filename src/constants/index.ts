// Application Constants
export const APP_CONFIG = {
  name: 'Sri Cashway',
  version: '1.0.0',
  description: 'Goldstar Jewel Suite - Complete Jewelry Management System'
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://jewelapi.sricashway.com',
  timeout: 30000,
  retryAttempts: 3
} as const;

// Business Constants
export const JEWELRY_CATEGORIES = [
  'Ring', 'Necklace', 'Earring', 'Bracelet', 'Chain', 'Pendant', 'Bangle'
] as const;

export const METAL_PURITIES = {
  Gold: ['24K', '22K', '18K', '14K'],
  Silver: ['999', '925', '900', '835', '800'],
  Diamond: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2'],
  Platinum: ['999', '950', '900']
} as const;

export const BARCODE_FORMATS = ['CODE128', 'EAN13', 'UPC', 'CODE39'] as const;

// UI Constants
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CUSTOMER_MANAGEMENT: '/customer-management',
  PRODUCT_MANAGEMENT: '/product-management',
  SIMPLE_PRODUCT_MANAGEMENT: '/simple-product-management',
  PRODUCT_MODULE: '/product-module',
  ADD_PRODUCT: '/add-product',
  INVENTORY_MANAGEMENT: '/inventory-management',
  SALES_BILLING: '/sales-billing',
  SILVER_BILLING: '/silver-billing',
  PURCHASE_MANAGEMENT: '/purchase-management',
  FINANCIAL_MODULES: '/financial-modules',
  ANALYTICS_REPORTS: '/analytics-reports',
  LOCKER_ROOM_MANAGEMENT: '/locker-room-management',
  BARCODE_GENERATOR: '/barcode-generator'
} as const;