import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Search, Download, RefreshCw, Package, Barcode, Eye } from 'lucide-react';
import { productService } from '@/lib/productService';
import { Product, ProductFormData } from '@/types/product';
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper } from '@/components/common';
import { sidebarConfig } from '@/lib/sidebarConfig';

interface BarcodeConfig {
  format: string;
  width: number;
  height: number;
  displayValue: boolean;
}
import JsBarcode from 'jsbarcode';

interface ProductManagementModuleProps {
  onProductSelect?: (product: Product) => void;
  onBack?: () => void;
  onNavigate?: (module: string) => void;
}

export const ProductManagementModule: React.FC<ProductManagementModuleProps> = ({ onProductSelect, onBack, onNavigate }) => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useSidebar();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    weight: 0,
    purity: '',
    making_charges: 0,
    stone_charges: 0,
    other_charges: 0,
    stock_quantity: 0,
    min_stock_level: 5,
    supplier: '',
    purchase_date: '',
    purchase_price: 0,
    selling_price: 0,
    discount_percentage: 0,
    tax_percentage: 18,
    location: '',
    notes: ''
  });

  const [barcodeConfig, setBarcodeConfig] = useState<BarcodeConfig>({
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true
  });

  const categories = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Chain', 'Pendant', 'Bangle'];
  const barcodeFormats = ['CODE128', 'EAN13', 'UPC', 'CODE39'];

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(currentPage, 20, {
        category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm || undefined,
        status: undefined
      });
      
      setProducts(response.data);
      setTotalPages(Math.ceil(response.meta.pagination.total / response.meta.pagination.pageSize));
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      setLoading(true);
      const newProduct = await productService.createProduct(formData);
      toast.success('Product added successfully');
      setShowAddDialog(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBarcode = async (productId: number) => {
    try {
      // Regenerate barcode functionality to be implemented
      toast.success('Barcode regeneration not yet implemented');
      return;
      toast.success('Barcode regenerated successfully');
      loadProducts();
    } catch (error) {
      toast.error('Failed to regenerate barcode');
      console.error(error);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      // Export functionality to be implemented
      toast.success('Export functionality not yet implemented');
      return;
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Products exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export products');
      console.error(error);
    }
  };

  const generateBarcodeImage = (barcode: string, config: BarcodeConfig) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcode, {
      format: config.format,
      width: config.width,
      height: config.height,
      displayValue: config.displayValue
    });
    return canvas.toDataURL();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      weight: 0,
      purity: '',
      making_charges: 0,
      stone_charges: 0,
      other_charges: 0,
      stock_quantity: 0,
      min_stock_level: 5,
      supplier: '',
      purchase_date: '',
      purchase_price: 0,
      selling_price: 0,
      discount_percentage: 0,
      tax_percentage: 18,
      location: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <PageHeader 
        title="Product Management"
        description="Manage your product catalog, categories, pricing, and variants"
        onBack={onBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Product Management" }
        ]}
        icon={<Package className="w-5 h-5 mr-2" />}
      />
      
      <PageContent>
        <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="barcodes">Barcodes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={loadProducts} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (grams)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="purity">Purity</Label>
                        <Input
                          id="purity"
                          value={formData.purity}
                          onChange={(e) => setFormData({...formData, purity: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchase_price">Purchase Price</Label>
                        <Input
                          id="purchase_price"
                          type="number"
                          value={formData.purchase_price}
                          onChange={(e) => setFormData({...formData, purchase_price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="selling_price">Selling Price</Label>
                        <Input
                          id="selling_price"
                          type="number"
                          value={formData.selling_price}
                          onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock_quantity">Stock Quantity</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="barcode_format">Barcode Format</Label>
                        <Select value={barcodeConfig.format} onValueChange={(value: any) => setBarcodeConfig({...barcodeConfig, format: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {barcodeFormats.map(format => (
                              <SelectItem key={format} value={format}>{format}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddProduct} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Products Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.selling_price}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(product.product_status)}>
                            {product.product_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowBarcodeDialog(true);
                              }}
                            >
                              <Barcode className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegenerateBarcode(product.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={() => handleExport('json')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="barcodes">
              <div className="text-center py-8">
                <Barcode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Barcode management features coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Product analytics coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
        </div>
      </PageContent>
      
      <SidebarWrapper
        categories={sidebarConfig}
        onNavigate={onNavigate || (() => {})}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Barcode Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Barcode</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={generateBarcodeImage(selectedProduct.barcode, barcodeConfig)}
                  alt="Barcode"
                  className="mx-auto"
                />
                <p className="mt-2 text-sm text-gray-600">{selectedProduct.barcode}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Product:</strong> {selectedProduct.name}
                </div>
                <div>
                  <strong>SKU:</strong> {selectedProduct.sku}
                </div>
                <div>
                  <strong>Category:</strong> {selectedProduct.category}
                </div>
                <div>
                  <strong>Price:</strong> ₹{selectedProduct.selling_price}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};