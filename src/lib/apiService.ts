const STRAPI_URL = 'https://jewelapi.sricashway.com';

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${STRAPI_URL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Products
  async getProducts(page = 1, pageSize = 25, filters: any = {}) {
    let endpoint = `/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`;
    
    if (filters.category) {
      endpoint += `&filters[category][$eq]=${filters.category}`;
    }
    if (filters.status) {
      endpoint += `&filters[product_status][$eq]=${filters.status}`;
    }
    if (filters.search) {
      endpoint += `&filters[$or][0][name][$containsi]=${filters.search}&filters[$or][1][sku][$containsi]=${filters.search}`;
    }

    return this.request(endpoint);
  }

  async getProduct(id: number) {
    return this.request(`/products/${id}?populate=*`);
  }

  async createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async updateProduct(id: number, data: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers
  async getCustomers(page = 1, pageSize = 25, search?: string) {
    let endpoint = `/customers?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    
    if (search) {
      endpoint += `&filters[$or][0][name][$containsi]=${search}&filters[$or][1][phone][$containsi]=${search}`;
    }

    return this.request(endpoint);
  }

  async createCustomer(data: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // Sales
  async getSales(page = 1, pageSize = 25, filters: any = {}) {
    let endpoint = `/sales?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`;
    
    if (filters.status) {
      endpoint += `&filters[payment_status][$eq]=${filters.status}`;
    }
    if (filters.date_from) {
      endpoint += `&filters[date][$gte]=${filters.date_from}`;
    }
    if (filters.date_to) {
      endpoint += `&filters[date][$lte]=${filters.date_to}`;
    }

    return this.request(endpoint);
  }

  async createSale(data: any) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // Sale Items
  async createSaleItem(data: any) {
    return this.request('/sale-items', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // Locker Rooms
  async getLockerRooms() {
    return this.request('/locker-rooms?populate=*');
  }

  async createLockerRoom(data: any) {
    return this.request('/locker-rooms', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async updateLockerRoom(id: number, data: any) {
    return this.request(`/locker-rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }
}

export const apiService = ApiService.getInstance();