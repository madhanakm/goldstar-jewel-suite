import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Barcode, QrCode, Printer, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import { productService } from '@/lib/productService';
import { ProductForm } from './ProductForm';
import { EnhancedBarcodeGenerator } from '@/lib/enhancedBarcodeGenerator';
import { authService } from '@/lib/auth';

interface EnhancedProductManagerProps {
  onBack?: () => void;
}

export const EnhancedProductManager: React.FC<EnhancedProductManagerProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, [searchTerm, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Clear existing products first to ensure we only show API data
      setProducts([]);
      
      // Verify authentication first
      if (!authService.isAuthenticated()) {
        throw new Error('Please login to view products');
      }

      // Verify API connection
      const isConnected = await productService.verifyConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to API. Please check your connection and authentication.');
      }

      const filters = {
        search: searchTerm || undefined,
        category: categoryFilter && categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      console.log('Loading products with filters:', filters);
      const response = await productService.getProducts(1, 100, filters); // Increased limit to show more products
      console.log('Products loaded from API:', response);
      
      // Ensure we only show products that exist in the API
      if (response && Array.isArray(response.data)) {
        // Additional validation to ensure all products have required fields
        const validProducts = response.data.filter(product => 
          product && 
          product.id && 
          product.name && 
          product.sku &&
          typeof product.id === 'number' &&
          typeof product.name === 'string'
        );
        
        setProducts(validProducts);
        
        if (validProducts.length === 0) {
          console.log('No valid products found in API response');
          toast({
            title: "Info",
            description: "No products found in API. Products will appear here after being successfully added to the API.",
            variant: "default",
          });
        } else {
          console.log(`Displaying ${validProducts.length} valid products from API`);
          toast({
            title: "Success",
            description: `Loaded ${validProducts.length} products from API`,
            variant: "default",
          });
        }
      } else {
        console.error('Invalid API response structure:', response);
        setProducts([]);
        toast({
          title: "Warning",
          description: "Invalid response from API - no product data found",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Load products error:', error);
      setProducts([]); // Ensure we clear any cached data
      toast({
        title: "Error",
        description: error.message || "Failed to load products from API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productService.deleteProduct(id);
      toast({
        title: "Success",
        description: "Product deleted successfully from API",
      });
      // Reload products to ensure we show current API state
      loadProducts();
    } catch (error: any) {
      console.error('Delete product error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product from API",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedProduct(null);
    // Reload products to ensure we show current API state
    loadProducts();
  };

  const openBarcodeDialog = (product: Product) => {
    setBarcodeProduct(product);
    setShowBarcodeDialog(true);
  };

  const printBarcode = (product: Product, format: 'standard' | 'small' | 'large' = 'standard') => {
    const barcodeData = EnhancedBarcodeGenerator.generateBarcode(product.barcode);
    const qrData = EnhancedBarcodeGenerator.generateQRCode(JSON.stringify({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.selling_price
    }));

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const sizes = {
        small: { width: '200px', fontSize: '10px', padding: '10px' },
        standard: { width: '300px', fontSize: '12px', padding: '15px' },
        large: { width: '400px', fontSize: '14px', padding: '20px' }
      };

      const size = sizes[format];

      printWindow.document.write(`
        <html>
          <head>
            <title>Product Label - ${product.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .label { 
                border: 2px solid #000; 
                padding: ${size.padding}; 
                width: ${size.width}; 
                margin: 0 auto;
                text-align: center;
              }
              .product-name { font-weight: bold; font-size: ${size.fontSize}; margin-bottom: 5px; }
              .product-info { font-size: ${parseInt(size.fontSize) - 2}px; margin: 3px 0; }
              .barcode-section { margin: 10px 0; }
              .codes-container { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
              .qr-code { width: 60px; height: 60px; }
              @media print {
                body { margin: 0; }
                .label { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="product-name">${product.name}</div>
              <div class="product-info">SKU: ${product.sku}</div>
              <div class="product-info">Category: ${product.category}</div>
              <div class="product-info">Weight: ${product.weight}g | Purity: ${product.purity}</div>
              <div class="product-info">Price: ₹${product.selling_price}</div>
              <div class="barcode-section">
                <img src="${barcodeData}" alt="Barcode" style="max-width: 100%;" />
              </div>
              <div class="codes-container">
                <div>Stock: ${product.stock_quantity}</div>
                <img src="${qrData}" alt="QR Code" class="qr-code" />
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadBarcodeSheet = async (selectedProducts: Product[]) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 2480; // A4 width at 300 DPI
    canvas.height = 3508; // A4 height at 300 DPI
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const labelsPerRow = 3;
    const labelWidth = canvas.width / labelsPerRow;
    const labelHeight = 400;

    for (let i = 0; i < selectedProducts.length; i++) {
      const product = selectedProducts[i];
      const row = Math.floor(i / labelsPerRow);
      const col = i % labelsPerRow;
      const x = col * labelWidth;
      const y = row * labelHeight;

      // Draw border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y + 10, labelWidth - 20, labelHeight - 20);

      // Draw product info
      ctx.fillStyle = '#000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, x + labelWidth / 2, y + 50);

      ctx.font = '18px Arial';
      ctx.fillText(`SKU: ${product.sku}`, x + labelWidth / 2, y + 80);
      ctx.fillText(`Price: ₹${product.selling_price}`, x + labelWidth / 2, y + 110);

      // Generate and draw barcode
      const barcodeImg = new Image();
      barcodeImg.onload = () => {
        ctx.drawImage(barcodeImg, x + 50, y + 150, labelWidth - 100, 100);
      };
      barcodeImg.src = EnhancedBarcodeGenerator.generateBarcode(product.barcode);
    }

    // Download
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = 'product-barcodes.png';
      link.href = canvas.toDataURL();
      link.click();
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Back
            </Button>
          )}
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Enhanced Product Manager</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => downloadBarcodeSheet(products.slice(0, 12))}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Labels
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="rings">Rings</SelectItem>
                <SelectItem value="necklaces">Necklaces</SelectItem>
                <SelectItem value="earrings">Earrings</SelectItem>
                <SelectItem value="bracelets">Bracelets</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading products from API...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 space-y-4">
            <div>
              <p className="text-lg font-medium">No products found in API</p>
              <p className="text-sm text-muted-foreground mt-2">
                Only products that exist in the API database will be displayed here.
                <br />Add products using the form above to see them appear in this list.
              </p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 p-3 rounded">
              <p><strong>Authentication:</strong> {authService.isAuthenticated() ? '✅ Connected' : '❌ Not authenticated'}</p>
              <p><strong>API URL:</strong> https://jewelapi.sricashway.com/api/products</p>
              <p><strong>User:</strong> {authService.getUser()?.username || 'Not logged in'}</p>
              <p><strong>Token:</strong> {authService.getToken() ? '✅ Present' : '❌ Missing'}</p>
            </div>
            <Button onClick={loadProducts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh from API
            </Button>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant={
                    product.status === 'active' ? 'default' :
                    product.status === 'out_of_stock' ? 'destructive' : 'secondary'
                  }>
                    {product.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Category: {product.category}</div>
                  <div>Weight: {product.weight}g</div>
                  <div>Purity: {product.purity}</div>
                  <div>Stock: {product.stock_quantity}</div>
                  <div className="col-span-2">Price: ₹{product.selling_price}</div>
                  <div className="col-span-2 text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                    <strong>API Data:</strong> ID: {product.id} | SKU: {product.sku}
                    {product.barcode && <span> | Barcode: {product.barcode}</span>}
                  </div>
                </div>
                
                <div className="flex gap-1 pt-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openBarcodeDialog(product)}
                  >
                    <Barcode className="h-3 w-3 mr-1" />
                    Codes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printBarcode(product)}
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Print
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setSelectedProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product Codes - {barcodeProduct?.name}</DialogTitle>
          </DialogHeader>
          {barcodeProduct && (
            <div className="space-y-4 text-center">
              <div>
                <h3 className="font-semibold mb-2">Barcode</h3>
                <img 
                  src={EnhancedBarcodeGenerator.generateBarcode(barcodeProduct.barcode)} 
                  alt="Barcode" 
                  className="mx-auto border"
                />
                <p className="text-sm text-muted-foreground mt-1">{barcodeProduct.barcode}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">QR Code</h3>
                <img 
                  src={EnhancedBarcodeGenerator.generateQRCode(JSON.stringify({
                    id: barcodeProduct.id,
                    name: barcodeProduct.name,
                    sku: barcodeProduct.sku,
                    price: barcodeProduct.selling_price
                  }))} 
                  alt="QR Code" 
                  className="mx-auto w-32 h-32 border"
                />
              </div>

              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={() => printBarcode(barcodeProduct, 'small')}>
                  Small Label
                </Button>
                <Button size="sm" onClick={() => printBarcode(barcodeProduct, 'standard')}>
                  Standard Label
                </Button>
                <Button size="sm" onClick={() => printBarcode(barcodeProduct, 'large')}>
                  Large Label
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};