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
  total: string;
}

interface SalesEntryProps extends PageProps {
  onLogout?: () => void;
}

export const SalesEntry = ({ onNavigate, onLogout }: SalesEntryProps) => {
  const [customer, setCustomer] = useState<Customer>({ id: 0, name: "", phone: "", email: "", address: "", aadhar: "", gstin: "" });
  const [products, setProducts] = useState<Product[]>([{ product: "", touch: "", weight: "", qty: "", price: "", wastage: "", total: "" }]);
  const [barcodeProducts, setBarcodeProducts] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [taxPercentage, setTaxPercentage] = useState("3");
  const [silverRate, setSilverRate] = useState(0);
  const [modeOfPayment, setModeOfPayment] = useState("Cash");
  const [lastInvoiceId, setLastInvoiceId] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [entryNumber, setEntryNumber] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [estimationToConvert, setEstimationToConvert] = useState<any>(null);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();
  const { goBack } = useNavigation();

  useEffect(() => {
    loadBarcodeProducts();
    loadSilverRate();
    generateEntryNumber();
    loadEstimationData();
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
        const price = weight * silverRate;
        
        return {
          product: item.product || '',
          touch: item.touch || '',
          weight: item.weight || '',
          qty: item.qty || '1',
          price: price.toFixed(2),
          wastage: data.wastage.toString(),
          total: item.total || ''
        };
      });
      
      setProducts(convertedProducts.length > 0 ? convertedProducts : [{ product: "", touch: "", weight: "", qty: "", price: "", wastage: "", total: "" }]);
      
      // Pre-fill discount
      setDiscountPercent(data.discountPercent);
      setDiscountAmount(data.discountAmount);
      
      // Set silver rate
      setSilverRate(data.silverRate);
      
      // Clear session storage
      sessionStorage.removeItem('estimationToConvert');
    }
  };

  useEffect(() => {
    calculateTotal();
  }, [products, taxPercentage, discountAmount]);

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
      const response = await request(endpoints.rates.list());
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
    const discountedTotal = productTotal - discountAmount;
    const taxAmount = (discountedTotal * parseFloat(taxPercentage)) / 100;
    setTotalAmount(discountedTotal + taxAmount);
  };

  const handleDiscountPercentChange = (percent: number) => {
    setDiscountPercent(percent);
    const productTotal = products.reduce((sum, product) => sum + (parseFloat(product.total) || 0), 0);
    const amount = Math.round((productTotal * percent) / 100);
    setDiscountAmount(amount);
  };

  const handleDiscountAmountChange = (amount: number) => {
    setDiscountAmount(amount);
    const productTotal = products.reduce((sum, product) => sum + (parseFloat(product.total) || 0), 0);
    const percent = productTotal > 0 ? Math.round(((amount / productTotal) * 100) * 100) / 100 : 0;
    setDiscountPercent(percent);
  };

  const handleBarcodeSearch = async (barcode: string, index: number) => {
    const foundProduct = barcodeProducts.find(p => p.code === barcode);
    
    if (foundProduct) {
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
          wastage: wastagePercent.toFixed(2),
          total: total.toFixed(2)
        } : product
      ));
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
    setProducts([...products, { product: "", touch: "", weight: "", qty: "", price: "", wastage: "", total: "" }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const updatedProducts = products.map((product, i) => {
      if (i === index) {
        const updatedProduct = { ...product, [field]: value };
        
        // Auto-calculate price and total when weight or wastage changes
        if ((field === 'weight' || field === 'wastage') && silverRate > 0) {
          const weight = parseFloat(field === 'weight' ? value : product.weight) || 0;
          const wastagePercent = parseFloat(field === 'wastage' ? value : product.wastage) || 0;
          const price = weight * silverRate;
          const wastageAmount = (price * wastagePercent) / 100;
          const total = price + wastageAmount;
          
          updatedProduct.price = price.toFixed(2);
          updatedProduct.total = total.toFixed(2);
        }
        
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
          date: new Date().toISOString(),
          invoice: invoiceId,
          totalamount: totalAmount.toString(),
          totalqty: products.reduce((sum, p) => sum + (parseFloat(p.qty) || 0), 0).toString(),
          taxpercentage: taxPercentage,
          modeofpayment: modeOfPayment,
          currentSilverRate: silverRate.toString(),
          wastage: totalWastageAmount.toString(),
          remarks: `wastage_percent:${avgWastagePercent}`,
          discount_percentage: discountPercent.toString(),
          discount_amount: discountAmount.toString()
        }
      };
      const salesMasterResponse = await request(endpoints.sales.masters.create(), 'POST', salesMasterPayload);

      // Create sales details
      for (const product of products) {
        if (product.product) {
          const salesDetailPayload = {
            data: {
              invoice_id: invoiceId,
              product: product.product,
              touch: product.touch,
              weight: product.weight,
              qty: product.qty,
              amount: product.total,
              total: parseFloat(product.total) * parseFloat(product.qty || "1")
            }
          };
          const salesDetailResponse = await request(endpoints.sales.details.create(), 'POST', salesDetailPayload);
        }
      }

      // Mark estimation as converted if this sale was created from an estimation
      if (estimationToConvert) {
        try {
          const updatePayload = {
            data: {
              converted_to_sale: true,
              converted_invoice_number: invoiceId
            }
          };
          
          // Use direct fetch with full URL
          const response = await fetch(`https://jewelapi.sricashway.com/api/estimation-masters/${estimationToConvert.estimationId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload)
          });
          
          if (response.ok) {
            setEstimationToConvert(null);
          }
        } catch (error) {
          console.error('Failed to update estimation status:', error);
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
    const taxableAmount = productTotal - discountAmount;
    const taxAmount = (taxableAmount * parseFloat(taxPercentage)) / 100;
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
        weight: parseFloat(p.weight) || 0,
        purity: p.touch,
        rate: 0,
        makingCharges: parseFloat(p.wastage) || 0,
        quantity: parseFloat(p.qty) || 1,
        total: parseFloat(p.total) || 0
      })),
      subtotal: productTotal,
      discount: discountAmount,
      gst: {
        sgst,
        cgst,
        total: taxAmount
      },
      total: totalAmount,
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
    setProducts([{ product: "", touch: "", weight: "", qty: "", price: "", wastage: "", total: "" }]);
    setDiscountPercent(0);
    setDiscountAmount(0);
    setEstimationToConvert(null);
    setShowInvoice(false);
    setLastInvoiceId("");
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
              <FormField label="Discount %">
                <Input
                  type="number"
                  value={discountPercent || ''}
                  onChange={(e) => handleDiscountPercentChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </FormField>
              <FormField label="Discount Amount (₹)">
                <Input
                  type="number"
                  value={discountAmount || ''}
                  onChange={(e) => handleDiscountAmountChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
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
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                <FormField label="Barcode/Product">
                  <Input
                    value={product.product}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateProduct(index, "product", value);
                      
                      // Only search if it's a complete barcode
                      if (value.length === 14 && /^\d+$/.test(value)) {
                        handleBarcodeSearch(value, index);
                      }
                    }}
                    placeholder="Scan or enter barcode"
                  />
                </FormField>
                <FormField label="Touch">
                  <Input
                    value={product.touch}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Touch/Purity"
                  />
                </FormField>
                <FormField label="Quantity">
                  <Input
                    value={product.qty}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Qty"
                    type="number"
                  />
                </FormField>
                <FormField label={`Weight (₹${silverRate}/g)`}>
                  <Input
                    value={product.weight}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Weight"
                    type="number"
                  />
                </FormField>
                <FormField label="Price">
                  <Input
                    value={product.price}
                    readOnly
                    placeholder="Auto calculated"
                    className="bg-gray-50"
                  />
                </FormField>
                <FormField label="Wastage & Making %">
                  <div className="space-y-1">
                    <Input
                      value={product.wastage}
                      readOnly
                      className="bg-gray-50"
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
              <Button onClick={handleSubmit} loading={loading} size="lg">
                Create Sale
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