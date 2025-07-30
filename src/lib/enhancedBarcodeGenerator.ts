import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export class EnhancedBarcodeGenerator {
  // Generate standard barcode
  static generateBarcode(data: string, options?: {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
  }): string {
    const canvas = document.createElement('canvas');
    const opts = {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 14,
      textMargin: 5,
      ...options
    };

    JsBarcode(canvas, data, opts);
    return canvas.toDataURL();
  }

  // Generate QR Code
  static generateQRCode(data: string, options?: {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
  }): string {
    const canvas = document.createElement('canvas');
    const opts = {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };

    try {
      QRCode.toCanvas(canvas, data, opts);
      return canvas.toDataURL();
    } catch (error) {
      console.error('QR Code generation error:', error);
      return '';
    }
  }

  // Generate barcode with custom styling for labels
  static generateLabelBarcode(data: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
      small: { width: 1.5, height: 60, fontSize: 10 },
      medium: { width: 2, height: 80, fontSize: 12 },
      large: { width: 2.5, height: 100, fontSize: 14 }
    };

    return this.generateBarcode(data, sizes[size]);
  }

  // Generate product label with both barcode and QR code
  static generateProductLabel(product: {
    name: string;
    sku: string;
    barcode: string;
    price: number;
    weight?: number;
    purity?: string;
  }): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Set canvas size for label
    canvas.width = 400;
    canvas.height = 300;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Product name
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, canvas.width / 2, 40);

    // SKU
    ctx.font = '12px Arial';
    ctx.fillText(`SKU: ${product.sku}`, canvas.width / 2, 60);

    // Price
    ctx.fillText(`Price: ₹${product.price}`, canvas.width / 2, 80);

    // Weight and purity if available
    if (product.weight && product.purity) {
      ctx.fillText(`${product.weight}g | ${product.purity}`, canvas.width / 2, 100);
    }

    // Generate barcode image
    const barcodeImg = new Image();
    barcodeImg.onload = () => {
      ctx.drawImage(barcodeImg, 50, 120, 300, 80);
    };
    barcodeImg.src = this.generateBarcode(product.barcode);

    // Generate QR code
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, canvas.width - 80, canvas.height - 80, 60, 60);
    };
    qrImg.src = this.generateQRCode(JSON.stringify({
      sku: product.sku,
      name: product.name,
      price: product.price
    }));

    return canvas.toDataURL();
  }

  // Batch generate barcodes for multiple products
  static generateBarcodeSheet(products: Array<{
    name: string;
    sku: string;
    barcode: string;
    price: number;
  }>, labelsPerRow: number = 3): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // A4 size at 300 DPI
    canvas.width = 2480;
    canvas.height = 3508;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const labelWidth = canvas.width / labelsPerRow;
    const labelHeight = 400;

    products.forEach((product, index) => {
      const row = Math.floor(index / labelsPerRow);
      const col = index % labelsPerRow;
      const x = col * labelWidth;
      const y = row * labelHeight;

      // Draw individual label
      this.drawProductLabel(ctx, product, x, y, labelWidth, labelHeight);
    });

    return canvas.toDataURL();
  }

  private static drawProductLabel(
    ctx: CanvasRenderingContext2D,
    product: { name: string; sku: string; barcode: string; price: number },
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, y + 10, width - 20, height - 20);

    // Product info
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, x + width / 2, y + 50);

    ctx.font = '18px Arial';
    ctx.fillText(`SKU: ${product.sku}`, x + width / 2, y + 80);
    ctx.fillText(`Price: ₹${product.price}`, x + width / 2, y + 110);

    // Barcode placeholder (in real implementation, you'd draw the actual barcode)
    ctx.strokeRect(x + 50, y + 150, width - 100, 100);
    ctx.font = '12px Arial';
    ctx.fillText(product.barcode, x + width / 2, y + 200);
  }
}