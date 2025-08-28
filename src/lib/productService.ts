import { authService } from './auth';
import { Product, ProductFormData, ProductCategory } from '@/types/product';
import { secureLogger, sanitizeQueryParam } from '@/utils/sanitizer';

const STRAPI_URL = 'https://jewelapi.sricashway.com';

export class ProductService {
  private static instance: ProductService;

  private constructor() {}

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  // Generate SKU
  private generateSKU(category: string, name: string): string {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${categoryCode}${nameCode}${timestamp}`;
  }

  // Generate Barcode
  private generateBarcode(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
  }

  // Create Product
  async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      // Validate required fields
      if (!productData.name || !productData.category || !productData.weight || !productData.purity) {
        throw new Error('Missing required fields: name, category, weight, and purity are required');
      }

      const sku = this.generateSKU(productData.category, productData.name);
      const barcode = this.generateBarcode();
      
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
          status: 'active',
          product_status: 'active', // Ensure both status fields are set
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      secureLogger.log('Creating product with payload', 'Product creation initiated');

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        secureLogger.error('Create product API error', `Status: ${response.status}`);
        
        let errorMessage = `Failed to create product: ${response.status} - ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error?.details) {
            errorMessage = JSON.stringify(errorData.error.details);
          }
        } catch (e) {
          // Use default error message if JSON parsing fails
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      secureLogger.log('Product created successfully', `Product ID: ${result.data?.id}`);
      
      if (!result.data || !result.data.id) {
        throw new Error('Product created but invalid data returned from API');
      }
      
      // Verify the product was actually created by fetching it back
      try {
        const verifyProduct = await this.getProduct(result.data.id);
        secureLogger.log('Product creation verified', `Product ID: ${verifyProduct.id}`);
        return verifyProduct;
      } catch (verifyError) {
        secureLogger.error('Could not verify product creation', verifyError);
        return result.data;
      }
    } catch (error) {
      secureLogger.error('Create product error', error);
      throw error;
    }
  }

  // Get All Products - Only from API
  async getProducts(page = 1, pageSize = 25, filters?: any): Promise<{
    data: Product[];
    meta: any;
  }> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.');
      }

      let endpoint = `/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`;
      
      if (filters) {
        if (filters.category && filters.category !== 'all') {
          endpoint += `&filters[category][$eq]=${filters.category}`;
        }
        if (filters.status && filters.status !== 'all') {
          endpoint += `&filters[status][$eq]=${filters.status}`;
        }
        if (filters.search) {
          const sanitizedSearch = encodeURIComponent(sanitizeQueryParam(filters.search));
          endpoint += `&filters[$or][0][name][$containsi]=${sanitizedSearch}&filters[$or][1][sku][$containsi]=${sanitizedSearch}&filters[$or][2][barcode][$containsi]=${sanitizedSearch}`;
        }
      }

      secureLogger.log('Fetching products from API', 'Products fetch initiated');
      const response = await authService.authenticatedFetch(`${STRAPI_URL}${endpoint}`);

      if (!response.ok) {
        const errorText = await response.text();
        secureLogger.error('API Response Error', `Status: ${response.status}`);
        throw new Error(`Failed to fetch products from API: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      secureLogger.log('API Response received', `Products count: ${result.data?.length || 0}`);
      
      // Ensure we return empty array if no data and validate data structure
      if (!result || !Array.isArray(result.data)) {
        secureLogger.error('Invalid API response structure', 'Response validation failed');
        return { data: [], meta: { pagination: { total: 0, page: 1, pageSize: pageSize } } };
      }
      
      // Filter out any invalid products and ensure all have required fields
      const validProducts = result.data.filter((product: any) => 
        product && 
        product.id && 
        product.name && 
        product.sku &&
        typeof product.id === 'number'
      );
      
      secureLogger.log('Products filtered', `Valid: ${validProducts.length}, Total: ${result.data.length}`);
      
      return {
        data: validProducts,
        meta: result.meta || { pagination: { total: validProducts.length, page: page, pageSize: pageSize } }
      };
    } catch (error) {
      secureLogger.error('Get products error', error);
      throw error;
    }
  }

  // Get Product by ID
  async getProduct(id: number): Promise<Product> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      secureLogger.log('Fetching product from API', `Product ID: ${id}`);
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products/${id}?populate=*`
      );

      if (!response.ok) {
        const errorText = await response.text();
        secureLogger.error('Failed to fetch product', `ID: ${id}, Status: ${response.status}`);
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const result = await response.json();
      secureLogger.log('Product fetched successfully', `Product ID: ${id}`);
      
      if (!result.data || !result.data.id) {
        throw new Error('Invalid product data returned from API');
      }
      
      return result.data;
    } catch (error) {
      secureLogger.error('Get product error', error);
      throw error;
    }
  }

  // Update Product
  async updateProduct(id: number, productData: Partial<ProductFormData>): Promise<Product> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const payload = {
        data: {
          ...productData,
          updatedAt: new Date().toISOString()
        }
      };

      // Recalculate total if pricing fields are updated
      if (productData.making_charges || productData.stone_charges || productData.other_charges || productData.purchase_price) {
        const current = await this.getProduct(id);
        payload.data.total_amount = 
          (productData.purchase_price ?? current.purchase_price) + 
          (productData.making_charges ?? current.making_charges) + 
          (productData.stone_charges ?? current.stone_charges ?? 0) + 
          (productData.other_charges ?? current.other_charges ?? 0);
      }

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to update product: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      secureLogger.error('Update product error', error);
      throw error;
    }
  }

  // Delete Product
  async deleteProduct(id: number): Promise<void> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`);
      }
    } catch (error) {
      secureLogger.error('Delete product error', error);
      throw error;
    }
  }

  // Get Categories
  async getCategories(): Promise<string[]> {
    try {
      if (!authService.isAuthenticated()) {
        return ['rings', 'necklaces', 'earrings', 'bracelets', 'bangles', 'chains', 'pendants'];
      }

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products?fields[0]=category`
      );

      if (!response.ok) {
        return ['rings', 'necklaces', 'earrings', 'bracelets', 'bangles', 'chains', 'pendants'];
      }

      const result = await response.json();
      const categories = [...new Set(result.data.map((p: any) => p.category))];
      return categories.filter(Boolean);
    } catch (error) {
      secureLogger.error('Get categories error', error);
      return ['rings', 'necklaces', 'earrings', 'bracelets', 'bangles', 'chains', 'pendants'];
    }
  }

  // Search Products by Barcode
  async searchByBarcode(barcode: string): Promise<Product | null> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products?filters[barcode][$eq]=${encodeURIComponent(sanitizeQueryParam(barcode))}&populate=*`
      );

      if (!response.ok) {
        throw new Error('Failed to search product');
      }

      const result = await response.json();
      return result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      secureLogger.error('Search by barcode error', error);
      throw error;
    }
  }

  // Update Stock
  async updateStock(id: number, quantity: number, operation: 'add' | 'subtract'): Promise<Product> {
    try {
      const product = await this.getProduct(id);
      const newQuantity = operation === 'add' 
        ? product.stock_quantity + quantity 
        : product.stock_quantity - quantity;

      const status = newQuantity <= 0 ? 'out_of_stock' : 'active';

      return await this.updateProduct(id, {
        stock_quantity: Math.max(0, newQuantity),
        status: status as any
      });
    } catch (error) {
      secureLogger.error('Update stock error', error);
      throw error;
    }
  }

  // Verify API Connection
  async verifyConnection(): Promise<boolean> {
    try {
      if (!authService.isAuthenticated()) {
        secureLogger.log('Not authenticated, cannot verify connection');
        return false;
      }

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products?pagination[pageSize]=1`
      );

      const isConnected = response.ok;
      secureLogger.log('API connection test', isConnected ? 'SUCCESS' : 'FAILED');
      
      if (!isConnected) {
        const errorText = await response.text().catch(() => 'Unknown error');
        secureLogger.error('API connection failed', `Status: ${response.status}`);
      }

      return isConnected;
    } catch (error) {
      secureLogger.error('API connection error', error);
      return false;
    }
  }
}

export const productService = ProductService.getInstance();