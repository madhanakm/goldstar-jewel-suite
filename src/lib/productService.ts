import { authService } from './auth';
import { Product, ProductFormData, ProductCategory } from '@/types/product';

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

      console.log('Creating product with payload:', payload);

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create product API error:', response.status, errorText);
        
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
      console.log('Product created successfully:', result);
      
      if (!result.data || !result.data.id) {
        throw new Error('Product created but invalid data returned from API');
      }
      
      // Verify the product was actually created by fetching it back
      try {
        const verifyProduct = await this.getProduct(result.data.id);
        console.log('Product creation verified:', verifyProduct);
        return verifyProduct;
      } catch (verifyError) {
        console.warn('Could not verify product creation, returning original result:', verifyError);
        return result.data;
      }
    } catch (error) {
      console.error('Create product error:', error);
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
          endpoint += `&filters[$or][0][name][$containsi]=${filters.search}&filters[$or][1][sku][$containsi]=${filters.search}&filters[$or][2][barcode][$containsi]=${filters.search}`;
        }
      }

      console.log('Fetching products from API:', `${STRAPI_URL}${endpoint}`);
      const response = await authService.authenticatedFetch(`${STRAPI_URL}${endpoint}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', response.status, errorText);
        throw new Error(`Failed to fetch products from API: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      // Ensure we return empty array if no data and validate data structure
      if (!result || !Array.isArray(result.data)) {
        console.warn('Invalid API response structure:', result);
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
      
      console.log(`Filtered ${validProducts.length} valid products from ${result.data.length} total`);
      
      return {
        data: validProducts,
        meta: result.meta || { pagination: { total: validProducts.length, page: page, pageSize: pageSize } }
      };
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  // Get Product by ID
  async getProduct(id: number): Promise<Product> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      console.log(`Fetching product ${id} from API`);
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products/${id}?populate=*`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch product ${id}:`, response.status, errorText);
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Product ${id} fetched successfully:`, result.data);
      
      if (!result.data || !result.data.id) {
        throw new Error('Invalid product data returned from API');
      }
      
      return result.data;
    } catch (error) {
      console.error('Get product error:', error);
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
      console.error('Update product error:', error);
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
      console.error('Delete product error:', error);
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
      console.error('Get categories error:', error);
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
        `${STRAPI_URL}/api/products?filters[barcode][$eq]=${barcode}&populate=*`
      );

      if (!response.ok) {
        throw new Error('Failed to search product');
      }

      const result = await response.json();
      return result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('Search by barcode error:', error);
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
      console.error('Update stock error:', error);
      throw error;
    }
  }

  // Verify API Connection
  async verifyConnection(): Promise<boolean> {
    try {
      if (!authService.isAuthenticated()) {
        console.log('Not authenticated, cannot verify connection');
        return false;
      }

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/products?pagination[pageSize]=1`
      );

      const isConnected = response.ok;
      console.log('API connection test:', isConnected ? 'SUCCESS' : 'FAILED', response.status);
      
      if (!isConnected) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('API connection failed:', response.status, errorText);
      }

      return isConnected;
    } catch (error) {
      console.error('API connection error:', error);
      return false;
    }
  }
}

export const productService = ProductService.getInstance();