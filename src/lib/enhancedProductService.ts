import { authService } from './auth';
import { Product, ProductFormData, ProductCategory } from '@/types/product';

const STRAPI_URL = 'https://jewelapi.sricashway.com';

export interface ProductStats {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  total_value: number;
  by_category: Record<string, number>;
}

export interface ProductBatch {
  id: number;
  batch_number: string;
  products: Product[];
  created_at: string;
  total_items: number;
}

export class EnhancedProductService {
  private static instance: EnhancedProductService;

  private constructor() {}

  public static getInstance(): EnhancedProductService {
    if (!EnhancedProductService.instance) {
      EnhancedProductService.instance = new EnhancedProductService();
    }
    return EnhancedProductService.instance;
  }

  // Generate advanced SKU with category prefix
  private generateAdvancedSKU(category: string, subcategory?: string, weight?: number): string {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const subCategoryCode = subcategory ? subcategory.substring(0, 2).toUpperCase() : '';
    const weightCode = weight ? Math.floor(weight).toString().padStart(2, '0') : '';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${categoryCode}${subCategoryCode}${weightCode}${timestamp}${random}`;
  }

  // Generate barcode with check digit
  private generateBarcodeWithCheckDigit(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const baseCode = `${timestamp}${random}`;
    
    // Calculate check digit using Luhn algorithm
    let sum = 0;
    for (let i = 0; i < baseCode.length; i++) {
      let digit = parseInt(baseCode[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return `${baseCode}${checkDigit}`;
  }

  // Create product with enhanced features
  async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      const sku = this.generateAdvancedSKU(
        productData.category, 
        productData.subcategory, 
        productData.weight
      );
      const barcode = this.generateBarcodeWithCheckDigit();
      
      const total_amount = 
        productData.purchase_price + 
        productData.making_charges + 
        (productData.stone_charges || 0) + 
        (productData.other_charges || 0);

      const payload = {
        data: {
          ...productData,
          sku,
          barcode,
          total_amount,
          status: productData.stock_quantity > 0 ? 'active' : 'out_of_stock',
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
      return result.data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  // Bulk create products
  async bulkCreateProducts(productsData: ProductFormData[]): Promise<Product[]> {
    try {
      const createdProducts: Product[] = [];
      
      for (const productData of productsData) {
        const product = await this.createProduct(productData);
        createdProducts.push(product);
      }
      
      return createdProducts;
    } catch (error) {
      console.error('Bulk create products error:', error);
      throw error;
    }
  }

  // Get products with advanced filtering
  async getProducts(
    page = 1, 
    pageSize = 25, 
    filters?: {
      category?: string;
      subcategory?: string;
      status?: string;
      search?: string;
      priceRange?: { min: number; max: number };
      weightRange?: { min: number; max: number };
      purity?: string;
      lowStock?: boolean;
    }
  ): Promise<{ data: Product[]; meta: any }> {
    try {
      let url = `${STRAPI_URL}/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*&sort=createdAt:desc`;
      
      if (filters) {
        if (filters.category) {
          url += `&filters[category][$eq]=${filters.category}`;
        }
        if (filters.subcategory) {
          url += `&filters[subcategory][$eq]=${filters.subcategory}`;
        }
        if (filters.status) {
          url += `&filters[status][$eq]=${filters.status}`;
        }
        if (filters.purity) {
          url += `&filters[purity][$eq]=${filters.purity}`;
        }
        if (filters.search) {
          url += `&filters[$or][0][name][$containsi]=${filters.search}&filters[$or][1][sku][$containsi]=${filters.search}&filters[$or][2][barcode][$containsi]=${filters.search}`;
        }
        if (filters.priceRange) {
          url += `&filters[selling_price][$gte]=${filters.priceRange.min}&filters[selling_price][$lte]=${filters.priceRange.max}`;
        }
        if (filters.weightRange) {
          url += `&filters[weight][$gte]=${filters.weightRange.min}&filters[weight][$lte]=${filters.weightRange.max}`;
        }
        if (filters.lowStock) {
          url += `&filters[stock_quantity][$lte]=min_stock_level`;
        }
      }

      const response = await authService.authenticatedFetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  // Get product statistics
  async getProductStats(): Promise<ProductStats> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products?populate=*`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch product statistics');
      }

      const result = await response.json();
      const products = result.data;

