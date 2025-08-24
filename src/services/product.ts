import { apiService } from './api';
import { Product, ProductFormData } from '@/types';
import { ApiResponse } from '@/types';

export interface ProductFilters {
  category?: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export class ProductService {
  private static instance: ProductService;

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('filters[category][$eq]', filters.category);
    if (filters.search) params.append('filters[$or][0][name][$containsi]', filters.search);
    if (filters.search) params.append('filters[$or][1][sku][$containsi]', filters.search);
    if (filters.status) params.append('filters[status][$eq]', filters.status);
    if (filters.page) params.append('pagination[page]', filters.page.toString());
    if (filters.pageSize) params.append('pagination[pageSize]', filters.pageSize.toString());

    const endpoint = `/products?${params.toString()}`;
    return apiService.get<Product[]>(endpoint);
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return apiService.get<Product>(`/products/${id}`);
  }

  async createProduct(data: ProductFormData): Promise<ApiResponse<Product>> {
    return apiService.post<Product>('/products', { data });
  }

  async updateProduct(id: number, data: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    return apiService.put<Product>(`/products/${id}`, { data });
  }

  async deleteProduct(id: number): Promise<ApiResponse<null>> {
    return apiService.delete<null>(`/products/${id}`);
  }

  async generateBarcode(productId: number): Promise<ApiResponse<{ barcode: string }>> {
    return apiService.post<{ barcode: string }>(`/products/${productId}/generate-barcode`);
  }

  async bulkImport(products: ProductFormData[]): Promise<ApiResponse<Product[]>> {
    return apiService.post<Product[]>('/products/bulk-import', { products });
  }

  async exportProducts(filters: ProductFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const response = await apiService.get<Blob>(`/products/export?${params.toString()}`, {
      headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    });
    
    return response.data;
  }
}

export const productService = ProductService.getInstance();