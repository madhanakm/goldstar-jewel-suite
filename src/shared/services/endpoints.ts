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
    create: () => '/api/barcodes'
  }
};