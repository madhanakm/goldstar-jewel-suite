import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Scan, Lock, Unlock, Package, Search, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarcodeScanner } from "./BarcodeScanner";

interface LockerRoomManagementProps {
  onBack: () => void;
}

interface LockerProduct {
  id: string;
  barcode: string;
  itemName: string;
  category: string;
  weight: number;
  purity: string;
  value: number;
  customerName: string;
  customerPhone: string;
  location: 'inside' | 'outside';
  lockerNumber?: string;
  dateAdded: string;
  status: 'active' | 'returned';
}

export const LockerRoomManagement = ({ onBack }: LockerRoomManagementProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<LockerProduct[]>([
    {
      id: "1",
      barcode: "LCK001",
      itemName: "Gold Ring 22K",
      category: "Gold",
      weight: 5.5,
      purity: "22K",
      value: 28600,
      customerName: "Rajesh Kumar",
      customerPhone: "+91 98765 43210",
      location: 'inside',
      lockerNumber: "L-001",
      dateAdded: "2024-01-15",
      status: 'active'
    },
    {
      id: "2",
      barcode: "LCK002",
      itemName: "Silver Bangles Set",
      category: "Silver",
      weight: 45.0,
      purity: "925",
      value: 3675,
      customerName: "Priya Sharma",
      customerPhone: "+91 87654 32109",
      location: 'outside',
      dateAdded: "2024-01-16",
      status: 'active'
    },
    {
      id: "3",
      barcode: "LCK003",
      itemName: "Diamond Earrings",
      category: "Diamond",
      weight: 2.1,
      purity: "VVS1",
      value: 180600,
      customerName: "Meera Patel",
      customerPhone: "+91 99887 76543",
      location: 'inside',
      lockerNumber: "L-003",
      dateAdded: "2024-01-17",
      status: 'active'
    }
  ]);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState<'all' | 'inside' | 'outside'>('all');
  const [newProduct, setNewProduct] = useState({
    barcode: "",
    itemName: "",
    category: "",
    weight: 0,
    purity: "",
    value: 0,
    customerName: "",
    customerPhone: "",
    location: 'outside' as 'inside' | 'outside',
    lockerNumber: ""
  });

  const handleBarcodeScanned = (barcode: string) => {
    setIsScannerOpen(false);
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      toast({
        title: "Product Found",
        description: `${product.itemName} - ${product.location === 'inside' ? 'Inside Locker' : 'Outside Locker'}`,
      });
    } else {
      setNewProduct(prev => ({ ...prev, barcode }));
      setIsAddProductOpen(true);
      toast({
        title: "New Product",
        description: `Barcode ${barcode} scanned. Please add product details.`,
      });
    }
  };

  const addProduct = () => {
    if (!newProduct.barcode || !newProduct.itemName || !newProduct.customerName) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const product: LockerProduct = {
      id: Date.now().toString(),
      ...newProduct,
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setProducts([...products, product]);
    setNewProduct({
      barcode: "",
      itemName: "",
      category: "",
      weight: 0,
      purity: "",
      value: 0,
      customerName: "",
      customerPhone: "",
      location: 'outside',
      lockerNumber: ""
    });
    setIsAddProductOpen(false);
    
    toast({
      title: "Product Added",
      description: `${product.itemName} added to ${product.location === 'inside' ? 'locker room' : 'outside storage'}`,
    });
  };

  const moveProduct = (productId: string, newLocation: 'inside' | 'outside', lockerNumber?: string) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, location: newLocation, lockerNumber: newLocation === 'inside' ? lockerNumber : undefined }
        : p
    ));
    
    const product = products.find(p => p.id === productId);
    toast({
      title: "Product Moved",
      description: `${product?.itemName} moved to ${newLocation === 'inside' ? 'locker room' : 'outside storage'}`,
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || product.location === filterLocation;
    return matchesSearch && matchesLocation && product.status === 'active';
  });

  const insideProducts = filteredProducts.filter(p => p.location === 'inside');
  const outsideProducts = filteredProducts.filter(p => p.location === 'outside');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-luxury-dark flex items-center gap-2">
            <Lock className="w-8 h-8 text-primary" />
            Locker Room Management
          </h1>
          <p className="text-muted-foreground">Manage jewelry storage in locker room and outside areas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsScannerOpen(true)} variant="outline">
            <Scan className="w-4 h-4 mr-2" />
            Scan Product
          </Button>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product to Storage</DialogTitle>
                <DialogDescription>Add jewelry item to locker room management system</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Barcode *</Label>
                  <Input
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                    placeholder="LCK001"
                  />
                </div>
                <div>
                  <Label>Item Name *</Label>
                  <Input
                    value={newProduct.itemName}
                    onChange={(e) => setNewProduct({...newProduct, itemName: e.target.value})}
                    placeholder="Gold Ring 22K"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Diamond">Diamond</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Weight (g)</Label>
                  <Input
                    type="number"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({...newProduct, weight: Number(e.target.value)})}
                    placeholder="5.5"
                  />
                </div>
                <div>
                  <Label>Purity</Label>
                  <Input
                    value={newProduct.purity}
                    onChange={(e) => setNewProduct({...newProduct, purity: e.target.value})}
                    placeholder="22K, 925, VVS1"
                  />
                </div>
                <div>
                  <Label>Value (₹)</Label>
                  <Input
                    type="number"
                    value={newProduct.value}
                    onChange={(e) => setNewProduct({...newProduct, value: Number(e.target.value)})}
                    placeholder="28600"
                  />
                </div>
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={newProduct.customerName}
                    onChange={(e) => setNewProduct({...newProduct, customerName: e.target.value})}
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <Label>Customer Phone</Label>
                  <Input
                    value={newProduct.customerPhone}
                    onChange={(e) => setNewProduct({...newProduct, customerPhone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Select value={newProduct.location} onValueChange={(value: 'inside' | 'outside') => setNewProduct({...newProduct, location: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outside">Outside Locker</SelectItem>
                      <SelectItem value="inside">Inside Locker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newProduct.location === 'inside' && (
                  <div>
                    <Label>Locker Number</Label>
                    <Input
                      value={newProduct.lockerNumber}
                      onChange={(e) => setNewProduct({...newProduct, lockerNumber: e.target.value})}
                      placeholder="L-001"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={addProduct} className="flex-1">Add Product</Button>
                <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inside Locker</p>
                <p className="text-2xl font-bold">{insideProducts.length}</p>
              </div>
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outside Locker</p>
                <p className="text-2xl font-bold">{outsideProducts.length}</p>
              </div>
              <Unlock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'active').length}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{products.filter(p => p.status === 'active').reduce((sum, p) => sum + p.value, 0).toLocaleString()}</p>
              </div>
              <ArrowRightLeft className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by item name, barcode, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterLocation} onValueChange={(value: 'all' | 'inside' | 'outside') => setFilterLocation(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="inside">Inside Locker</SelectItem>
                <SelectItem value="outside">Outside Locker</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="inside">Inside Locker ({insideProducts.length})</TabsTrigger>
          <TabsTrigger value="outside">Outside Locker ({outsideProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono">{product.barcode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.itemName}</p>
                          <p className="text-sm text-muted-foreground">{product.category} • {product.weight}g • {product.purity}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.customerName}</p>
                          <p className="text-sm text-muted-foreground">{product.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.location === 'inside' ? 'default' : 'secondary'}>
                            {product.location === 'inside' ? 'Inside' : 'Outside'}
                          </Badge>
                          {product.lockerNumber && <span className="text-sm text-muted-foreground">{product.lockerNumber}</span>}
                        </div>
                      </TableCell>
                      <TableCell>₹{product.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveProduct(product.id, product.location === 'inside' ? 'outside' : 'inside', product.location === 'outside' ? 'L-' + String(Math.floor(Math.random() * 100)).padStart(3, '0') : undefined)}
                        >
                          Move to {product.location === 'inside' ? 'Outside' : 'Inside'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inside">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Inside Locker Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Locker</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insideProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono">{product.barcode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.itemName}</p>
                          <p className="text-sm text-muted-foreground">{product.category} • {product.weight}g</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{product.lockerNumber}</Badge>
                      </TableCell>
                      <TableCell>{product.customerName}</TableCell>
                      <TableCell>₹{product.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => moveProduct(product.id, 'outside')}>
                          Move Outside
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outside">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Unlock className="w-5 h-5" />
                Outside Locker Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outsideProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono">{product.barcode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.itemName}</p>
                          <p className="text-sm text-muted-foreground">{product.category} • {product.weight}g</p>
                        </div>
                      </TableCell>
                      <TableCell>{product.customerName}</TableCell>
                      <TableCell>₹{product.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => moveProduct(product.id, 'inside', 'L-' + String(Math.floor(Math.random() * 100)).padStart(3, '0'))}>
                          Move to Locker
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onScan={handleBarcodeScanned}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
};