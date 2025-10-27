import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Plus, Users, Package, FileText, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PurchaseManagementProps {
  onBack: () => void;
}

interface Supplier {
  id: string;
  name: string;
  type: string;
  contact: string;
  email: string;
  gstin: string;
  address: string;
  status: 'Active' | 'Inactive';
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  status: 'Pending' | 'Received' | 'Partial' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Partial';
}

interface PurchaseItem {
  id: string;
  description: string;
  category: string;
  weight: number;
  purity: string;
  rate: number;
  amount: number;
}

export const PurchaseManagement = ({ onBack }: PurchaseManagementProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suppliers");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);

  const mockSuppliers: Supplier[] = [
    {
      id: "1",
      name: "Gold Wholesalers Pvt Ltd",
      type: "Gold Supplier",
      contact: "+91 98765 43210",
      email: "contact@goldwholesalers.com",
      gstin: "29ABCDE1234F1Z5",
      address: "123 Jewelry Market, Mumbai",
      status: "Active"
    },
    {
      id: "2",
      name: "Silver Imports Co.",
      type: "Silver Supplier",
      contact: "+91 87654 32109",
      email: "orders@silverimports.com",
      gstin: "27FGHIJ5678K2A3",
      address: "456 Silver Street, Delhi",
      status: "Active"
    },
    {
      id: "3",
      name: "Diamond Traders Ltd",
      type: "Diamond Supplier",
      contact: "+91 76543 21098",
      email: "info@diamondtraders.com",
      gstin: "36KLMNO9012P3B7",
      address: "789 Diamond Plaza, Surat",
      status: "Active"
    }
  ];

  const mockPurchaseOrders: PurchaseOrder[] = [
    {
      id: "PO001",
      supplierId: "1",
      supplierName: "Gold Wholesalers Pvt Ltd",
      date: "2024-01-15",
      items: [
        { id: "1", description: "22K Gold Bars", category: "Gold", weight: 100, purity: "22K", rate: 5200, amount: 520000 }
      ],
      total: 520000,
      status: "Received",
      paymentStatus: "Paid"
    },
    {
      id: "PO002",
      supplierId: "2",
      supplierName: "Silver Imports Co.",
      date: "2024-01-14",
      items: [
        { id: "2", description: "925 Silver Bars", category: "Silver", weight: 500, purity: "925", rate: 75, amount: 37500 }
      ],
      total: 37500,
      status: "Pending",
      paymentStatus: "Pending"
    }
  ];

  const handleAddSupplier = () => {
    toast({
      title: "Supplier Added",
      description: "New supplier has been registered successfully.",
    });
    setIsAddSupplierOpen(false);
  };

  const handleAddPurchaseOrder = () => {
    toast({
      title: "Purchase Order Created",
      description: "New purchase order has been created successfully.",
    });
    setIsAddPurchaseOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-luxury-dark">Purchase Management</h1>
          <p className="text-muted-foreground">Manage suppliers, purchase orders, and raw material procurement</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>Register a new supplier for procurement</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input placeholder="Enter supplier name" />
                </div>
                <div>
                  <Label htmlFor="supplierType">Supplier Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold Supplier</SelectItem>
                      <SelectItem value="silver">Silver Supplier</SelectItem>
                      <SelectItem value="diamond">Diamond Supplier</SelectItem>
                      <SelectItem value="platinum">Platinum Supplier</SelectItem>
                      <SelectItem value="stones">Stones Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input placeholder="Phone number" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" placeholder="Email address" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input placeholder="GST identification number" />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea placeholder="Full address" />
                </div>
                <Button onClick={handleAddSupplier} className="w-full">Add Supplier</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddPurchaseOpen} onOpenChange={setIsAddPurchaseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>Create a new purchase order for raw materials</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSuppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Order Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Item Description</Label>
                  <Input placeholder="e.g., 22K Gold Bars" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Label htmlFor="rate">Rate per gram</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="total">Total Amount</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea placeholder="Any special instructions or notes" />
                </div>
                <Button onClick={handleAddPurchaseOrder} className="w-full">Create Purchase Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold">{mockSuppliers.filter(s => s.status === 'Active').length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{mockPurchaseOrders.filter(po => po.status === 'Pending').length}</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month Purchases</p>
                <p className="text-2xl font-bold">₹5.5L</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-red-600">₹37.5K</p>
              </div>
              <FileText className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button
            variant={activeTab === "suppliers" ? "default" : "outline"}
            onClick={() => setActiveTab("suppliers")}
          >
            Suppliers
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
          >
            Purchase Orders
          </Button>
        </div>

        {/* Suppliers Tab */}
        {activeTab === "suppliers" && (
          <Card>
            <CardHeader>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>Manage your supplier relationships and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.type}</TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.gstin}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.status === "Active" ? "default" : "secondary"}>
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Track and manage all purchase orders and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchaseOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.supplierName}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>₹{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "Received" ? "default" : order.status === "Pending" ? "destructive" : "secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.paymentStatus === "Paid" ? "default" : "destructive"}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};