      const stats: ProductStats = {
        total_products: products.length,
        active_products: products.filter((p: Product) => p.status === 'active').length,
        out_of_stock: products.filter((p: Product) => p.status === 'out_of_stock').length,
        low_stock: products.filter((p: Product) => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0).length,
        total_value: products.reduce((sum: number, p: Product) => sum + (p.selling_price * p.stock_quantity), 0),
        by_category: products.reduce((acc: Record<string, number>, p: Product) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {})
      };

      return stats;
    } catch (error) {
      console.error('Get product stats error:', error);
      throw error;
    }
  }

  // Create product batch
  async createProductBatch(products: ProductFormData[]): Promise<ProductBatch> {
    try {
      const batchNumber = `BATCH-${Date.now()}`;
      const createdProducts = await this.bulkCreateProducts(products);

      const batchData = {
        data: {
          batch_number: batchNumber,
          total_items: createdProducts.length,
          created_at: new Date().toISOString(),
          product_ids: createdProducts.map(p => p.id)
        }
      };

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/product-batches`,
        {
          method: 'POST',
          body: JSON.stringify(batchData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create product batch');
      }

      const result = await response.json();
      return {
        ...result.data,
        products: createdProducts
      };
    } catch (error) {
      console.error('Create product batch error:', error);
      throw error;
    }
  }

  // Export products to CSV
  async exportProducts(filters?: any): Promise<string> {
    try {
      const response = await this.getProducts(1, 1000, filters);
      const products = response.data;

      const headers = [
        'ID', 'Name', 'SKU', 'Barcode', 'Category', 'Subcategory', 
        'Weight', 'Purity', 'Stock', 'Purchase Price', 'Selling Price', 
        'Making Charges', 'Stone Charges', 'Status', 'Created At'
      ];

      const csvContent = [
        headers.join(','),
        ...products.map(product => [
          product.id,
          `"${product.name}"`,
          product.sku,
          product.barcode,
          product.category,
          product.subcategory || '',
          product.weight,
          product.purity,
          product.stock_quantity,
          product.purchase_price,
          product.selling_price,
          product.making_charges,
          product.stone_charges || 0,
          product.status,
          product.createdAt
        ].join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Export products error:', error);
      throw error;
    }
  }

  // Import products from CSV
  async importProducts(csvData: string): Promise<{ success: number; errors: string[] }> {
    try {
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      const errors: string[] = [];
      let success = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        try {
          const values = lines[i].split(',');
          const productData: ProductFormData = {
            name: values[1]?.replace(/"/g, '') || '',
            category: values[4] || '',
            subcategory: values[5] || undefined,
            weight: parseFloat(values[6]) || 0,
            purity: values[7] || '',
            stock_quantity: parseInt(values[8]) || 0,
            purchase_price: parseFloat(values[9]) || 0,
            selling_price: parseFloat(values[10]) || 0,
            making_charges: parseFloat(values[11]) || 0,
            stone_charges: parseFloat(values[12]) || 0,
            min_stock_level: 5,
            tax_percentage: 3
          };

          await this.createProduct(productData);
          success++;
        } catch (error) {
          errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { success, errors };
    } catch (error) {
      console.error('Import products error:', error);
      throw error;
    }
  }

  // Duplicate product
  async duplicateProduct(id: number, modifications?: Partial<ProductFormData>): Promise<Product> {
    try {
      const originalProduct = await this.getProduct(id);
      
      const duplicateData: ProductFormData = {
        name: `${originalProduct.name} (Copy)`,
        category: originalProduct.category,
        subcategory: originalProduct.subcategory,
        description: originalProduct.description,
        weight: originalProduct.weight,
        purity: originalProduct.purity,
        making_charges: originalProduct.making_charges,
        stone_charges: originalProduct.stone_charges,
        other_charges: originalProduct.other_charges,
        stock_quantity: 0, // Start with 0 stock for duplicates
        min_stock_level: originalProduct.min_stock_level,
        supplier: originalProduct.supplier,
        purchase_price: originalProduct.purchase_price,
        selling_price: originalProduct.selling_price,
        discount_percentage: originalProduct.discount_percentage,
        tax_percentage: originalProduct.tax_percentage,
        location: originalProduct.location,
        notes: originalProduct.notes,
        ...modifications
      };

      return await this.createProduct(duplicateData);
    } catch (error) {
      console.error('Duplicate product error:', error);
      throw error;
    }
  }

  // Get product by ID
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
  async updateProduct(id: number, productData: Partial<ProductFormData>): Promise<Product> {
    try {
      const payload = {
        data: {
          ...productData,
          updatedAt: new Date().toISOString()
        }
      };

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
}

export const enhancedProductService = EnhancedProductService.getInstance();