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

  const mockInventory: InventoryItem[] = [
    { id: "1", category: "Gold", itemName: "Gold Ring 22K", weight: 5.5, purity: "22K", quantity: 25, rate: 5200, value: 143000, barcode: "GR22001", location: "Shelf A1", status: "In Stock" },
    { id: "2", category: "Gold", itemName: "Gold Chain 18K", weight: 12.2, purity: "18K", quantity: 8, rate: 4800, value: 469440, barcode: "GC18001", location: "Shelf A2", status: "Low Stock" },
    { id: "3", category: "Silver", itemName: "Silver Bangles Set", weight: 45.0, purity: "925", quantity: 50, rate: 75, value: 168750, barcode: "SB925001", location: "Shelf B1", status: "In Stock" },
    { id: "4", category: "Silver", itemName: "Silver Necklace Chain", weight: 28.5, purity: "925", quantity: 15, rate: 78, value: 33345, barcode: "SN925002", location: "Shelf B2", status: "In Stock" },
    { id: "5", category: "Silver", itemName: "Silver Earrings Studs", weight: 8.2, purity: "925", quantity: 25, rate: 80, value: 16400, barcode: "SE925003", location: "Shelf B3", status: "In Stock" },
    { id: "6", category: "Silver", itemName: "Silver Rings Collection", weight: 12.0, purity: "925", quantity: 30, rate: 82, value: 29520, barcode: "SR925004", location: "Shelf B4", status: "In Stock" },
    { id: "7", category: "Silver", itemName: "Silver Anklets Pair", weight: 35.0, purity: "925", quantity: 8, rate: 76, value: 21280, barcode: "SA925005", location: "Shelf B5", status: "Low Stock" },
    { id: "8", category: "Silver", itemName: "Silver Bracelets", weight: 22.5, purity: "925", quantity: 12, rate: 79, value: 21285, barcode: "SBR925006", location: "Shelf B6", status: "In Stock" },
    { id: "9", category: "Silver", itemName: "Silver Pendant Lockets", weight: 15.8, purity: "925", quantity: 20, rate: 85, value: 26860, barcode: "SP925007", location: "Shelf B7", status: "In Stock" },
    { id: "10", category: "Silver", itemName: "Silver Toe Rings", weight: 6.5, purity: "925", quantity: 40, rate: 77, value: 20020, barcode: "STR925008", location: "Shelf B8", status: "In Stock" },
    { id: "11", category: "Diamond", itemName: "Diamond Earrings", weight: 2.1, purity: "VVS1", quantity: 3, rate: 85000, value: 535500, barcode: "DE001", location: "Safe C1", status: "Low Stock" },
    { id: "12", category: "Platinum", itemName: "Platinum Ring", weight: 8.5, purity: "950", quantity: 12, rate: 3200, value: 326400, barcode: "PR950001", location: "Shelf D1", status: "In Stock" }
  ];

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

  const filteredInventory = mockInventory.filter(item => {
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