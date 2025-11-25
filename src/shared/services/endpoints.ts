import { API_CONFIG } from '@/config/api';

// Helper function to fetch all paginated data
export const fetchAllPaginated = async (request: any, baseUrl: string) => {
  let allData = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await request(`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}pagination[page]=${page}&pagination[pageSize]=100`);
    const data = response.data || [];
    
    if (data.length === 0) {
      hasMore = false;
    } else {
      allData.push(...data);
      page++;
      if (data.length < 100) {
        hasMore = false;
      }
    }
  }
  
  return { data: allData };
};

export const endpoints = {
  purchase: {
    masters: {
      list: (page = 1, pageSize = 10, search = '') => {
        const searchQuery = search ? `&filters[totalamount][$contains]=${encodeURIComponent(search)}` : '';
        return `${API_CONFIG.ENDPOINTS.PURCHASE_MASTERS}?pagination[page]=${page}&pagination[pageSize]=${pageSize}${searchQuery}`;
      },
      listAll: (search = '') => {
        const searchQuery = search ? `&filters[totalamount][$contains]=${encodeURIComponent(search)}` : '';
        return `${API_CONFIG.ENDPOINTS.PURCHASE_MASTERS}?${searchQuery}`;
      },
      create: () => API_CONFIG.ENDPOINTS.PURCHASE_MASTERS,
    },
    details: {
      list: (masterId: string) => `${API_CONFIG.ENDPOINTS.PURCHASES}?filters[pid][$eq]=${masterId}`,
      listAll: () => API_CONFIG.ENDPOINTS.PURCHASES,
      create: () => API_CONFIG.ENDPOINTS.PURCHASES,
    }
  },
  barcode: {
    list: (pageSize = 100) => `${API_CONFIG.ENDPOINTS.PURCHASES}?pagination[pageSize]=${pageSize}`,
    listAll: () => API_CONFIG.ENDPOINTS.PURCHASES,
    listBarcodes: () => `/api/barcodes`,
    create: () => '/api/barcodes'
  },
  sales: {
    masters: {
      list: (page = 1, pageSize = 25) => `/api/sales-masters?pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      listAll: () => '/api/sales-masters',
      create: () => '/api/sales-masters'
    },
    details: {
      list: (invoiceId: string) => `/api/sales?filters[invoice_id][$eq]=${invoiceId}`,
      listAll: () => '/api/sales',
      create: () => '/api/sales'
    }
  },
  customers: {
    list: (page = 1, pageSize = 100, search = '') => {
      const searchQuery = search ? `&filters[name][$contains]=${encodeURIComponent(search)}` : '';
      return `/api/customers?pagination[page]=${page}&pagination[pageSize]=${pageSize}${searchQuery}`;
    },
    listAll: (search = '') => {
      const searchQuery = search ? `&filters[name][$contains]=${encodeURIComponent(search)}` : '';
      return `/api/customers?${searchQuery}`;
    },
    create: (data?: any) => '/api/customers',
    findByPhone: (phone: string) => `/api/customers?filters[phone][$eq]=${phone}`
  },
  trays: {
    list: (pageSize = 100) => `/api/trays?pagination[pageSize]=${pageSize}`,
    listAll: () => '/api/trays',
    create: () => '/api/trays'
  },
  rates: {
    list: (pageSize = 100) => `/api/rates?pagination[pageSize]=${pageSize}`,
    listAll: () => '/api/rates',
    create: () => '/api/rates',
    update: (id: number) => `/api/rates/${id}`
  },
  estimation: {
    masters: {
      list: (page = 1, pageSize = 25) => `/api/estimation-masters?pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      listAll: () => '/api/estimation-masters',
      create: () => '/api/estimation-masters'
    },
    details: {
      list: (estimationId: string) => `/api/estimation-details?filters[estimation_id][$eq]=${estimationId}`,
      listAll: () => '/api/estimation-details',
      create: () => '/api/estimation-details'
    }
  },
  oldSilver: {
    listAll: () => '/api/old-silver-entries?sort=createdAt:desc'
  }
};