import { authService } from './auth';
import { EnhancedBarcodeGenerator } from './enhancedBarcodeGenerator';

const STRAPI_URL = 'https://jewelapi.sricashway.com';

export interface BarcodeData {
  id: number;
  product_id: number;
  barcode: string;
  barcode_type: 'CODE128' | 'EAN13' | 'QR';
  generated_at: string;
  printed_count: number;
  is_active: boolean;
}

export class BarcodeService {
  private static instance: BarcodeService;

  private constructor() {}

  public static getInstance(): BarcodeService {
    if (!BarcodeService.instance) {
      BarcodeService.instance = new BarcodeService();
    }
    return BarcodeService.instance;
  }

  // Generate new barcode for product
  async generateBarcode(
    productId: number, 
    type: 'CODE128' | 'EAN13' | 'QR' = 'CODE128'
  ): Promise<BarcodeData> {
    try {
      let barcodeValue: string;
      
      if (type === 'EAN13') {
        barcodeValue = EnhancedBarcodeGenerator.generateEAN13(productId);
      } else {
        barcodeValue = `${Date.now()}${productId.toString().padStart(4, '0')}`;
      }

      const payload = {
        data: {
          product_id: productId,
          barcode: barcodeValue,
          barcode_type: type,
          generated_at: new Date().toISOString(),
          printed_count: 0,
          is_active: true
        }
      };

      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/product-barcodes`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate barcode');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Generate barcode error:', error);
      throw error;
    }
  }

  // Get all barcodes for a product
  async getProductBarcodes(productId: number): Promise<BarcodeData[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/product-barcodes?filters[product_id][$eq]=${productId}&populate=*`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch product barcodes');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get product barcodes error:', error);
      throw error;
    }
  }

  // Update barcode print count
  async updatePrintCount(barcodeId: number): Promise<void> {
    try {
      // First get current count
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/product-barcodes/${barcodeId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch barcode data');
      }

      const currentData = await response.json();
      const newCount = (currentData.data.printed_count || 0) + 1;

      // Update count
      const updateResponse = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/product-barcodes/${barcodeId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            data: {
              printed_count: newCount
            }
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error('Failed to update print count');
      }
    } catch (error) {
      console.error('Update print count error:', error);
      throw error;
    }
  }

  // Search product by barcode
  async searchByBarcode(barcode: string): Promise<any> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/product-barcodes?filters[barcode][$eq]=${barcode}&populate[product][populate]=*`
      );

      if (!response.ok) {
        throw new Error('Failed to search by barcode');
      }

      const result = await response.json();
      return result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('Search by barcode error:', error);
      throw error;
    }
  }

  // Deactivate barcode
  async deactivateBarcode(barcodeId: number): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/product-barcodes/${barcodeId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            data: {
              is_active: false
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to deactivate barcode');
      }
    } catch (error) {
      console.error('Deactivate barcode error:', error);
      throw error;
    }
  }

  // Get barcode statistics
  async getBarcodeStats(): Promise<{
    total_barcodes: number;
    active_barcodes: number;
    total_prints: number;
    by_type: Record<string, number>;
  }> {
    try {
      const response = await authService.authenticatedFetch(
        `${STRAPI_URL}/api/product-barcodes?populate=*`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch barcode statistics');
      }

      const result = await response.json();
      const barcodes = result.data;

      const stats = {
        total_barcodes: barcodes.length,
        active_barcodes: barcodes.filter((b: any) => b.is_active).length,
        total_prints: barcodes.reduce((sum: number, b: any) => sum + (b.printed_count || 0), 0),
        by_type: barcodes.reduce((acc: Record<string, number>, b: any) => {
          acc[b.barcode_type] = (acc[b.barcode_type] || 0) + 1;
          return acc;
        }, {})
      };

      return stats;
    } catch (error) {
      console.error('Get barcode stats error:', error);
      throw error;
    }
  }
}

export const barcodeService = BarcodeService.getInstance();