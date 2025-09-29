import React, { useState } from "react";
import { PageLayout, PageHeader, PageContent } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerAutocomplete } from "@/components/ui/customer-autocomplete";
import { useApi, endpoints } from "@/shared";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { EstimationService } from "@/services/estimation";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  aadhar?: string;
  gstin?: string;
}

interface EstimationProps {
  onNavigate: (module: string) => void;
  onLogout: () => void;
}

interface EstimationItem {
  id: string;
  description: string;
  weight: number;
  purity: string;
  ratePerGram: number;
  makingChargesPercent: number;
  quantity: number;
  total: number;
}

export const Estimation = ({ onNavigate, onLogout }: EstimationProps) => {
  const [customer, setCustomer] = useState<Customer>({ id: 0, name: "", phone: "", email: "", address: "", aadhar: "", gstin: "" });
  const [barcodeProducts, setBarcodeProducts] = useState<any[]>([]);
  const [silverRate, setSilverRate] = useState(0);
  const { request } = useApi();
  const { toast } = useToast();

  React.useEffect(() => {
    loadBarcodeProducts();
    loadSilverRate();
    
    // Generate estimation number for new estimations
    generateEstimationNumber().then(setLastEstimationId);
  }, []);



  const loadBarcodeProducts = async () => {
    try {
      const response = await request(endpoints.barcode.listBarcodes());
      setBarcodeProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load barcode products");
    }
  };

  const loadSilverRate = async () => {
    try {
      const response = await request(endpoints.rates.list());
      if (response.data && response.data.length > 0) {
        const latestRate = response.data[0];
        setSilverRate(parseFloat(latestRate.price) || 0);
      }
    } catch (error) {
      console.error("Failed to load silver rate");
    }
  };
  const [items, setItems] = useState<EstimationItem[]>([
    {
      id: "1",
      description: "",
      weight: 0,
      purity: "",
      ratePerGram: 0,
      makingChargesPercent: 0,
      quantity: 0,
      total: 0
    }
  ]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lastEstimationId, setLastEstimationId] = useState("");
  const [lastEstimationDate, setLastEstimationDate] = useState("");
  const [showPrintOption, setShowPrintOption] = useState(false);


  const addItem = () => {
    const newItem: EstimationItem = {
      id: Date.now().toString(),
      description: "",
      weight: 0,
      purity: "",
      ratePerGram: 0,
      makingChargesPercent: 0,
      quantity: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleBarcodeSearch = async (barcode: string, id: string) => {
    const foundProduct = barcodeProducts.find(p => p.code === barcode);
    
    if (foundProduct) {
      const weight = parseFloat(foundProduct.weight) || 0;
      const rate = silverRate || 0;
      const makingCharges = parseFloat(foundProduct.making_charges_or_wastages) || 0;
      const goldValue = weight * rate;
      const total = goldValue + makingCharges;
      
      setItems(items.map(item => 
        item.id === id ? {
          ...item,
          description: foundProduct.product || '',
          weight: weight,
          purity: foundProduct.touch || '',
          ratePerGram: rate,
          makingChargesPercent: makingCharges,
          quantity: parseFloat(foundProduct.qty) || 1,
          total: total
        } : item
      ));
    }
  };

  const updateItem = (id: string, field: keyof EstimationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate total when weight, rate, making charges, or quantity change
        if (field === 'weight' || field === 'ratePerGram' || field === 'makingChargesPercent' || field === 'quantity') {
          const goldValue = updatedItem.weight * updatedItem.ratePerGram;
          const makingAmount = (goldValue * updatedItem.makingChargesPercent) / 100;
          const itemTotal = goldValue + makingAmount;
          updatedItem.total = itemTotal * updatedItem.quantity;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalEstimation = () => {
    const subtotal = getSubtotal();
    return subtotal - discountAmount;
  };

  const handleDiscountPercentChange = (percent: number) => {
    setDiscountPercent(percent);
    const subtotal = getSubtotal();
    const amount = Math.round((subtotal * percent) / 100);
    setDiscountAmount(amount);
  };

  const handleDiscountAmountChange = (amount: number) => {
    setDiscountAmount(amount);
    const subtotal = getSubtotal();
    const percent = subtotal > 0 ? Math.round(((amount / subtotal) * 100) * 100) / 100 : 0;
    setDiscountPercent(percent);
  };

  const handleCustomerSearch = async (phone: string) => {
    if (phone.length >= 10) {
      try {
        const response = await request(endpoints.customers.findByPhone(phone));
        if (response.data && response.data.length > 0) {
          const customerData = response.data[0].attributes || response.data[0];
          setCustomer({
            id: response.data[0].id,
            name: customerData.name || "",
            phone: customerData.phone || "",
            email: customerData.email || "",
            address: customerData.address || "",
            aadhar: customerData.aadhar || "",
            gstin: customerData.gstin || ""
          });
        }
      } catch (error) {
        console.error("Customer search failed");
      }
    }
  };

  const handlePrint = () => {
    const estimationData = {
      estimationNumber: lastEstimationId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      },
      date: lastEstimationDate,
      silverRate: silverRate,
      items: items.filter(item => item.description && item.description.trim() !== '').map(item => ({
        id: item.id,
        itemName: item.description,
        purity: item.purity,
        quantity: item.quantity,
        weight: item.weight,
        makingCharges: item.makingChargesPercent,
        total: item.total
      })),
      subtotal: getSubtotal(),
      discount: discountAmount,
      total: getTotalEstimation()
    };
    
    EstimationService.printEstimation(estimationData);
    handleNewEstimation();
  };

  const handleNewEstimation = () => {
    setCustomer({ id: 0, name: "", phone: "", email: "", address: "", aadhar: "", gstin: "" });
    setItems([{
      id: "1",
      description: "",
      weight: 0,
      purity: "",
      ratePerGram: 0,
      makingChargesPercent: 0,
      quantity: 0,
      total: 0
    }]);
    setDiscountPercent(0);
    setDiscountAmount(0);
    setShowPrintOption(false);
    setLastEstimationId("");
    setLastEstimationDate("");
  };

  const generateEstimationNumber = async () => {
    try {
      const response = await request(endpoints.estimation.masters.list(1, 100));
      const allEstimations = response.data || [];
      let nextNumber = 1;
      
      // Find the highest EST number
      const estEntries = allEstimations.filter(entry => entry.estimation_number && entry.estimation_number.startsWith('EST-'));
      if (estEntries.length > 0) {
        const numbers = estEntries.map(entry => {
          const num = parseInt(entry.estimation_number.split('-')[1]) || 0;
          return num;
        });
        const maxNumber = Math.max(...numbers);
        nextNumber = maxNumber + 1;
      }
      
      return `EST-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error("Failed to generate estimation number");
      return `EST-${Date.now().toString().slice(-3)}`;
    }
  };

  const handleSaveEstimation = async () => {
    try {
      // Create or update customer if needed
      let customerId = customer.id;
      
      if (!customerId && (customer.name || customer.phone)) {
        const customerPayload = {
          data: {
            name: customer.name || 'Unknown Customer',
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
            aadhar: customer.aadhar || '',
            gstin: customer.gstin || ''
          }
        };
        const customerResponse = await request(endpoints.customers.create(), 'POST', customerPayload);
        customerId = customerResponse.data.id;
        setCustomer(prev => ({ ...prev, id: customerId }));
      }
      

      
      // Generate estimation number for new estimation
      const estimationNumber = await generateEstimationNumber();
      
      const subtotal = getSubtotal();
      const totalAmount = getTotalEstimation();
      const estimationDate = new Date().toISOString();

      // Create estimation master
      const avgWastagePercent = items.length > 0 ? 
        items.reduce((sum, item) => sum + item.makingChargesPercent, 0) / items.length : 0;
      
      const estimationMasterPayload = {
        data: {
          cid: customerId.toString(),
          date: estimationDate,
          estimation_number: estimationNumber,
          subtotal: subtotal.toString(),
          discount_percentage: discountPercent.toString(),
          discount_amount: discountAmount.toString(),
          total_amount: totalAmount.toString(),
          current_silver_rate: silverRate.toString(),
          wastage: avgWastagePercent.toString()
        }
      };
      

      
      // Make direct fetch to get detailed error
      const response = await fetch(`https://jewelapi.sricashway.com${endpoints.estimation.masters.create()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimationMasterPayload)
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      const estimationMasterResponse = JSON.parse(responseText);

      // Create estimation details
      
      for (const item of items) {
        if (item.description) {
          const goldValue = item.weight * item.ratePerGram;
          const makingAmount = (goldValue * item.makingChargesPercent) / 100;
          
          const estimationDetailPayload = {
            data: {
              estimation_id: estimationNumber,
              product: item.description,
              touch: item.purity,
              weight: item.weight.toString(),
              qty: item.quantity.toString(),
              amount: item.ratePerGram.toString(),
              total: item.total.toString()
            }
          };
          
          // Make direct fetch to get detailed error
          const detailResponse = await fetch(`https://jewelapi.sricashway.com${endpoints.estimation.details.create()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(estimationDetailPayload)
          });
          
          const detailResponseText = await detailResponse.text();
          
          if (!detailResponse.ok) {
            throw new Error(`Detail HTTP ${detailResponse.status}: ${detailResponseText}`);
          }
          
          const detailResult = JSON.parse(detailResponseText);
        }
      }
      

      setLastEstimationId(estimationNumber);
      setLastEstimationDate(estimationDate);
      setShowPrintOption(true);
      toast({
        title: "✅ Success",
        description: `Estimation ${estimationNumber} saved successfully!`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to save estimation",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={`Price Estimation${lastEstimationId ? ` - ${lastEstimationId}` : ''}`}
        subtitle="Create price estimates for customers"
        onBack={() => onNavigate("Dashboard")}
        onLogout={onLogout}
      />

      <PageContent>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customer.phone}
                    onChange={(e) => {
                      setCustomer(prev => ({ ...prev, phone: e.target.value }));
                      handleCustomerSearch(e.target.value);
                    }}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <CustomerAutocomplete
                    value={customer.name}
                    onChange={(value) => setCustomer(prev => ({ ...prev, name: value }))}
                    onCustomerSelect={(selectedCustomer) => setCustomer(selectedCustomer)}
                    onCreateNew={(name) => setCustomer(prev => ({ ...prev, name, id: 0 }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input
                    id="customerAddress"
                    value={customer.address}
                    onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter customer address"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    value={customer.email}
                    onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="customerGstin">GSTIN</Label>
                  <Input
                    id="customerGstin"
                    value={customer.gstin}
                    onChange={(e) => setCustomer(prev => ({ ...prev, gstin: e.target.value }))}
                    placeholder="Enter GSTIN"
                  />
                </div>
                <div>
                  <Label htmlFor="customerAadhar">Aadhar Number</Label>
                  <Input
                    id="customerAadhar"
                    value={customer.aadhar}
                    onChange={(e) => setCustomer(prev => ({ ...prev, aadhar: e.target.value }))}
                    placeholder="Enter Aadhar number"
                    maxLength={12}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimation Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Estimation Items</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Barcode/Product</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateItem(item.id, 'description', value);
                          
                          // Only search if it's a complete barcode
                          if (value.length === 14 && /^\d+$/.test(value)) {
                            handleBarcodeSearch(value, item.id);
                          }
                        }}
                        placeholder="Scan or enter barcode/product name"
                      />
                    </div>
                    
                    <div>
                      <Label>Weight (g)</Label>
                      <Input
                        type="number"
                        value={item.weight || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity === 0 ? '' : item.quantity}
                        readOnly
                        className="bg-gray-50"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label>Touch</Label>
                      <Input
                        value={item.purity}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Touch"
                      />
                    </div>
                    
                    <div>
                      <Label>Rate/Gram (₹)</Label>
                      <Input
                        type="number"
                        value={item.ratePerGram || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label>VA%</Label>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          value={item.makingChargesPercent || ''}
                          readOnly
                          className="bg-gray-50"
                          placeholder="0.00"
                        />
                        {item.ratePerGram && item.weight && item.makingChargesPercent && (
                          <div className="text-xs text-gray-500">
                            Amount: ₹{((item.weight * item.ratePerGram * item.makingChargesPercent) / 100).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Total (₹)</Label>
                      <Input
                        value={item.total.toFixed(2)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      {items.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Total Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {lastEstimationId && lastEstimationId !== "" && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {lastEstimationId}
                    </div>
                    <div className="text-sm text-blue-700">Estimation Number</div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="text-lg">₹{getSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      value={discountPercent || ''}
                      onChange={(e) => handleDiscountPercentChange(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Discount Amount (₹)</Label>
                    <Input
                      type="number"
                      value={discountAmount || ''}
                      onChange={(e) => handleDiscountAmountChange(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-4">
                  <span>Total Estimation:</span>
                  <span className="text-2xl text-green-600">₹{getTotalEstimation().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                {!showPrintOption ? (
                  <Button onClick={handleSaveEstimation} className="flex-1">
                    Save Estimation
                  </Button>
                ) : (
                  <div className="flex gap-2 flex-1">
                    <Button onClick={handlePrint} className="flex-1">
                      Print Estimation
                    </Button>
                    <Button onClick={handleNewEstimation} variant="outline" className="flex-1">
                      New Estimation
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => onNavigate("Dashboard")} className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageLayout>
  );
};