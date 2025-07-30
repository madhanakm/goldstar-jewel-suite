import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Search, Plus, Edit, QrCode, AlertTriangle, TrendingUp, Gem } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryManagementProps {
  onBack: () => void;
}

interface InventoryItem {
  id: string;
  category: string;
  itemName: string;
  weight: number;
  purity: string;
  quantity: number;
  rate: number;
  value: number;
  barcode: string;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export const InventoryManagement = ({ onBack }: InventoryManagementProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const categories = ["Gold", "Silver", "Diamond", "Platinum", "Stones", "Others"];
  const purities = {
    Gold: ["24K", "22K", "18K", "14K"],
    Silver: ["999", "925", "900", "835", "800"],
    Diamond: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2"],
    Platinum: ["999", "950", "900"]
  };

  const silverCategories = [
    "Bangles", "Necklaces", "Earrings", "Rings", "Anklets", 
    "Bracelets", "Pendants", "Toe Rings", "Chains", "Sets"
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = filteredInventory.reduce((sum, item) => sum + item.value, 0);
  const lowStockItems = filteredInventory.filter(item => item.status === "Low Stock").length;

  const handleAddItem = () => {
    toast({
      title: "Item Added",
      description: "New inventory item has been added successfully.",
    });
    setIsAddItemOpen(false);
  };

  const generateBarcode = () => {
    const prefix = selectedCategory.substring(0, 2).toUpperCase();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${random.toString().padStart(4, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-luxury-dark">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your jewelry inventory, stock levels, and valuations</p>
        </div>
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>Add a new item to your inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
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
                <Label htmlFor="itemName">Item Name</Label>
                <Input placeholder="Enter item name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (grams)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="purity">Purity</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="22K">22K</SelectItem>
                      <SelectItem value="18K">18K</SelectItem>
                      <SelectItem value="925">925</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="rate">Rate per gram</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Input placeholder="e.g., Shelf A1" />
              </div>
              <Button onClick={handleAddItem} className="w-full">Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{filteredInventory.length}</p>
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
                <p className="text-2xl font-bold">₹{(totalValue / 100000).toFixed(1)}L</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Gem className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by item name or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Complete list of inventory items with current stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Weight (g)</TableHead>
                <TableHead>Purity</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Rate/g</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.weight}</TableCell>
                  <TableCell>{item.purity}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.rate}</TableCell>
                  <TableCell>₹{item.value.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "destructive" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};