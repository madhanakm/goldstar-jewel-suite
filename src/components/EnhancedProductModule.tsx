import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Barcode, QrCode, Download, Print } from 'lucide-react';
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

export const EnhancedProductModule: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'EAN13' | 'QR'>('CODE128');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      };
      const response = await productService.getProducts(currentPage, 25, filters);
      setProducts(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
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
        description: "Product deleted successfully",
      });
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedProduct(null);
    loadProducts();
    toast({
      title: "Success",
      description: selectedProduct ? "Product updated successfully" : "Product created successfully",
    });
  };

  const generateBarcode = (product: Product, type: 'CODE128' | 'EAN13' | 'QR' = 'CODE128') => {
    try {
      return EnhancedBarcodeGenerator.generate(product.barcode, type, {
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        textMargin: 5,
      });
    } catch (error) {
      console.error('Barcode generation error:', error);
      return '';
    }
  };

  const downloadBarcode = (product: Product) => {
    const barcodeImage = generateBarcode(product, barcodeType);
    const link = document.createElement('a');
    link.download = `barcode-${product.sku}.png`;
    link.href = barcodeImage;
    link.click();
  };

  const printBarcode = (product: Product) => {
    const barcodeImage = generateBarcode(product, barcodeType);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Barcode - ${product.name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
              .barcode-container { border: 1px solid #ccc; padding: 20px; display: inline-block; margin: 10px; }
              .product-info { margin-bottom: 10px; font-size: 12px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <div class="product-info">
                <strong>${product.name}</strong><br>
                SKU: ${product.sku}<br>
                Price: ₹${product.selling_price}<br>
                Weight: ${product.weight}g | Purity: ${product.purity}
              </div>
              <img src="${barcodeImage}" alt="Barcode" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const printMultipleBarcodes = (products: Product[]) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const barcodeHtml = products.map(product => {
        const barcodeImage = generateBarcode(product, barcodeType);
        return `
          <div class="barcode-container">
            <div class="product-info">
              <strong>${product.name}</strong><br>
              SKU: ${product.sku}<br>
              Price: ₹${product.selling_price}<br>
              Weight: ${product.weight}g | Purity: ${product.purity}
            </div>
            <img src="${barcodeImage}" alt="Barcode" />
          </div>
        `;
      }).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Product Barcodes</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .barcode-container { 
                border: 1px solid #ccc; 
                padding: 15px; 
                display: inline-block; 
                margin: 5px; 
                text-align: center;
                width: 200px;
                vertical-align: top;
              }
              .product-info { margin-bottom: 10px; font-size: 11px; }
              @media print { 
                body { margin: 0; }
                .barcode-container { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            ${barcodeHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Enhanced Product Management</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => printMultipleBarcodes(products)}
            disabled={products.length === 0}
          >
            <Print className="h-4 w-4 mr-2" />
            Print All Barcodes
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
                <SelectItem value="">All Categories</SelectItem>
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
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={barcodeType} onValueChange={(value: any) => setBarcodeType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CODE128">CODE128</SelectItem>
                <SelectItem value="EAN13">EAN13</SelectItem>
                <SelectItem value="QR">QR Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8">No products found</div>
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
                </div>
                
                {/* Barcode Preview */}
                <div className="text-center py-2">
                  <img 
                    src={generateBarcode(product, barcodeType)} 
                    alt="Barcode" 
                    className="mx-auto max-w-full h-16 object-contain"
                  />
                </div>
                
                <div className="flex gap-1 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printBarcode(product)}
                  >
                    <Print className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadBarcode(product)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
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
    </div>
  );
};