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
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Printer, Calculator, CreditCard, Banknote, Smartphone, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SalesBillingProps {
  onBack: () => void;
}

interface BillItem {
  id: string;
  itemName: string;
  category: string;
  weight: number;
  purity: string;
  rate: number;
  makingCharges: number;
  quantity: number;
  total: number;
}

interface Bill {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paymentMethod: string;
  status: 'Paid' | 'Pending' | 'Partially Paid';
}

export const SalesBilling = ({ onBack }: SalesBillingProps) => {
  const { toast } = useToast();
  const [currentBill, setCurrentBill] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isNewBillOpen, setIsNewBillOpen] = useState(false);

  const mockProducts = [
    { id: "1", name: "Gold Ring 22K", category: "Gold", weight: 5.5, purity: "22K", rate: 5200, makingCharges: 500 },
    { id: "2", name: "Gold Chain 18K", category: "Gold", weight: 12.2, purity: "18K", rate: 4800, makingCharges: 1200 },
    { id: "3", name: "Silver Bangles", category: "Silver", weight: 45.0, purity: "925", rate: 75, makingCharges: 300 },
    { id: "4", name: "Diamond Earrings", category: "Diamond", weight: 2.1, purity: "VVS1", rate: 85000, makingCharges: 2000 },
  ];

  const mockBills: Bill[] = [
    {
      id: "INV001",
      customerName: "Rajesh Kumar",
      customerPhone: "+91 98765 43210",
      date: "2024-01-15",
      items: [
        { id: "1", itemName: "Gold Ring 22K", category: "Gold", weight: 5.5, purity: "22K", rate: 5200, makingCharges: 500, quantity: 1, total: 29100 }
      ],
      subtotal: 29100,
      discount: 1000,
      gst: 847,
      total: 28947,
      paymentMethod: "UPI",
      status: "Paid"
    },
    {
      id: "INV002",
      customerName: "Priya Sharma",
      customerPhone: "+91 87654 32109",
      date: "2024-01-14",
      items: [
        { id: "2", itemName: "Gold Chain 18K", category: "Gold", weight: 12.2, purity: "18K", rate: 4800, makingCharges: 1200, quantity: 1, total: 59760 }
      ],
      subtotal: 59760,
      discount: 2000,
      gst: 1739,
      total: 59499,
      paymentMethod: "Card",
      status: "Paid"
    }
  ];

  const addToBill = (product: any) => {
    const existingItem = currentBill.find(item => item.id === product.id);
    if (existingItem) {
      setCurrentBill(currentBill.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.weight * item.rate + item.makingCharges) * (item.quantity + 1) }
          : item
      ));
    } else {
      const newItem: BillItem = {
        id: product.id,
        itemName: product.name,
        category: product.category,
        weight: product.weight,
        purity: product.purity,
        rate: product.rate,
        makingCharges: product.makingCharges,
        quantity: 1,
        total: product.weight * product.rate + product.makingCharges
      };
      setCurrentBill([...currentBill, newItem]);
    }
    toast({
      title: "Item Added",
      description: `${product.name} added to bill`,
    });
  };

  const removeFromBill = (productId: string) => {
    setCurrentBill(currentBill.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromBill(productId);
      return;
    }
    setCurrentBill(currentBill.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity, total: (item.weight * item.rate + item.makingCharges) * newQuantity }
        : item
    ));
  };

  const calculateTotals = () => {
    const subtotal = currentBill.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = discount;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = taxableAmount * 0.03; // 3% GST
    const total = taxableAmount + gstAmount;
    return { subtotal, discountAmount, gstAmount, total };
  };

  const { subtotal, discountAmount, gstAmount, total } = calculateTotals();

  const processBill = () => {
    if (currentBill.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to the bill",
        variant: "destructive"
      });
      return;
    }
    if (!customerName) {
      toast({
        title: "Error",
        description: "Please enter customer name",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bill Processed",
      description: `Invoice generated successfully for ₹${total.toFixed(2)}`,
    });
    
    // Reset bill
    setCurrentBill([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount(0);
    setIsNewBillOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-luxury-dark">Sales & Billing</h1>
          <p className="text-muted-foreground">Process sales, generate invoices, and manage billing</p>
        </div>
        <Dialog open={isNewBillOpen} onOpenChange={setIsNewBillOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sale</DialogTitle>
              <DialogDescription>Add items and process customer sale</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone Number</Label>
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockProducts.map(product => (
                      <Card key={product.id} className="border">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{product.category} • {product.purity}</p>
                            <p className="text-sm">Weight: {product.weight}g • Rate: ₹{product.rate}/g</p>
                            <p className="text-sm">Making Charges: ₹{product.makingCharges}</p>
                            <p className="font-medium">Total: ₹{(product.weight * product.rate + product.makingCharges).toLocaleString()}</p>
                            <Button size="sm" onClick={() => addToBill(product)} className="w-full">
                              Add to Bill
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current Bill */}
              {currentBill.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Bill</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Making</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentBill.map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.weight}g</TableCell>
                            <TableCell>₹{item.rate}</TableCell>
                            <TableCell>₹{item.makingCharges}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>₹{item.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => removeFromBill(item.id)}>
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Separator className="my-4" />

                    {/* Bill Summary */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="discount">Discount (₹)</Label>
                          <Input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="credit">Credit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>-₹{discountAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (3%):</span>
                          <span>₹{gstAmount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button onClick={processBill} className="flex-1">
                          <Receipt className="w-4 h-4 mr-2" />
                          Process Sale
                        </Button>
                        <Button variant="outline" onClick={() => setCurrentBill([])}>
                          Clear Bill
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Sales</p>
                <p className="text-2xl font-bold">₹1.2L</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bills Generated</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Receipt className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Bill Value</p>
                <p className="text-2xl font-bold">₹5,200</p>
              </div>
              <Calculator className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Pending</p>
                <p className="text-2xl font-bold text-orange-600">₹15K</p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bills */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>Latest sales transactions and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBills.map(bill => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{bill.customerName}</p>
                      <p className="text-sm text-muted-foreground">{bill.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{bill.date}</TableCell>
                  <TableCell>{bill.items.length} items</TableCell>
                  <TableCell>₹{bill.total.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{bill.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={bill.status === "Paid" ? "default" : "destructive"}>
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Printer className="w-4 h-4" />
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