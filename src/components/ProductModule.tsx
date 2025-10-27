import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Plus, Package, QrCode } from 'lucide-react';
import { Product, ProductFormData } from '../types/product';
import { productApiService } from '../lib/productApiService';
import JsBarcode from 'jsbarcode';
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper } from './common';
import { sidebarConfig } from '../lib/sidebarConfig';

interface ProductModuleProps {
  onBack?: () => void;
  onNavigate?: (module: string) => void;
}

export const ProductModule: React.FC<ProductModuleProps> = ({ onBack, onNavigate }) => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useSidebar();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedProduct, setGeneratedProduct] = useState<Product | null>(null);

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
    stock_quantity: 1,
    min_stock_level: 5,
    supplier: '',
    purchase_price: 0,
    selling_price: 0,
    discount_percentage: 0,
    tax_percentage: 18,
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategories(['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Chain']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const product = await productApiService.createProduct(formData);
      setGeneratedProduct(product);
      toast.success('Product created with barcode successfully!');
      resetForm();
    } catch (error) {
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
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
      stock_quantity: 1,
      min_stock_level: 5,
      supplier: '',
      purchase_price: 0,
      selling_price: 0,
      discount_percentage: 0,
      tax_percentage: 18,
      location: '',
      notes: ''
    });
  };

  const printBarcode = (product: Product) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, product.barcode, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Barcode - ${product.name}</title></head>
          <body style="text-align: center; padding: 20px;">
            <h3>${product.name}</h3>
            <p>SKU: ${product.sku}</p>
            <img src="${canvas.toDataURL()}" />
            <p>${product.barcode}</p>
            <p>Weight: ${product.weight}g | Purity: ${product.purity}</p>
            <p>Price: ₹${product.selling_price}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <PageLayout>
      <PageHeader 
        title="Add New Product"
        description="Create a new product with barcode generation"
        onBack={onBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Product Management", onClick: () => onNavigate?.("Product Management") },
          { label: "Add Product" }
        ]}
        icon={<Package className="w-5 h-5 mr-2" />}
      />
      
      <PageContent>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
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
                  <Label htmlFor="weight">Weight (g) *</Label>
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
                  <Label htmlFor="purity">Purity *</Label>
                  <Input
                    id="purity"
                    value={formData.purity}
                    onChange={(e) => setFormData({...formData, purity: e.target.value})}
                    placeholder="22K, 18K"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Quantity *</Label>
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
                  <Label htmlFor="purchase_price">Purchase Price *</Label>
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
                  <Label htmlFor="selling_price">Selling Price *</Label>
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

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Product & Generate Barcode'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Generated Product & Barcode */}
        {generatedProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Generated Product & Barcode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{generatedProduct.name}</h3>
                <p className="text-sm text-gray-600">SKU: {generatedProduct.sku}</p>
                <p className="text-sm text-gray-600">Category: {generatedProduct.category}</p>
                <p className="text-sm text-gray-600">Weight: {generatedProduct.weight}g | Purity: {generatedProduct.purity}</p>
                <p className="text-sm text-gray-600">Price: ₹{generatedProduct.selling_price}</p>
              </div>

              <div className="text-center">
                <canvas
                  ref={(canvas) => {
                    if (canvas && generatedProduct.barcode) {
                      JsBarcode(canvas, generatedProduct.barcode, {
                        format: 'CODE128',
                        width: 2,
                        height: 80,
                        displayValue: true
                      });
                    }
                  }}
                />
                <p className="mt-2 text-sm text-gray-600">{generatedProduct.barcode}</p>
              </div>

              <Button
                onClick={() => printBarcode(generatedProduct)}
                className="w-full"
                variant="outline"
              >
                Print Barcode Label
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      </PageContent>
      
      <SidebarWrapper
        categories={sidebarConfig}
        onNavigate={onNavigate || (() => {})}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
    </PageLayout>
  );
};