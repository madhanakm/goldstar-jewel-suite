import React, { useState, useRef } from 'react';
import { Barcode, Download, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import { productService } from '@/lib/productService';
import { BarcodeGenerator } from '@/lib/barcodeGenerator';

export const BarcodeManager: React.FC = () => {
  const [searchBarcode, setSearchBarcode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const barcodeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const searchProduct = async () => {
    if (!searchBarcode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a barcode to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const product = await productService.searchByBarcode(searchBarcode);
      if (product) {
        setFoundProduct(product);
        setShowBarcodeDialog(true);
      } else {
        toast({
          title: "Not Found",
          description: "No product found with this barcode",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBarcodeImage = (barcode: string) => {
    try {
      return BarcodeGenerator.generate(barcode);
    } catch (error) {
      console.error('Barcode generation error:', error);
      return '';
    }
  };

  const downloadBarcode = (product: Product) => {
    const barcodeImage = generateBarcodeImage(product.barcode);
    const link = document.createElement('a');
    link.download = `barcode-${product.sku}.png`;
    link.href = barcodeImage;
    link.click();
  };

  const printBarcode = (product: Product) => {
    const barcodeImage = generateBarcodeImage(product.barcode);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Barcode - ${product.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                margin: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .barcode-container { 
                border: 2px solid #000; 
                padding: 20px; 
                display: inline-block;
                background: white;
              }
              .product-info { 
                margin-bottom: 15px; 
                font-size: 14px;
                line-height: 1.4;
              }
              .product-name {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 5px;
              }
              .barcode-img {
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div>SKU: ${product.sku}</div>
                <div>Weight: ${product.weight}g</div>
                <div>Purity: ${product.purity}</div>
                <div>Price: ₹${product.selling_price}</div>
              </div>
              <div class="barcode-img">
                <img src="${barcodeImage}" alt="Barcode" />
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const printMultipleBarcodes = (product: Product, quantity: number) => {
    const barcodeImage = generateBarcodeImage(product.barcode);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const barcodes = Array(quantity).fill(0).map((_, index) => `
        <div class="barcode-item">
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div>SKU: ${product.sku}</div>
            <div>Price: ₹${product.selling_price}</div>
          </div>
          <img src="${barcodeImage}" alt="Barcode" />
        </div>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Barcodes - ${product.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
              }
              .barcode-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                justify-items: center;
              }
              .barcode-item { 
                border: 1px solid #000; 
                padding: 15px; 
                text-align: center;
                background: white;
                page-break-inside: avoid;
              }
              .product-info { 
                margin-bottom: 10px; 
                font-size: 12px;
                line-height: 1.3;
              }
              .product-name {
                font-weight: bold;
                font-size: 13px;
                margin-bottom: 3px;
              }
              @media print {
                .barcode-grid {
                  grid-template-columns: repeat(3, 1fr);
                }
              }
            </style>
          </head>
          <body>
            <div class="barcode-grid">
              ${barcodes}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Barcode className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Barcode Manager</h1>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Product by Barcode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode to search..."
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProduct()}
              className="flex-1"
            />
            <Button onClick={searchProduct} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Barcode Display Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product Barcode</DialogTitle>
          </DialogHeader>
          {foundProduct && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{foundProduct.name}</h3>
                <p className="text-sm text-muted-foreground">SKU: {foundProduct.sku}</p>
                <p className="text-sm text-muted-foreground">Price: ₹{foundProduct.selling_price}</p>
              </div>
              
              <div className="flex justify-center" ref={barcodeRef}>
                <img 
                  src={generateBarcodeImage(foundProduct.barcode)} 
                  alt="Barcode" 
                  className="border rounded"
                />
              </div>

              <div className="text-center text-sm font-mono">
                {foundProduct.barcode}
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadBarcode(foundProduct)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => printBarcode(foundProduct)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Single
                </Button>
                <Button
                  size="sm"
                  onClick={() => printMultipleBarcodes(foundProduct, 6)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print 6 Labels
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm bg-muted p-3 rounded">
                <div>Category: {foundProduct.category}</div>
                <div>Weight: {foundProduct.weight}g</div>
                <div>Purity: {foundProduct.purity}</div>
                <div>Stock: {foundProduct.stock_quantity}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};