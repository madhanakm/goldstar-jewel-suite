import { authService } from './auth';
import { barcodeService } from './barcodeService';
import { Product, ProductFormData } from '../types/product';

const STRAPI_URL = 'https://jewelapi.sricashway.com';

export class ProductApiService {
  private static instance: ProductApiService;

  private constructor() {}

  public static getInstance(): ProductApiService {
    if (!ProductApiService.instance) {
      ProductApiService.instance = new ProductApiService();
    }
    return ProductApiService.instance;
  }

  // Create new product with barcode
  async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      const payload = {
        data: {
          ...productData,
          sku: this.generateSKU(productData.category, productData.name),
          total_amount: this.calculateTotalAmount(productData),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create product');
      }

      const result = await response.json();
      const product = result.data;

      // Generate barcode for the new product
      const barcode = await barcodeService.generateBarcode(product.id);
      
      // Update product with barcode
      await this.updateProduct(product.id, { barcode: barcode.barcode });

      return { ...product, barcode: barcode.barcode };
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  // Get all products
  async getProducts(filters?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; meta: any }> {
    try {
      let url = `${STRAPI_URL}/api/products?populate=*`;
      
      if (filters) {
        const params = new URLSearchParams();
        
        if (filters.category) {
          params.append('filters[category][$eq]', filters.category);
        }
        if (filters.status) {
          params.append('filters[status][$eq]', filters.status);
        }
        if (filters.search) {
          params.append('filters[$or][0][name][$containsi]', filters.search);
          params.append('filters[$or][1][sku][$containsi]', filters.search);
          params.append('filters[$or][2][barcode][$containsi]', filters.search);
        }
        if (filters.page) {
          params.append('pagination[page]', filters.page.toString());
        }
        if (filters.limit) {
          params.append('pagination[pageSize]', filters.limit.toString());
        }
        
        if (params.toString()) {
          url += '&' + params.toString();
        }
      }

      const response = await authService.authenticatedFetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  // Get single product
  async getProduct(id: number): Promise<Product> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products/${id}?populate=*`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id: number, updates: Partial<ProductFormData & { barcode?: string }>): Promise<Product> {
    try {
      const payload = {
        data: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      };

      if (updates.making_charges || updates.stone_charges || updates.other_charges || updates.purchase_price) {
        payload.data.total_amount = this.calculateTotalAmount(updates as any);
      }

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update product');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: number): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  // Generate new barcode for existing product
  async generateProductBarcode(productId: number, type: 'CODE128' | 'EAN13' | 'QR' = 'CODE128'): Promise<string> {
    try {
      const barcode = await barcodeService.generateBarcode(productId, type);
      
      // Update product with new barcode
      await this.updateProduct(productId, { barcode: barcode.barcode });
      
      return barcode.barcode;
    } catch (error) {
      console.error('Generate product barcode error:', error);
      throw error;
    }
  }

  // Search products by barcode
  async searchByBarcode(barcode: string): Promise<Product | null> {
    try {
      const barcodeData = await barcodeService.searchByBarcode(barcode);
      
      if (barcodeData && barcodeData.product) {
        return barcodeData.product;
      }
      
      return null;
    } catch (error) {
      console.error('Search by barcode error:', error);
      throw error;
    }
  }

  // Get product categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products?fields[0]=category`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();
      const categories = [...new Set(result.data.map((p: any) => p.category))];
      return categories.filter(Boolean);
    } catch (error) {
      console.error('Get categories error:', error);
      return ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant'];
    }
  }

  // Get low stock products
  async getLowStockProducts(): Promise<Product[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products?filters[$where][stock_quantity][$lte][$ref]=min_stock_level&populate=*`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch low stock products');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get low stock products error:', error);
      throw error;
    }
  }

  // Private helper methods
  private generateSKU(category: string, name: string): string {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${categoryCode}${nameCode}${timestamp}`;
  }

  private calculateTotalAmount(data: Partial<ProductFormData>): number {
    const makingCharges = data.making_charges || 0;
    const stoneCharges = data.stone_charges || 0;
    const otherCharges = data.other_charges || 0;
    const purchasePrice = data.purchase_price || 0;
    
    return purchasePrice + makingCharges + stoneCharges + otherCharges;
  }
}

export const productApiService = ProductApiService.getInstance();