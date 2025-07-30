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
import { Switch } from "@/components/ui/switch";
import { ShoppingCart, Plus, Minus, Printer, Calculator, CreditCard, Banknote, Smartphone, Receipt, Scan, Gem, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarcodeScanner } from "./BarcodeScanner";

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [oldSilverExchange, setOldSilverExchange] = useState(false);
  const [oldSilverWeight, setOldSilverWeight] = useState(0);
  const [oldSilverRate, setOldSilverRate] = useState(70);
  const [gstEnabled, setGstEnabled] = useState(true);

  const [goldProducts, setGoldProducts] = useState([]);
  const [silverProducts, setSilverProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [recentBills, setRecentBills] = useState<Bill[]>([]);

  const addToBill = (product: any) => {
    const existingItem = currentBill.find(item => item.id === product.id);
    
    // Calculate total based on product type (silver has wastage)
    const wastageAmount = product.wastage ? (product.weight * product.wastage) / 100 : 0;
    const totalWeight = product.weight + wastageAmount;
    const basePrice = totalWeight * product.rate;
    const itemTotal = basePrice + product.makingCharges;
    
    if (existingItem) {
      setCurrentBill(currentBill.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: itemTotal * (item.quantity + 1) }
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
        total: itemTotal
      };
      setCurrentBill([...currentBill, newItem]);
    }
    toast({
      title: "Item Added",
      description: `${product.name} added to bill`,
    });
  };

  const handleBarcodeScanned = (barcode: string) => {
    setScannedBarcode(barcode);
    setIsScannerOpen(false);
    
    // Clean and normalize barcode
    const cleanBarcode = barcode.trim().toUpperCase();
    
    // Find product by barcode or product ID
    const product = allProducts.find(p => 
      p.barcode.toUpperCase() === cleanBarcode || 
      p.id === cleanBarcode ||
      p.name.toUpperCase().includes(cleanBarcode)
    );
    
    if (product) {
      addToBill(product);
      toast({
        title: "✅ Product Added",
        description: `${product.name} (${product.barcode}) added to bill`,
      });
    } else {
      toast({
        title: "❌ Product Not Found",
        description: `No product found with code: ${cleanBarcode}. Try manual search or check the barcode.`,
        variant: "destructive"
      });
    }
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
    const oldSilverValue = oldSilverExchange ? oldSilverWeight * oldSilverRate : 0;
    const discountAmount = discount;
    const taxableAmount = subtotal - discountAmount - oldSilverValue;
    const gstAmount = gstEnabled ? taxableAmount * 0.03 : 0; // 3% GST
    const total = Math.max(0, taxableAmount + gstAmount);
    return { subtotal, discountAmount, gstAmount, total, oldSilverValue };
  };

  const { subtotal, discountAmount, gstAmount, total, oldSilverValue } = calculateTotals();

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
    setOldSilverExchange(false);
    setOldSilverWeight(0);
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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sale</DialogTitle>
              <DialogDescription>Add items and process customer sale - Gold, Silver & Diamond jewelry</DialogDescription>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General Items</TabsTrigger>
                <TabsTrigger value="gold">Gold & Diamond</TabsTrigger>
                <TabsTrigger value="silver">Silver Jewelry</TabsTrigger>
              </TabsList>
              
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

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">All Products</CardTitle>
                      <div className="flex gap-2">
                        {scannedBarcode && (
                          <Badge variant="outline" className="text-xs">
                            Last: {scannedBarcode}
                          </Badge>
                        )}
                        <Button onClick={() => setIsScannerOpen(true)} variant="outline" size="sm">
                          <Scan className="w-4 h-4 mr-2" />
                          Scan Code
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Input
                        placeholder="Search products by name, category, or barcode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allProducts
                        .filter(product => 
                          searchQuery === "" ||
                          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(product => (
                        <Card key={product.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{product.name}</h4>
                                {product.category === 'Gold' && <Crown className="w-4 h-4 text-yellow-500" />}
                                {product.category === 'Silver' && <Gem className="w-4 h-4 text-gray-400" />}
                                {product.category === 'Diamond' && <Star className="w-4 h-4 text-blue-500" />}
                              </div>
                              <p className="text-sm text-muted-foreground">{product.category} • {product.purity}</p>
                              <p className="text-sm">Weight: {product.weight}g • Rate: ₹{product.rate}/g</p>
                              <p className="text-sm">Making Charges: ₹{product.makingCharges}</p>
                              {product.wastage && <p className="text-sm text-orange-600">Wastage: {product.wastage}%</p>}
                              <p className="text-xs text-muted-foreground">Code: {product.barcode}</p>
                              <p className="font-medium">Total: ₹{(
                                product.wastage ? 
                                (product.weight + (product.weight * product.wastage) / 100) * product.rate + product.makingCharges :
                                product.weight * product.rate + product.makingCharges
                              ).toLocaleString()}</p>
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
              </TabsContent>
              
              <TabsContent value="gold" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      Gold & Diamond Jewelry
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goldProducts.map(product => (
                        <Card key={product.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{product.name}</h4>
                                {product.category === 'Gold' && <Crown className="w-4 h-4 text-yellow-500" />}
                                {product.category === 'Diamond' && <Star className="w-4 h-4 text-blue-500" />}
                              </div>
                              <Badge variant={product.category === 'Gold' ? 'default' : 'secondary'}>{product.category}</Badge>
                              <p className="text-sm">Purity: {product.purity} • Weight: {product.weight}g</p>
                              <p className="text-sm">Rate: ₹{product.rate}/g • Making: ₹{product.makingCharges}</p>
                              <p className="text-xs text-muted-foreground">Code: {product.barcode}</p>
                              <p className="font-medium text-lg">₹{(product.weight * product.rate + product.makingCharges).toLocaleString()}</p>
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
              </TabsContent>
              
              <TabsContent value="silver" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gem className="w-5 h-5 text-gray-400" />
                      Silver Jewelry Collection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {silverProducts.map(product => (
                        <Card key={product.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{product.name}</h4>
                                <Gem className="w-4 h-4 text-gray-400" />
                              </div>
                              <Badge variant="outline">Silver {product.purity}</Badge>
                              <p className="text-sm">Weight: {product.weight}g • Rate: ₹{product.rate}/g</p>
                              <p className="text-sm">Making: ₹{product.makingCharges} • Wastage: {product.wastage}%</p>
                              <p className="text-xs text-muted-foreground">Code: {product.barcode}</p>
                              <p className="text-sm text-orange-600">
                                Total Weight: {(product.weight + (product.weight * product.wastage) / 100).toFixed(1)}g
                              </p>
                              <p className="font-medium text-lg">
                                ₹{((product.weight + (product.weight * product.wastage) / 100) * product.rate + product.makingCharges).toLocaleString()}
                              </p>
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
              </TabsContent>

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
                      {/* Silver Exchange Option */}
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Switch
                              id="old-silver"
                              checked={oldSilverExchange}
                              onCheckedChange={setOldSilverExchange}
                            />
                            <Label htmlFor="old-silver">Old Silver Exchange</Label>
                          </div>
                          
                          {oldSilverExchange && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="oldWeight">Weight (grams)</Label>
                                <Input
                                  type="number"
                                  value={oldSilverWeight}
                                  onChange={(e) => setOldSilverWeight(Number(e.target.value))}
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label htmlFor="oldRate">Rate (per gram)</Label>
                                <Input
                                  type="number"
                                  value={oldSilverRate}
                                  onChange={(e) => setOldSilverRate(Number(e.target.value))}
                                  placeholder="70"
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
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
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="gst-enabled"
                          checked={gstEnabled}
                          onCheckedChange={setGstEnabled}
                        />
                        <Label htmlFor="gst-enabled">Include GST (3%)</Label>
                      </div>

                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        {oldSilverExchange && oldSilverValue > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Old Silver Credit ({oldSilverWeight}g @ ₹{oldSilverRate}):</span>
                            <span>-₹{oldSilverValue.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>-₹{discountAmount.toLocaleString()}</span>
                        </div>
                        {gstEnabled && (
                          <div className="flex justify-between">
                            <span>GST (3%):</span>
                            <span>₹{gstAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-xl">
                          <span>Final Total:</span>
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
            </Tabs>
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
                <p className="text-2xl font-bold">₹0</p>
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
                <p className="text-2xl font-bold">0</p>
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
                <p className="text-2xl font-bold">₹0</p>
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
                <p className="text-2xl font-bold text-orange-600">₹0</p>
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
              {recentBills.map(bill => (
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
      
      <BarcodeScanner
        isOpen={isScannerOpen}
        onScan={handleBarcodeScanned}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
};