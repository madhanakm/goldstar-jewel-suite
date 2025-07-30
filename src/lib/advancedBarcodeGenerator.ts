import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export interface BarcodeOptions {
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  textMargin?: number;
  background?: string;
  lineColor?: string;
}

export interface QROptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: { dark?: string; light?: string };
}

export interface ProductLabel {
  name: string;
  sku: string;
  barcode: string;
  price: number;
  weight?: number;
  purity?: string;
  category?: string;
  description?: string;
}

export class AdvancedBarcodeGenerator {
  // Generate barcode with advanced options
  static generateBarcode(data: string, options: BarcodeOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const opts = {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 14,
          textMargin: 5,
          background: '#ffffff',
          lineColor: '#000000',
          ...options
        };

        JsBarcode(canvas, data, opts);
        resolve(canvas.toDataURL());
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate QR code with advanced options
  static async generateQRCode(data: string, options: QROptions = {}): Promise<string> {
    const opts = {
      width: 200,
      margin: 2,
      errorCorrectionLevel: 'M' as const,
      color: { dark: '#000000', light: '#ffffff' },
      ...options
    };

    try {
      return await QRCode.toDataURL(data, opts);
    } catch (error) {
      throw new Error(`QR Code generation failed: ${error}`);
    }
  }

  // Generate professional jewelry label
  static async generateJewelryLabel(product: ProductLabel): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    canvas.width = 400;
    canvas.height = 350;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#d4af37');
    gradient.addColorStop(1, '#ffd700');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Header
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, canvas.width / 2, 35);

    // Product details
    ctx.font = '12px Arial';
    ctx.fillText(`SKU: ${product.sku}`, canvas.width / 2, 55);
    ctx.fillText(`Price: ₹${product.price.toLocaleString()}`, canvas.width / 2, 75);
    
    if (product.weight && product.purity) {
      ctx.fillText(`${product.weight}g | ${product.purity}`, canvas.width / 2, 95);
    }

    // Generate and draw barcode
    const barcodeDataUrl = await this.generateBarcode(product.barcode, {
      width: 1.5,
      height: 60,
      fontSize: 10
    });
    
    const barcodeImg = new Image();
    await new Promise((resolve) => {
      barcodeImg.onload = resolve;
      barcodeImg.src = barcodeDataUrl;
    });
    
    ctx.drawImage(barcodeImg, 50, 120, 300, 80);

    // Generate and draw QR code
    const qrData = JSON.stringify({
      sku: product.sku,
      name: product.name,
      price: product.price,
      weight: product.weight,
      purity: product.purity
    });
    
    const qrDataUrl = await this.generateQRCode(qrData, { width: 80 });
    const qrImg = new Image();
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.src = qrDataUrl;
    });
    
    ctx.drawImage(qrImg, canvas.width - 90, canvas.height - 90, 80, 80);

    // Footer
    ctx.font = '10px Arial';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText('Goldstar Jewel Suite', 20, canvas.height - 10);

    return canvas.toDataURL();
  }

  // Batch generate labels for printing
  static async generateBatchLabels(
    products: ProductLabel[],
    options: { labelsPerRow?: number; pageSize?: 'A4' | 'Letter' } = {}
  ): Promise<string> {
    const { labelsPerRow = 3, pageSize = 'A4' } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Page dimensions (A4 at 300 DPI)
    const dimensions = pageSize === 'A4' 
      ? { width: 2480, height: 3508 }
      : { width: 2550, height: 3300 };
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const labelWidth = canvas.width / labelsPerRow;
    const labelHeight = 400;
    const margin = 20;

    for (let i = 0; i < products.length; i++) {
      const row = Math.floor(i / labelsPerRow);
      const col = i % labelsPerRow;
      const x = col * labelWidth + margin;
      const y = row * labelHeight + margin;

      if (y + labelHeight > canvas.height) break; // Page full

      await this.drawMiniLabel(ctx, products[i], x, y, labelWidth - margin * 2, labelHeight - margin);
    }

    return canvas.toDataURL();
  }

  // Generate barcode for inventory tracking
  static async generateInventoryBarcode(
    sku: string,
    options: { includeChecksum?: boolean; format?: BarcodeOptions['format'] } = {}
  ): Promise<string> {
    const { includeChecksum = true, format = 'CODE128' } = options;
    
    let barcodeData = sku;
    if (includeChecksum && format === 'CODE128') {
      barcodeData = this.addChecksum(sku);
    }

    return this.generateBarcode(barcodeData, {
      format,
      width: 2,
      height: 80,
      displayValue: true,
      fontSize: 12
    });
  }

  // Validate barcode format
  static validateBarcodeData(data: string, format: BarcodeOptions['format'] = 'CODE128'): boolean {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, data, { format });
      return true;
    } catch {
      return false;
    }
  }

  private static async drawMiniLabel(
    ctx: CanvasRenderingContext2D,
    product: ProductLabel,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    // Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Product name
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, x + width / 2, y + 25);

    // Details
    ctx.font = '10px Arial';
    ctx.fillText(`SKU: ${product.sku}`, x + width / 2, y + 45);
    ctx.fillText(`₹${product.price.toLocaleString()}`, x + width / 2, y + 60);

    // Mini barcode
    const barcodeDataUrl = await this.generateBarcode(product.barcode, {
      width: 1,
      height: 40,
      fontSize: 8
    });
    
    const barcodeImg = new Image();
    await new Promise((resolve) => {
      barcodeImg.onload = resolve;
      barcodeImg.src = barcodeDataUrl;
    });
    
    ctx.drawImage(barcodeImg, x + 20, y + 80, width - 40, 60);
  }

  private static addChecksum(data: string): string {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data.charCodeAt(i) * (i + 1);
    }
    return data + (sum % 10).toString();
  }
}