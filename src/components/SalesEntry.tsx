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
  amount: string;
}

interface SalesEntryProps extends PageProps {
  onLogout?: () => void;
}

export const SalesEntry = ({ onNavigate, onLogout }: SalesEntryProps) => {
  const [customer, setCustomer] = useState<Customer>({ id: 0, name: "", phone: "", email: "", address: "", aadhar: "", gstin: "" });
  const [products, setProducts] = useState<Product[]>([{ product: "", touch: "", weight: "", qty: "", amount: "" }]);
  const [barcodeProducts, setBarcodeProducts] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [wastage, setWastage] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("5");
  const [modeOfPayment, setModeOfPayment] = useState("Cash");
  const [lastInvoiceId, setLastInvoiceId] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadBarcodeProducts();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [products, wastage, taxPercentage]);

  const loadBarcodeProducts = async () => {
    try {
      const response = await request(endpoints.barcode.listBarcodes());
      // Barcode products loaded successfully
      setBarcodeProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load barcode products");
    }
  };

  const calculateTotal = () => {
    const productTotal = products.reduce((sum, product) => sum + (parseFloat(product.amount) || 0), 0);
    const wastageAmount = parseFloat(wastage) || 0;
    const taxAmount = ((productTotal + wastageAmount) * parseFloat(taxPercentage)) / 100;
    setTotalAmount(productTotal + wastageAmount + taxAmount);
  };

  const handleBarcodeSearch = async (barcode: string, index: number) => {
    const foundProduct = barcodeProducts.find(p => p.code === barcode);
    
    if (foundProduct) {
      setProducts(prev => prev.map((product, i) => 
        i === index ? {
          ...product,
          product: foundProduct.product || '',
          touch: foundProduct.touch || '',
          weight: foundProduct.weight || '',
          qty: foundProduct.qty || '1',
          amount: foundProduct.making_charges_or_wastages || '0'
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
    setProducts([...products, { product: "", touch: "", weight: "", qty: "", amount: "" }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    setProducts(products.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    ));
  };

  const handleSubmit = async () => {
    try {
      // Create or update customer
      let customerId = customer.id;
      if (!customerId && (customer.name || customer.phone)) {
        const customerResponse = await request(endpoints.customers.create(), 'POST', {
          data: {
            name: customer.name || 'Unknown Customer',
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
            aadhar: customer.aadhar || '',
            gstin: customer.gstin || ''
          }
        });
        customerId = customerResponse.data.id;
        setCustomer(prev => ({ ...prev, id: customerId }));
      }

      // Create sales master
      const invoiceId = Date.now().toString();
      await request(endpoints.sales.masters.create(), 'POST', {
        data: {
          cid: customerId.toString(),
          date: new Date().toISOString(),
          invoice: invoiceId,
          totalamount: totalAmount.toString(),
          totalqty: products.reduce((sum, p) => sum + (parseFloat(p.qty) || 0), 0).toString(),
          wastage: wastage,
          taxpercentage: taxPercentage,
          modeofpayment: modeOfPayment
        }
      });

      // Create sales details
      for (const product of products) {
        if (product.product) {
          await request(endpoints.sales.details.create(), 'POST', {
            data: {
              invoice_id: invoiceId,
              product: product.product,
              touch: product.touch,
              weight: product.weight,
              qty: product.qty,
              amount: product.amount,
              total: parseFloat(product.amount) * parseFloat(product.qty || "1")
            }
          });
        }
      }

      setLastInvoiceId(invoiceId);
      setShowInvoice(true);
      
      toast({
        title: "✅ Success",
        description: "Sales entry created successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create sales entry",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = () => {
    const productTotal = products.reduce((sum, product) => sum + (parseFloat(product.amount) || 0), 0);
    const wastageAmount = parseFloat(wastage) || 0;
    const taxableAmount = productTotal + wastageAmount;
    const taxAmount = (taxableAmount * parseFloat(taxPercentage)) / 100;
    const sgst = taxAmount / 2;
    const cgst = taxAmount / 2;
    
    const invoice = {
      id: Date.now(),
      invoiceNumber: lastInvoiceId,
      customer: customer,
      date: new Date().toISOString(),
      items: products.map(p => ({
        id: p.product,
        itemName: p.product,
        category: 'Jewelry',
        weight: parseFloat(p.weight) || 0,
        purity: p.touch,
        rate: 0,
        makingCharges: parseFloat(p.amount) || 0,
        quantity: parseFloat(p.qty) || 1,
        total: parseFloat(p.amount) || 0
      })),
      subtotal: productTotal,
      discount: 0,
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
  };

  const handleNewSale = () => {
    setCustomer({ id: 0, name: "", phone: "", email: "", address: "", aadhar: "", gstin: "" });
    setProducts([{ product: "", touch: "", weight: "", qty: "", amount: "" }]);
    setWastage("");
    setShowInvoice(false);
    setLastInvoiceId("");
  };

  return (
    <PageLayout>
      <PageHeader
        title="Sales Entry"
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
                />
              </FormField>
              <FormField label="Customer Name">
                <CustomerAutocomplete
                  value={customer.name}
                  onChange={(value) => setCustomer(prev => ({ ...prev, name: value }))}
                  onCustomerSelect={(selectedCustomer) => setCustomer(selectedCustomer)}
                  onCreateNew={(name) => setCustomer(prev => ({ ...prev, name, id: 0 }))}
                  placeholder="Enter customer name"
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
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Wastage Amount">
                  <Input
                    value={wastage}
                    onChange={(e) => setWastage(e.target.value)}
                    placeholder="0"
                    type="number"
                  />
                </FormField>
                <FormField label="Tax %">
                  <Input
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    placeholder="5"
                    type="number"
                  />
                </FormField>
              </div>
              <FormField label="Payment Mode">
                <Input
                  value={modeOfPayment}
                  onChange={(e) => setModeOfPayment(e.target.value)}
                  placeholder="Cash, UPI, Card"
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
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
                    onChange={(e) => updateProduct(index, "touch", e.target.value)}
                    placeholder="Touch/Purity"
                  />
                </FormField>
                <FormField label="Weight">
                  <Input
                    value={product.weight}
                    onChange={(e) => updateProduct(index, "weight", e.target.value)}
                    placeholder="Weight"
                    type="number"
                  />
                </FormField>
                <FormField label="Quantity">
                  <Input
                    value={product.qty}
                    onChange={(e) => updateProduct(index, "qty", e.target.value)}
                    placeholder="Qty"
                    type="number"
                  />
                </FormField>
                <FormField label="Amount">
                  <Input
                    value={product.amount}
                    onChange={(e) => updateProduct(index, "amount", e.target.value)}
                    placeholder="Amount"
                    type="number"
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