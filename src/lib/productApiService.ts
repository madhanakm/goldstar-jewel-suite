import { authService } from './auth';

const STRAPI_URL = 'https://jewelapi.sricashway.com';

export interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  weight: number;
  purity: string;
  making_charges: number;
  stone_charges?: number;
  other_charges?: number;
  stock_quantity: number;
  min_stock_level: number;
  supplier?: string;
  purchase_price: number;
  selling_price: number;
  discount_percentage?: number;
  tax_percentage: number;
  location?: string;
  notes?: string;
  sku: string;
  barcode: string;
  total_amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  weight: number;
  purity: string;
  making_charges: number;
  stone_charges?: number;
  other_charges?: number;
  stock_quantity: number;
  min_stock_level: number;
  supplier?: string;
  purchase_price: number;
  selling_price: number;
  discount_percentage?: number;
  tax_percentage: number;
  location?: string;
  notes?: string;
}

export class ProductApiService {
  private static instance: ProductApiService;

  private constructor() {}

  public static getInstance(): ProductApiService {
    if (!ProductApiService.instance) {
      ProductApiService.instance = new ProductApiService();
    }
    return ProductApiService.instance;
  }

  async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      const payload = {
        data: {
          ...productData,
          sku: this.generateSKU(productData.category, productData.name),
          barcode: this.generateBarcode(),
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
        throw new Error('Failed to create product');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  async getProducts(): Promise<{ data: Product[]; meta: any }> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products?populate=*`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  private generateSKU(category: string, name: string): string {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${categoryCode}${nameCode}${timestamp}`;
  }

  private generateBarcode(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }

  private calculateTotalAmount(data: ProductFormData): number {
    return data.purchase_price + data.making_charges + (data.stone_charges || 0) + (data.other_charges || 0);
  }
}

export const productApiService = ProductApiService.getInstance();