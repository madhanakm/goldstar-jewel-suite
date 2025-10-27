import { generateBarcode } from '@/utils/helpers';
import JsBarcode from 'jsbarcode';

export interface BarcodeConfig {
  format: 'CODE128' | 'EAN13' | 'UPC' | 'CODE39';
  width: number;
  height: number;
  displayValue: boolean;
  fontSize?: number;
  textMargin?: number;
}

export class BarcodeService {
  private static instance: BarcodeService;

  public static getInstance(): BarcodeService {
    if (!BarcodeService.instance) {
      BarcodeService.instance = new BarcodeService();
    }
    return BarcodeService.instance;
  }

  generateBarcodeValue(type: 'CODE128' | 'EAN13' = 'CODE128'): string {
    return generateBarcode(type);
  }

  generateBarcodeImage(
    value: string, 
    config: BarcodeConfig = {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true
    }
  ): string {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, value, {
        format: config.format,
        width: config.width,
        height: config.height,
        displayValue: config.displayValue,
        fontSize: config.fontSize,
        textMargin: config.textMargin,
      });
      return canvas.toDataURL();
    } catch (error) {
      console.error('Barcode generation error:', error);
      throw new Error('Failed to generate barcode image');
    }
  }

  validateBarcode(value: string, format: string): boolean {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, value, { format });
      return true;
    } catch {
      return false;
    }
  }

  printBarcode(
    value: string, 
    productName: string, 
    config: BarcodeConfig = {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true
    }
  ): void {
    try {
      const barcodeImage = this.generateBarcodeImage(value, config);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Barcode - ${productName}</title>
            <style>
              body { 
                text-align: center; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
              }
              .barcode-container {
                border: 1px solid #ccc;
                padding: 20px;
                margin: 20px auto;
                width: fit-content;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                .barcode-container { border: none; margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <h3>${productName}</h3>
              <img src="${barcodeImage}" alt="Barcode" />
              <p><strong>${value}</strong></p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Auto print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      console.error('Print barcode error:', error);
      throw new Error('Failed to print barcode');
    }
  }

  downloadBarcode(
    value: string, 
    filename: string = 'barcode',
    config: BarcodeConfig = {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true
    }
  ): void {
    try {
      const barcodeImage = this.generateBarcodeImage(value, config);
      
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = barcodeImage;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download barcode error:', error);
      throw new Error('Failed to download barcode');
    }
  }
}

export const barcodeService = BarcodeService.getInstance();