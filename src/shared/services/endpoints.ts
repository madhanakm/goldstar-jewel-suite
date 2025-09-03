import { API_CONFIG } from '@/config/api';

export const endpoints = {
  purchase: {
    masters: {
      list: (page = 1, pageSize = 10, search = '') => {
        const searchQuery = search ? `&filters[totalamount][$contains]=${encodeURIComponent(search)}` : '';
        return `${API_CONFIG.ENDPOINTS.PURCHASE_MASTERS}?pagination[page]=${page}&pagination[pageSize]=${pageSize}${searchQuery}`;
      },
      create: () => API_CONFIG.ENDPOINTS.PURCHASE_MASTERS,
    },
    details: {
      list: (masterId: string) => `${API_CONFIG.ENDPOINTS.PURCHASES}?filters[pid][$eq]=${masterId}`,
      create: () => API_CONFIG.ENDPOINTS.PURCHASES,
    }
  },
  barcode: {
    list: (pageSize = 100) => `${API_CONFIG.ENDPOINTS.PURCHASES}?pagination[pageSize]=${pageSize}`,
    listBarcodes: (pageSize = 1000) => `/api/barcodes?pagination[pageSize]=${pageSize}`,
    create: () => '/api/barcodes'
  },
  sales: {
    masters: {
      list: (page = 1, pageSize = 25) => `/api/sales-masters?pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      create: () => '/api/sales-masters'
    },
    details: {
      list: (invoiceId: string) => `/api/sales?filters[invoice_id][$eq]=${invoiceId}`,
      create: () => '/api/sales'
    }
  },
  customers: {
    list: (page = 1, pageSize = 100, search = '') => {
      const searchQuery = search ? `&filters[name][$contains]=${encodeURIComponent(search)}` : '';
      return `/api/customers?pagination[page]=${page}&pagination[pageSize]=${pageSize}${searchQuery}`;
    },
    create: (data?: any) => '/api/customers',
    findByPhone: (phone: string) => `/api/customers?filters[phone][$eq]=${phone}`
  },
  trays: {
    list: (pageSize = 100) => `/api/trays?pagination[pageSize]=${pageSize}`,
    create: () => '/api/trays'
  },
  rates: {
    list: (pageSize = 100) => `/api/rates?pagination[pageSize]=${pageSize}`,
    create: () => '/api/rates',
    update: (id: number) => `/api/rates/${id}`
  }
};