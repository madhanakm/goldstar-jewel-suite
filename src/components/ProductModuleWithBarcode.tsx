import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, QrCode, Package, BarChart3, AlertTriangle } from 'lucide-react';
import { Product, ProductFormData } from '../types/product';
import { productApiService } from '../lib/productApiService';
import { barcodeService } from '../lib/barcodeService';
import JsBarcode from 'jsbarcode';

interface ProductModuleWithBarcodeProps {
  onBack?: () => void;
}

export const ProductModuleWithBarcode: React.FC<ProductModuleWithBarcodeProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await productApiService.getProducts({
        search: searchTerm,
        category: selectedCategory || undefined
      });
      setProducts(result.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await productApiService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProduct) {
        await productApiService.updateProduct(editingProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await productApiService.createProduct(formData);
        toast.success('Product created with barcode');
      }
      
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productApiService.deleteProduct(id);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const generateNewBarcode = async (productId: number, type: 'CODE128' | 'EAN13' | 'QR' = 'CODE128') => {
    try {
      const newBarcode = await productApiService.generateProductBarcode(productId, type);
      toast.success('New barcode generated');
      loadProducts();
      return newBarcode;
    } catch (error) {
      toast.error('Failed to generate barcode');
    }
  };

  const printBarcode = (barcode: string, productName: string) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcode, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Barcode - ${productName}</title></head>
          <body style="text-align: center; padding: 20px;">
            <h3>${productName}</h3>
            <img src="${canvas.toDataURL()}" />
            <p>${barcode}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
    setEditingProduct(null);
    setIsAddDialogOpen(false);
  };

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || '',
      description: product.description || '',
      weight: product.weight,
      purity: product.purity,
      making_charges: product.making_charges,
      stone_charges: product.stone_charges || 0,
      other_charges: product.other_charges || 0,
      stock_quantity: product.stock_quantity,
      min_stock_level: product.min_stock_level,
      supplier: product.supplier || '',
      purchase_date: product.purchase_date || '',
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      discount_percentage: product.discount_percentage || 0,
      tax_percentage: product.tax_percentage,
      location: product.location || '',
      notes: product.notes || ''
    });
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button onClick={onBack} variant="outline">
              ← Back
            </Button>
          )}
          <h2 className="text-3xl font-bold">Product Management</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="purity">Purity</Label>
                  <Input
                    id="purity"
                    value={formData.purity}
                    onChange={(e) => setFormData({...formData, purity: e.target.value})}
                    placeholder="e.g., 22K, 18K"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_price">Purchase Price</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({...formData, purchase_price: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="selling_price">Selling Price</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="making_charges">Making Charges</Label>
                  <Input
                    id="making_charges"
                    type="number"
                    step="0.01"
                    value={formData.making_charges}
                    onChange={(e) => setFormData({...formData, making_charges: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="stone_charges">Stone Charges</Label>
                  <Input
                    id="stone_charges"
                    type="number"
                    step="0.01"
                    value={formData.stone_charges}
                    onChange={(e) => setFormData({...formData, stone_charges: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="other_charges">Other Charges</Label>
                  <Input
                    id="other_charges"
                    type="number"
                    step="0.01"
                    value={formData.other_charges}
                    onChange={(e) => setFormData({...formData, other_charges: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search products by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={loadProducts} disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.weight}g</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {product.stock_quantity}
                      {product.stock_quantity <= product.min_stock_level && (
                        <AlertTriangle className="w-4 h-4 ml-1 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>₹{product.selling_price}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {product.barcode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProduct(product);
                          setBarcodeDialogOpen(true);
                        }}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Barcode Dialog */}
      <Dialog open={barcodeDialogOpen} onOpenChange={setBarcodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Barcode Management - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <canvas
                id="barcode-canvas"
                ref={(canvas) => {
                  if (canvas && selectedProduct?.barcode) {
                    JsBarcode(canvas, selectedProduct.barcode, {
                      format: 'CODE128',
                      width: 2,
                      height: 100,
                      displayValue: true
                    });
                  }
                }}
              />
              <p className="mt-2 text-sm text-gray-600">{selectedProduct?.barcode}</p>
            </div>
            <div className="flex space-x-2 justify-center">
              <Button
                onClick={() => selectedProduct && printBarcode(selectedProduct.barcode, selectedProduct.name)}
              >
                Print Barcode
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedProduct && generateNewBarcode(selectedProduct.id, 'CODE128')}
              >
                Generate New
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};