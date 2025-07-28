import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Calculator, Receipt, Gem, Star, Crown, Scan } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarcodeScanner } from "./BarcodeScanner";

interface SilverSpecialBillingProps {
  onBack: () => void;
}

interface SilverBillItem {
  id: string;
  itemName: string;
  category: string;
  weight: number;
  purity: string;
  rate: number;
  makingCharges: number;
  wastage: number;
  quantity: number;
  total: number;
  isOldSilver?: boolean;
  oldSilverWeight?: number;
  oldSilverRate?: number;
}

export const SilverSpecialBilling = ({ onBack }: SilverSpecialBillingProps) => {
  const { toast } = useToast();
  const [currentBill, setCurrentBill] = useState<SilverBillItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isNewBillOpen, setIsNewBillOpen] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [oldSilverExchange, setOldSilverExchange] = useState(false);
  const [oldSilverWeight, setOldSilverWeight] = useState(0);
  const [oldSilverRate, setOldSilverRate] = useState(70);
  const [currentSilverRate, setCurrentSilverRate] = useState(75);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");

  const silverProducts = [
    { id: "s1", name: "925 Silver Bangles Set (6 pieces)", category: "Bangles", weight: 45.0, purity: "925", rate: 75, makingCharges: 300, wastage: 5, barcode: "SLV001" },
    { id: "s2", name: "925 Silver Chain Necklace", category: "Necklaces", weight: 28.5, purity: "925", rate: 78, makingCharges: 250, wastage: 3, barcode: "SLV002" },
    { id: "s3", name: "925 Silver Stud Earrings", category: "Earrings", weight: 8.2, purity: "925", rate: 80, makingCharges: 150, wastage: 2, barcode: "SLV003" },
    { id: "s4", name: "925 Silver Ring Collection", category: "Rings", weight: 12.0, purity: "925", rate: 82, makingCharges: 180, wastage: 2, barcode: "SLV004" },
    { id: "s5", name: "925 Silver Anklets Pair", category: "Anklets", weight: 35.0, purity: "925", rate: 76, makingCharges: 280, wastage: 4, barcode: "SLV005" },
    { id: "s6", name: "925 Silver Bracelets", category: "Bracelets", weight: 22.5, purity: "925", rate: 79, makingCharges: 220, wastage: 3, barcode: "SLV006" },
    { id: "s7", name: "925 Silver Pendant Locket", category: "Pendants", weight: 15.8, purity: "925", rate: 85, makingCharges: 200, wastage: 2, barcode: "SLV007" },
    { id: "s8", name: "925 Silver Toe Rings Set", category: "Toe Rings", weight: 6.5, purity: "925", rate: 77, makingCharges: 120, wastage: 1, barcode: "SLV008" },
  ];

  const addToBill = (product: any) => {
    const wastageAmount = (product.weight * product.wastage) / 100;
    const totalWeight = product.weight + wastageAmount;
    const basePrice = totalWeight * product.rate;
    const itemTotal = basePrice + product.makingCharges;

    const existingItem = currentBill.find(item => item.id === product.id);
    if (existingItem) {
      setCurrentBill(currentBill.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: itemTotal * (item.quantity + 1) }
          : item
      ));
    } else {
      const newItem: SilverBillItem = {
        id: product.id,
        itemName: product.name,
        category: product.category,
        weight: product.weight,
        purity: product.purity,
        rate: product.rate,
        makingCharges: product.makingCharges,
        wastage: wastageAmount,
        quantity: 1,
        total: itemTotal
      };
      setCurrentBill([...currentBill, newItem]);
    }
    toast({
      title: "Silver Item Added",
      description: `${product.name} added to bill`,
    });
  };

  const handleBarcodeScanned = (barcode: string) => {
    setScannedBarcode(barcode);
    setIsScannerOpen(false);
    
    // Find product by barcode or product ID
    const product = silverProducts.find(p => p.barcode === barcode || p.id === barcode);
    if (product) {
      addToBill(product);
      toast({
        title: "Product Scanned Successfully",
        description: `${product.name} (${product.barcode}) added to bill`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No silver product found with barcode: ${barcode}`,
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
    setCurrentBill(currentBill.map(item => {
      if (item.id === productId) {
        const wastageAmount = (item.weight * 5) / 100; // 5% wastage
        const totalWeight = item.weight + wastageAmount;
        const basePrice = totalWeight * item.rate;
        const itemTotal = basePrice + item.makingCharges;
        return { ...item, quantity: newQuantity, total: itemTotal * newQuantity };
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = currentBill.reduce((sum, item) => sum + item.total, 0);
    const oldSilverValue = oldSilverExchange ? oldSilverWeight * oldSilverRate : 0;
    const discountAmount = discount;
    const taxableAmount = subtotal - discountAmount - oldSilverValue;
    const gstAmount = gstEnabled ? taxableAmount * 0.03 : 0; // 3% GST for silver
    const total = Math.max(0, taxableAmount + gstAmount);
    return { subtotal, discountAmount, gstAmount, total, oldSilverValue };
  };

  const { subtotal, discountAmount, gstAmount, total, oldSilverValue } = calculateTotals();

  const processBill = () => {
    if (currentBill.length === 0) {
      toast({
        title: "Error",
        description: "Please add silver items to the bill",
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
      title: "Silver Bill Processed",
      description: `Silver jewelry bill generated for ₹${total.toFixed(2)}`,
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
          <h1 className="text-3xl font-bold text-luxury-dark flex items-center gap-2">
            <Gem className="w-8 h-8 text-primary" />
            Silver Jewelry Billing
          </h1>
          <p className="text-muted-foreground">Specialized billing for silver jewelry with wastage and exchange options</p>
        </div>
        <Dialog open={isNewBillOpen} onOpenChange={setIsNewBillOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Silver Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Create Silver Jewelry Sale
              </DialogTitle>
              <DialogDescription>Process silver jewelry sale with advanced billing features</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customer">Customer Details</TabsTrigger>
                <TabsTrigger value="products">Silver Products</TabsTrigger>
                <TabsTrigger value="billing">Billing & Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentRate">Current Silver Rate (per gram)</Label>
                        <Input
                          type="number"
                          value={currentSilverRate}
                          onChange={(e) => setCurrentSilverRate(Number(e.target.value))}
                          placeholder="75"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="gst-enabled"
                          checked={gstEnabled}
                          onCheckedChange={setGstEnabled}
                        />
                        <Label htmlFor="gst-enabled">Include GST (3%)</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Silver Jewelry Collection</CardTitle>
                        <CardDescription>Select from our premium silver jewelry range</CardDescription>
                      </div>
                      <Button onClick={() => setIsScannerOpen(true)} variant="outline" size="sm">
                        <Scan className="w-4 h-4 mr-2" />
                        Scan Barcode
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {silverProducts.map(product => (
                        <Card key={product.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">{product.category}</Badge>
                                <Crown className="w-4 h-4 text-primary" />
                              </div>
                              <h4 className="font-medium text-sm">{product.name}</h4>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>Weight: {product.weight}g • Purity: {product.purity}</p>
                                <p>Rate: ₹{product.rate}/g • Making: ₹{product.makingCharges}</p>
                                <p>Wastage: {product.wastage}% ({((product.weight * product.wastage) / 100).toFixed(1)}g)</p>
                                <p>Barcode: {product.barcode}</p>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="font-medium text-sm">
                                  Total: ₹{((product.weight + (product.weight * product.wastage) / 100) * product.rate + product.makingCharges).toLocaleString()}
                                </p>
                                <Button size="sm" onClick={() => addToBill(product)} className="text-xs">
                                  Add
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                {/* Current Bill */}
                {currentBill.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Bill Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Wastage</TableHead>
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
                              <TableCell className="font-medium text-sm">{item.itemName}</TableCell>
                              <TableCell>{item.weight}g</TableCell>
                              <TableCell>{item.wastage.toFixed(1)}g</TableCell>
                              <TableCell>₹{item.rate}</TableCell>
                              <TableCell>₹{item.makingCharges}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">{item.quantity}</span>
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
                    </CardContent>
                  </Card>
                )}

                {/* Old Silver Exchange */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Old Silver Exchange & Final Billing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="old-silver"
                        checked={oldSilverExchange}
                        onCheckedChange={setOldSilverExchange}
                      />
                      <Label htmlFor="old-silver">Customer has old silver to exchange</Label>
                    </div>
                    
                    {oldSilverExchange && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <Label htmlFor="oldWeight">Old Silver Weight (grams)</Label>
                          <Input
                            type="number"
                            value={oldSilverWeight}
                            onChange={(e) => setOldSilverWeight(Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="oldRate">Old Silver Rate (per gram)</Label>
                          <Input
                            type="number"
                            value={oldSilverRate}
                            onChange={(e) => setOldSilverRate(Number(e.target.value))}
                            placeholder="70"
                          />
                        </div>
                      </div>
                    )}

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

                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg space-y-3">
                      <h3 className="font-semibold text-lg">Bill Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        {oldSilverExchange && (
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
                          <span>Final Amount:</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button onClick={processBill} className="flex-1" size="lg">
                        <Receipt className="w-4 h-4 mr-2" />
                        Process Silver Sale
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentBill([])} size="lg">
                        Clear Bill
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats for Silver */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Silver Sales</p>
                <p className="text-2xl font-bold">₹45.2K</p>
              </div>
              <Gem className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Silver Items Sold</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Silver Rate</p>
                <p className="text-2xl font-bold">₹{currentSilverRate}</p>
              </div>
              <Calculator className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Old Silver Exchanged</p>
                <p className="text-2xl font-bold">245g</p>
              </div>
              <Crown className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Silver Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Silver Sales</CardTitle>
          <CardDescription>Latest silver jewelry transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">INV-S001</TableCell>
                <TableCell>Meera Patel</TableCell>
                <TableCell>Silver Bangles Set</TableCell>
                <TableCell>45.0g</TableCell>
                <TableCell>₹3,675</TableCell>
                <TableCell>-</TableCell>
                <TableCell><Badge>Paid</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">INV-S002</TableCell>
                <TableCell>Anita Singh</TableCell>
                <TableCell>Silver Earrings</TableCell>
                <TableCell>8.2g</TableCell>
                <TableCell>₹850</TableCell>
                <TableCell>12g</TableCell>
                <TableCell><Badge>Paid</Badge></TableCell>
              </TableRow>
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