import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, FormField, FormSection, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { ShoppingCart, User, Plus, Trash2, LogOut, QrCode, FileText, Printer } from "lucide-react";
import { InvoiceService } from "@/services/invoice";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
import { CustomerAutocomplete } from "@/components/ui/customer-autocomplete";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  aadhar?: string;
  gstin?: string;
}

interface Product {
  product: string;
  touch: string;
  weight: string;
  qty: string;
  price: string;
  wastage: string;
  discountPercent: string;
  discountAmount: string;
  total: string;
  barcode?: string;
  isFixedPrice?: boolean;
}

interface SalesEntryProps extends PageProps {
  onLogout?: () => void;
}

export const SalesEntry = ({ onNavigate, onLogout }: SalesEntryProps) => {
  const [customer, setCustomer] = useState<Customer>({ id: 0, name: "", phone: "", email: "", address: "", aadhar: "", gstin: "" });
  const [products, setProducts] = useState<Product[]>([{ product: "", touch: "", weight: "", qty: "", price: "", wastage: "", discountPercent: "", discountAmount: "", total: "", barcode: "" }]);
  const [barcodeProducts, setBarcodeProducts] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [taxPercentage, setTaxPercentage] = useState("3");
  const [silverRate, setSilverRate] = useState(0);
  const [modeOfPayment, setModeOfPayment] = useState("Cash");
  const [roundOff, setRoundOff] = useState(0);
  const [lastInvoiceId, setLastInvoiceId] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [entryNumber, setEntryNumber] = useState("");

  const [estimationToConvert, setEstimationToConvert] = useState<any>(null);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();
  const { goBack } = useNavigation();

  useEffect(() => {
    loadBarcodeProducts();
    loadSilverRate();
    loadEstimationData();
    
    generateEntryNumber();
  }, []);





  const loadEstimationData = () => {
    const estimationData = sessionStorage.getItem('estimationToConvert');
    if (estimationData) {
      const data = JSON.parse(estimationData);
      
      // Store estimation data for later use
      setEstimationToConvert(data);
      
      // Pre-fill customer data
      setCustomer(data.customer);
      
      // Pre-fill products from estimation items
      const convertedProducts = data.items.map((item: any) => {
        const weight = parseFloat(item.weight) || 0;
        const silverRate = data.silverRate || 0;
        const isFixedPrice = weight === 0; // Fixed price products have no weight
        
        // For fixed price products, use the item's amount as price
        // For weight-based products, calculate price from weight * silver rate
        const price = isFixedPrice ? (parseFloat(item.amount) || 0) : (weight * silverRate);
        
        return {
          product: item.product || '',
          touch: item.touch || '',
          weight: item.weight || '',
          qty: item.qty || '1',
          price: price.toFixed(2),
          wastage: data.wastage.toString(),
          discountPercent: item.discountPercent?.toString() || '0',
          discountAmount: item.discountAmount?.toString() || '0',
          total: item.total || '',
          barcode: '',
          isFixedPrice: isFixedPrice
        };
      });
      

      
      setProducts(convertedProducts.length > 0 ? convertedProducts : [{ product: "", touch: "", weight: "", qty: "", price: "", wastage: "", discountPercent: "", discountAmount: "", total: "", barcode: "" }]);
      
      // Set silver rate
      setSilverRate(data.silverRate);
      
      // Clear session storage
      sessionStorage.removeItem('estimationToConvert');
    }
  };

  useEffect(() => {
    calculateTotal();
  }, [products, taxPercentage, roundOff]);

  const loadBarcodeProducts = async () => {
    try {
      const response = await request(endpoints.barcode.listBarcodes());
      // Barcode products loaded successfully
      setBarcodeProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load barcode products");
    }
  };

  const loadSilverRate = async () => {
    try {
      const response = await request('/api/rates?sort=id:desc&pagination[pageSize]=1');
      if (response.data && response.data.length > 0) {
        const latestRate = response.data[0];
        setSilverRate(parseFloat(latestRate.price) || 0);
      }
    } catch (error) {
      console.error("Failed to load silver rate");
    }
  };

  const generateEntryNumber = async () => {
    try {
      const response = await request(endpoints.sales.masters.list(1, 100));
      const allEntries = response.data || [];
      let nextNumber = 1;
      
      // Find the highest PJ number
      const pjEntries = allEntries.filter(entry => entry.invoice && entry.invoice.startsWith('PJ-'));
      if (pjEntries.length > 0) {
        const numbers = pjEntries.map(entry => {
          const num = parseInt(entry.invoice.split('-')[1]) || 0;
          return num;
        });
        const maxNumber = Math.max(...numbers);
        nextNumber = maxNumber + 1;
      }
      
      const newEntryNumber = `PJ-${nextNumber.toString().padStart(3, '0')}`;
      setEntryNumber(newEntryNumber);
    } catch (error) {
      console.error("Failed to generate entry number");
      setEntryNumber('PJ-001');
    }
  };

  const calculateTotal = () => {
    const productTotal = products.reduce((sum, product) => sum + (parseFloat(product.total) || 0), 0);
    const taxAmount = (productTotal * parseFloat(taxPercentage)) / 100;
    const subtotalWithTax = productTotal + taxAmount;
    const finalTotal = Math.round((subtotalWithTax + roundOff) * 100) / 100;
    setTotalAmount(finalTotal);
  };



  const handleBarcodeSearch = async (barcode: string, index: number) => {
    const foundProduct = barcodeProducts.find(p => p.code === barcode);
    
    if (foundProduct) {
      if (foundProduct.staticProduct) {
        // Fixed price product - use the stored price directly
        const price = parseFloat(foundProduct.price) || 0;
        
        setProducts(prev => prev.map((product, i) => 
          i === index ? {
            ...product,
            product: foundProduct.product || '',
            touch: foundProduct.touch || '',
            weight: '0', // Store as 0 for fixed price products
            qty: foundProduct.qty || '1',
            price: price.toFixed(2),
            wastage: '0',
            discountPercent: '0',
            discountAmount: '0',
            total: price.toFixed(2),
            barcode: barcode,
            isFixedPrice: true
          } : product
        ));
      } else {
        // Weight-based product - calculate price using silver rate
        const weight = parseFloat(foundProduct.weight) || 0;
        const price = weight * silverRate;
        const wastagePercent = parseFloat(foundProduct.making_charges_or_wastages) || 0;
        const wastageAmount = (price * wastagePercent) / 100;
        const total = price + wastageAmount;
        
        setProducts(prev => prev.map((product, i) => 
          i === index ? {
            ...product,
            product: foundProduct.product || '',
            touch: foundProduct.touch || '',
            weight: foundProduct.weight || '',
            qty: foundProduct.qty || '1',
            price: price.toFixed(2),
            wastage: wastagePercent.toString(),
            discountPercent: '0',
            discountAmount: '0',
            total: total.toFixed(2),
            barcode: barcode,
            isFixedPrice: false
          } : product
        ));
      }
    }
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

  const addProduct = () => {
    setProducts([...products, { product: "", touch: "", weight: "", qty: "", price: "", wastage: "", discountPercent: "", discountAmount: "", total: "", barcode: "" }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const updatedProducts = products.map((product, i) => {
      if (i === index) {
        const updatedProduct = { ...product, [field]: value };
        
        // Auto-calculate total with price, wastage, and discount
        const calculateProductTotal = () => {
          const price = parseFloat(updatedProduct.price) || 0;
          const wastagePercent = parseFloat(updatedProduct.wastage) || 0;
          const discountPercent = parseFloat(updatedProduct.discount) || 0;
          
          if (field === 'weight' && silverRate > 0) {
            const weight = parseFloat(value) || 0;
            const calculatedPrice = weight * silverRate;
            updatedProduct.price = calculatedPrice.toFixed(2);
            return calculatedPrice;
          }
          return price;
        };
        
        const basePrice = calculateProductTotal();
        const wastageAmount = (basePrice * parseFloat(updatedProduct.wastage || '0')) / 100;
        const subtotal = basePrice + wastageAmount;
        
        // Handle discount percentage/amount conversion
        if (field === 'discountPercent') {
          const percent = parseFloat(value) || 0;
          const amount = (subtotal * percent) / 100;
          updatedProduct.discountAmount = amount.toFixed(2);
        } else if (field === 'discountAmount') {
          const amount = parseFloat(value) || 0;
          const percent = subtotal > 0 ? (amount / subtotal) * 100 : 0;
          updatedProduct.discountPercent = percent.toFixed(2);
        }
        
        const discountAmount = parseFloat(updatedProduct.discountAmount || '0');
        const total = subtotal - discountAmount;
        
        updatedProduct.total = total.toFixed(2);
        
        return updatedProduct;
      }
      return product;
    });
    
    setProducts(updatedProducts);
  };

  const handleSubmit = async () => {
    try {
      // Create or update customer
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
      


      // Create sales master
      const invoiceId = entryNumber;
      const totalWastageAmount = products.reduce((sum, p) => sum + ((parseFloat(p.price) || 0) * (parseFloat(p.wastage) || 0) / 100), 0);
      const avgWastagePercent = products.length > 0 ? 
        products.reduce((sum, p) => sum + (parseFloat(p.wastage) || 0), 0) / products.length : 0;
      const salesMasterPayload = {
        data: {
          cid: customerId.toString(),
          date: new Date(saleDate).toISOString(),
          invoice: invoiceId,
          totalamount: totalAmount.toString(),
          totalqty: products.reduce((sum, p) => sum + (parseFloat(p.qty) || 0), 0).toString(),
          taxpercentage: taxPercentage,
          modeofpayment: modeOfPayment,
          currentSilverRate: silverRate.toString(),
          wastage: totalWastageAmount.toString(),
          remarks: `wastage_percent:${avgWastagePercent}`,
          discount_percentage: "0",
          discount_amount: "0",
          roundoff: roundOff.toString()
        }
      };
      const salesMasterResponse = await request(endpoints.sales.masters.create(), 'POST', salesMasterPayload);
      console.log('Sales Master Created:', salesMasterResponse);

      // Create individual sales details with sequence numbers
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (product.product) {
          try {
            const salesDetailPayload = {
              data: {
                invoice_id: invoiceId,
                product: product.product,
                touch: product.touch || "",
                weight: product.weight || "0",
                qty: product.qty,
                amount: product.total,
                total: (parseFloat(product.total) * parseFloat(product.qty || "1")).toString(),
                discount_percentage: product.discountPercent || "0",
                discount_amount: product.discountAmount || "0",
                barcode: product.barcode || ""
              }
            };
            const detailResponse = await request(endpoints.sales.details.create(), 'POST', salesDetailPayload);
            console.log(`Sales Detail ${i + 1} Created:`, detailResponse);
            
            // Add delay between requests
            if (i < products.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } catch (detailError) {
            console.error(`Failed to create sales detail for product ${i + 1}:`, product.product, detailError);
          }
        }
      }

      // Delete estimation if this sale was created from an estimation
      if (estimationToConvert) {
        try {
          console.log('Deleting estimation:', estimationToConvert.estimationNumber);
          
          // Delete estimation details first
          const detailsResponse = await request(`/api/estimation-details?filters[estimation_id][$eq]=${estimationToConvert.estimationNumber}`);
          console.log('Details to delete:', detailsResponse.data);
          
          if (detailsResponse.data && detailsResponse.data.length > 0) {
            for (const detail of detailsResponse.data) {
              console.log('Deleting detail:', detail.documentId);
              try {
                await fetch(`https://jewelapi.sricashway.com/api/estimation-details/${detail.documentId}`, {
                  method: 'DELETE'
                });
              } catch (e) {
                console.log('Detail deleted or already removed');
              }
            }
          }
          
          // Delete estimation master
          const masterResponse = await request(`/api/estimation-masters?filters[estimation_number][$eq]=${estimationToConvert.estimationNumber}`);
          console.log('Master to delete:', masterResponse.data);
          
          if (masterResponse.data && masterResponse.data.length > 0) {
            const estimationMaster = masterResponse.data[0];
            console.log('Deleting master:', estimationMaster.documentId);
            try {
              await fetch(`https://jewelapi.sricashway.com/api/estimation-masters/${estimationMaster.documentId}`, {
                method: 'DELETE'
              });
            } catch (e) {
              console.log('Master deleted or already removed');
            }
          }
          
          console.log('Estimation deletion completed');
          setEstimationToConvert(null);
        } catch (error) {
          console.error('Failed to delete estimation:', error);
        }
      }
      
      setLastInvoiceId(invoiceId);
      setShowInvoice(true);
      
      toast({
        title: "✅ Success",
        description: "Sales entry created successfully",
      });
    } catch (error) {
      console.error('Sales entry error:', error);
      toast({
        title: "❌ Error",
        description: "Failed to create sales entry",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = () => {
    const productTotal = products.reduce((sum, product) => sum + (parseFloat(product.total) || 0), 0);
    const taxAmount = (productTotal * parseFloat(taxPercentage)) / 100;
    const sgst = taxAmount / 2;
    const cgst = taxAmount / 2;
    
    const invoice = {
      id: Date.now(),
      invoiceNumber: lastInvoiceId,
      customer: customer,
      date: new Date().toISOString(),
      silverRate: silverRate,
      items: products.map(p => ({
        id: p.product,
        itemName: p.product,
        category: 'Jewelry',
        weight: p.isFixedPrice ? 0 : (parseFloat(p.weight) || 0),
        purity: p.touch,
        rate: 0,
        makingCharges: parseFloat(p.wastage) || 0,
        quantity: parseFloat(p.qty) || 1,
        discountPercent: parseFloat(p.discountPercent) || 0,
        discountAmount: parseFloat(p.discountAmount) || 0,
        total: parseFloat(p.total) || 0
      })),
      subtotal: productTotal,
      discount: 0,
      gst: {
        sgst,
        cgst,
        total: taxAmount
      },
      total: totalAmount,
      roundoff: roundOff,
      paymentMethod: modeOfPayment,
      status: 'paid' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    InvoiceService.printInvoice(invoice);
    
    // Reset form after printing
    handleNewSale();
  };

  const handleNewSale = () => {
    setCustomer({ id: 0, name: "", phone: "", email: "", address: "", aadhar: "", gstin: "" });
    setProducts([{ product: "", touch: "", weight: "", qty: "", price: "", wastage: "", discountPercent: "", discountAmount: "", total: "", barcode: "" }]);
    setRoundOff(0);
    setEstimationToConvert(null);
    setShowInvoice(false);
    setLastInvoiceId("");
    setSaleDate(new Date().toISOString().split('T')[0]);
    generateEntryNumber();
  };

  return (
    <PageLayout>
      <PageHeader
        title="Sales Entry"
        onBack={goBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Sales Entry" }
        ]}
        icon={<ShoppingCart className="w-6 h-6 text-primary mr-3" />}
        actions={
          onLogout && (
            <ActionButton variant="danger" size="sm" onClick={onLogout} icon={LogOut}>
              <span className="hidden sm:inline">Logout</span>
            </ActionButton>
          )
        }
      />
      
      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Section */}
          <FormSection title="Customer Information" description="Enter customer details">
            <div className="grid grid-cols-1 gap-4">
              <FormField label="Phone Number" required>
                <Input
                  value={customer.phone}
                  onChange={(e) => {
                    setCustomer(prev => ({ ...prev, phone: e.target.value }));
                    handleCustomerSearch(e.target.value);
                  }}
                  placeholder="Enter phone number"
                  required
                />
              </FormField>
              <FormField label="Customer Name" required>
                <CustomerAutocomplete
                  value={customer.name}
                  onChange={(value) => setCustomer(prev => ({ ...prev, name: value }))}
                  onCustomerSelect={(selectedCustomer) => setCustomer(selectedCustomer)}
                  onCreateNew={(name) => setCustomer(prev => ({ ...prev, name, id: 0 }))}
                  placeholder="Enter customer name"
                  required
                />
              </FormField>
              <FormField label="Email">
                <Input
                  value={customer.email}
                  onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </FormField>
              <FormField label="Address">
                <Input
                  value={customer.address}
                  onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                />
              </FormField>
              <FormField label="Aadhar Number">
                <Input
                  value={customer.aadhar}
                  onChange={(e) => setCustomer(prev => ({ ...prev, aadhar: e.target.value }))}
                  placeholder="Enter Aadhar number"
                  maxLength={12}
                />
              </FormField>
              <FormField label="GSTIN">
                <Input
                  value={customer.gstin}
                  onChange={(e) => setCustomer(prev => ({ ...prev, gstin: e.target.value }))}
                  placeholder="Enter GSTIN"
                  maxLength={15}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Summary Section */}
          <GradientCard title="Sale Summary" icon={<ShoppingCart className="w-5 h-5 text-white" />}>
            <div className="space-y-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {entryNumber}
                </div>
                <div className="text-sm text-blue-700">Sale Entry Number</div>
              </div>
              <FormField label="Tax %">
                <Input
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  placeholder="3"
                  type="number"
                />
              </FormField>
              <FormField label="Payment Mode">
                <Input
                  value={modeOfPayment}
                  onChange={(e) => setModeOfPayment(e.target.value)}
                  placeholder="Cash, UPI, Card"
                />
              </FormField>
              <FormField label="Round Off">
                <Input
                  value={roundOff}
                  onChange={(e) => setRoundOff(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </FormField>

              <FormField label="Sale Date">
                <Input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </FormField>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalAmount.toFixed(2)}
                </div>
                <div className="text-sm text-green-700">Total Amount</div>
              </div>
            </div>
          </GradientCard>
        </div>

        {/* Products Section */}
        <FormSection title="Products" description="Add products to the sale">
          {products.map((product, index) => (
            <Card key={index} className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold">Product {index + 1}</h4>
                {products.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => removeProduct(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
                <FormField label="Barcode/Product">
                  <Input
                    value={product.product}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateProduct(index, "product", value);
                      
                      // Search for any numeric barcode
                      if (value.length >= 10 && /^\d+$/.test(value)) {
                        handleBarcodeSearch(value, index);
                      }
                    }}
                    placeholder="Scan or enter barcode"
                  />
                </FormField>
                {!product.isFixedPrice && (
                  <FormField label="Touch">
                    <Input
                      value={product.touch}
                      onChange={(e) => updateProduct(index, "touch", e.target.value)}
                      placeholder="Touch/Purity"
                    />
                  </FormField>
                )}
                <FormField label="Quantity">
                  <Input
                    value={product.qty}
                    onChange={(e) => updateProduct(index, "qty", e.target.value)}
                    placeholder="Qty"
                    type="number"
                  />
                </FormField>
                {!product.isFixedPrice && (
                  <FormField label={`Weight (₹${silverRate}/g)`}>
                    <Input
                      value={product.weight}
                      onChange={(e) => updateProduct(index, "weight", e.target.value)}
                      placeholder="Weight"
                      type="number"
                    />
                  </FormField>
                )}
                <FormField label="Price">
                  <Input
                    value={product.price}
                    onChange={(e) => updateProduct(index, "price", e.target.value)}
                    placeholder="Price"
                    type="number"
                  />
                </FormField>
                {!product.isFixedPrice && (
                  <FormField label="VA%">
                    <div className="space-y-1">
                      <Input
                        value={product.wastage}
                        onChange={(e) => updateProduct(index, "wastage", e.target.value)}
                        placeholder="Wastage %"
                        type="number"
                      />
                      {product.price && product.wastage && (
                        <div className="text-xs text-gray-500">
                          Amount: ₹{((parseFloat(product.price) || 0) * (parseFloat(product.wastage) || 0) / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </FormField>
                )}
                <FormField label="Discount %">
                  <Input
                    value={product.discountPercent}
                    onChange={(e) => updateProduct(index, "discountPercent", e.target.value)}
                    placeholder="Discount %"
                    type="number"
                  />
                </FormField>
                <FormField label="Discount ₹">
                  <Input
                    value={product.discountAmount}
                    onChange={(e) => updateProduct(index, "discountAmount", e.target.value)}
                    placeholder="Discount Amount"
                    type="number"
                  />
                </FormField>
                <FormField label="Total">
                  <Input
                    value={product.total}
                    readOnly
                    placeholder="Auto calculated"
                    className="bg-gray-50 font-bold"
                  />
                </FormField>
              </div>
            </Card>
          ))}
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={addProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            {!showInvoice ? (
              <Button onClick={handleSubmit} disabled={loading} size="lg">
                {loading ? 'Creating...' : 'Create Sale'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handlePrintInvoice} variant="outline" size="lg">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
                <Button onClick={handleNewSale} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Sale
                </Button>
              </div>
            )}
          </div>
        </FormSection>
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