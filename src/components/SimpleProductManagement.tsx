import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, Package, ArrowLeft, Edit, Trash2, Barcode } from 'lucide-react';

interface SimpleProductManagementProps {
  onBack?: () => void;
}

interface SimpleProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
}

export const SimpleProductManagement: React.FC<SimpleProductManagementProps> = ({ onBack }) => {
  const [products, setProducts] = useState<SimpleProduct[]>([
    { id: 1, name: 'Gold Ring', sku: 'GR001', category: 'Ring', price: 25000, stock: 5, status: 'active' },
    { id: 2, name: 'Diamond Necklace', sku: 'DN001', category: 'Necklace', price: 85000, stock: 2, status: 'active' },
    { id: 3, name: 'Silver Earrings', sku: 'SE001', category: 'Earring', price: 3500, stock: 0, status: 'out_of_stock' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0
  });

  const categories = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Chain', 'Pendant', 'Bangle'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newProduct: SimpleProduct = {
      id: Date.now(),
      name: formData.name,
      sku: `${formData.category.substring(0, 2).toUpperCase()}${String(Date.now()).slice(-3)}`,
      category: formData.category,
      price: formData.price,
      stock: formData.stock,
      status: formData.stock > 0 ? 'active' : 'out_of_stock'
    };

    setProducts([...products, newProduct]);
    setShowAddDialog(false);
    setFormData({ name: '', category: '', price: 0, stock: 0 });
    toast.success('Product added successfully');
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-background to-luxury-cream p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Package className="h-5 w-5" />
            Product Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Product Catalog</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
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
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
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
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddProduct}>
                        Add Product
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
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.price.toLocaleString()}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(product.status)}>
                            {product.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Barcode className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map(category => (
                    <Card key={category} className="p-4">
                      <div className="text-center">
                        <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium">{category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {products.filter(p => p.category === category).length} products
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Price Range Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Under ₹10,000:</span>
                        <span>{products.filter(p => p.price < 10000).length} products</span>
                      </div>
                      <div className="flex justify-between">
                        <span>₹10,000 - ₹50,000:</span>
                        <span>{products.filter(p => p.price >= 10000 && p.price < 50000).length} products</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Above ₹50,000:</span>
                        <span>{products.filter(p => p.price >= 50000).length} products</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Average Prices by Category</h4>
                    <div className="space-y-2 text-sm">
                      {categories.map(category => {
                        const categoryProducts = products.filter(p => p.category === category);
                        const avgPrice = categoryProducts.length > 0 
                          ? categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length 
                          : 0;
                        return (
                          <div key={category} className="flex justify-between">
                            <span>{category}:</span>
                            <span>₹{avgPrice.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variants">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Variants</h3>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Product variants management coming soon</p>
                  <p className="text-sm text-gray-400 mt-2">
                    This will include size, weight, and design variant management
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};