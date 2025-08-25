import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { DataList, DetailPanel, FormDialog, useApi, usePagination, formatCurrency, formatDate, calculateTotal, BaseEntity, PageProps } from "@/shared";
import { endpoints } from "@/shared";
import { Package, Calendar, Hash, IndianRupee, Trash2, Plus, ShoppingBag, TrendingUp, Clock, Star, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "@/styles/scrollbar.css";

interface PurchaseMaster extends BaseEntity {
  totalamount: string;
  totalqty: string;
  date: string;
  suppliername: string;
  modeofpayment: string;
}

interface Purchase extends BaseEntity {
  total_amount: number;
  pid: string;
  rate: string;
  qty: string;
  touch: string;
  product: string;
}

interface ProductForm {
  product: string;
  qty: string;
  rate: string;
  touch: string;
}

interface PurchaseEntryProps extends PageProps {
  onLogout?: () => void;
}

export const PurchaseEntry = ({ onBack, onNavigate, onLogout }: PurchaseEntryProps) => {
  const [purchaseMasters, setPurchaseMasters] = useState<PurchaseMaster[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseMaster | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { page, hasMore, nextPage, resetPagination } = usePagination();
  const { loading, request } = useApi();

  const [newPurchase, setNewPurchase] = useState<{ suppliername: string; modeofpayment: string; products: ProductForm[] }>({
    suppliername: "",
    modeofpayment: "",
    products: [{ product: "", qty: "", rate: "", touch: "" }]
  });

  const loadPurchaseMasters = async (pageNum = 1, search = "") => {
    try {
      const data = await request(endpoints.purchase.masters.list(pageNum, 10, search));
      if (pageNum === 1) {
        setPurchaseMasters(data.data);
      } else {
        setPurchaseMasters(prev => [...prev, ...data.data]);
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load purchase entries",
        variant: "destructive",
      });
    }
  };

  const loadPurchaseDetails = async (masterId: string) => {
    try {
      const data = await request(endpoints.purchase.details.list(masterId));
      setPurchases(data.data || []);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load purchase details",
        variant: "destructive",
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
      nextPage();
      loadPurchaseMasters(page + 1, searchTerm);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    resetPagination();
    loadPurchaseMasters(1, value);
  };

  const handlePurchaseClick = (purchase: PurchaseMaster) => {
    setSelectedPurchase(purchase);
    setShowDetails(true);
    loadPurchaseDetails(purchase.id.toString());
  };

  const addProductRow = () => {
    setNewPurchase(prev => ({
      ...prev,
      products: [...prev.products, { product: "", qty: "", rate: "", touch: "" }]
    }));
  };

  const removeProductRow = (index: number) => {
    setNewPurchase(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    setNewPurchase(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      const totalAmount = calculateTotal(newPurchase.products);
      const totalQty = newPurchase.products.reduce((sum, product) => 
        sum + (parseFloat(product.qty) || 0), 0
      );

      // Create purchase master
      const masterData = await request(endpoints.purchase.masters.create(), 'POST', {
        data: {
          suppliername: newPurchase.suppliername,
          modeofpayment: newPurchase.modeofpayment,
          totalamount: totalAmount.toString(),
          totalqty: totalQty.toString(),
          date: new Date().toISOString()
        }
      });

      const masterId = masterData.data.id;

      // Create individual purchases
      for (const product of newPurchase.products) {
        if (product.product && product.qty && product.rate) {
          await request(endpoints.purchase.details.create(), 'POST', {
            data: {
              pid: masterId.toString(),
              product: product.product,
              qty: product.qty,
              rate: product.rate,
              touch: product.touch,
              total_amount: parseFloat(product.qty) * parseFloat(product.rate)
            }
          });
        }
      }

      toast({
        title: "✅ Success",
        description: "Purchase entry created successfully",
      });

      setShowAddDialog(false);
      setNewPurchase({ suppliername: "", modeofpayment: "", products: [{ product: "", qty: "", rate: "", touch: "" }] });
      loadPurchaseMasters(1, searchTerm);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create purchase entry",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadPurchaseMasters();
  }, []);

  const renderPurchaseItem = (purchase: PurchaseMaster) => {
    const isRecent = new Date(purchase.date) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    const amount = parseFloat(purchase.totalamount);
    const isHighValue = amount > 10000;
    
    return (
      <Card
        key={purchase.id}
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 ${
          isHighValue ? 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-white' : 
          isRecent ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white' :
          'border-l-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white'
        }`}
        onClick={() => handlePurchaseClick(purchase)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  isHighValue ? 'bg-amber-100 text-amber-600' :
                  isRecent ? 'bg-green-100 text-green-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {isHighValue ? <Star className="w-4 h-4" /> :
                   isRecent ? <TrendingUp className="w-4 h-4" /> :
                   <ShoppingBag className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">#{purchase.id}</span>
                    {isRecent && <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">New</span>}
                    {isHighValue && <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full font-medium">High Value</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(purchase.date)}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className={`text-xl font-bold ${
                isHighValue ? 'text-amber-600' :
                amount > 5000 ? 'text-green-600' :
                'text-blue-600'
              }`}>
                {formatCurrency(purchase.totalamount)}
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {purchase.totalqty} items
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title="Purchase Entry"
        onBack={onBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Purchase Entry" }
        ]}
        icon={<Package className="w-6 h-6 text-primary mr-3" />}
        actions={
          onLogout && (
            <ActionButton variant="danger" size="sm" onClick={onLogout} icon={LogOut}>
              <span className="hidden sm:inline">Logout</span>
            </ActionButton>
          )
        }
      />
      
      <PageContent>
        <div className="flex gap-4 h-[calc(100vh-160px)] max-w-none">
          {/* Left Panel - Purchase List */}
          <div className={`${showDetails ? 'w-1/2' : 'w-full'} transition-all duration-500 ease-in-out`}>
            <div className="relative h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-20 animate-pulse"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 h-full">
                <DataList
                  title="Purchase Entries"
                  icon={<div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg"><Package className="w-5 h-5 text-white" /></div>}
                  data={purchaseMasters}
                  loading={loading}
                  searchValue={searchTerm}
                  onSearchChange={handleSearch}
                  onScroll={handleScroll}
                  onAdd={() => setShowAddDialog(true)}
                  renderItem={renderPurchaseItem}
                  addButtonText="New Purchase"
                />
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="w-1/2 animate-in slide-in-from-right duration-500">
              <div className="relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-xl blur opacity-20"></div>
                <Card className="relative h-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"></div>
                  
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                          <Hash className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Purchase Details</h3>
                          <p className="text-sm text-gray-500">#{selectedPurchase?.id}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)} className="hover:bg-red-50 hover:text-red-600">
                        ✕
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {selectedPurchase && (
                      <div className="p-6 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <Label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Date</Label>
                            </div>
                            <p className="text-lg font-bold text-blue-800">{formatDate(selectedPurchase.date)}</p>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <IndianRupee className="w-4 h-4 text-green-600" />
                              <Label className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total</Label>
                            </div>
                            <p className="text-lg font-bold text-green-800">{formatCurrency(selectedPurchase.totalamount)}</p>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-orange-600" />
                              <Label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Supplier</Label>
                            </div>
                            <p className="text-lg font-bold text-orange-800">{selectedPurchase.suppliername || 'N/A'}</p>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-purple-600" />
                              <Label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Items</Label>
                            </div>
                            <p className="text-lg font-bold text-purple-800">{selectedPurchase.totalqty}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl border border-cyan-200">
                            <div className="flex items-center gap-2 mb-2">
                              <IndianRupee className="w-4 h-4 text-cyan-600" />
                              <Label className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Payment Mode</Label>
                            </div>
                            <p className="text-lg font-bold text-cyan-800">{selectedPurchase.modeofpayment || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Products Section */}
                        <div>
                          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200">
                            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-md">
                              <ShoppingBag className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">Product Breakdown</h4>
                            <div className="ml-auto px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                              {purchases.length} items
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {purchases.length === 0 ? (
                              <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">Loading products...</p>
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-3"></div>
                              </div>
                            ) : (
                              purchases.map((purchase, index) => {
                                const itemTotal = parseFloat(purchase.total_amount.toString());
                                const isHighValue = itemTotal > 5000;
                                
                                return (
                                  <Card key={purchase.id} className={`p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 ${
                                    isHighValue ? 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50' : 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
                                  }`}>
                                    <div className="space-y-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                                            isHighValue ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                                          }`}>
                                            {index + 1}
                                          </div>
                                          <div>
                                            <h5 className="font-bold text-gray-800 text-lg">{purchase.product}</h5>
                                            {isHighValue && <span className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full font-medium mt-1">High Value</span>}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className={`text-2xl font-bold ${
                                            isHighValue ? 'text-amber-600' : 'text-green-600'
                                          }`}>
                                            {formatCurrency(purchase.total_amount)}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                                          <div className="text-blue-600 font-semibold text-sm mb-1">Quantity</div>
                                          <div className="text-xl font-bold text-blue-800">{purchase.qty}</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border border-green-200 text-center">
                                          <div className="text-green-600 font-semibold text-sm mb-1">Rate</div>
                                          <div className="text-xl font-bold text-green-800">{formatCurrency(purchase.rate)}</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border border-purple-200 text-center">
                                          <div className="text-purple-600 font-semibold text-sm mb-1">Touch</div>
                                          <div className="text-sm font-bold text-purple-800 truncate">{purchase.touch}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        <FormDialog
          title="Create New Purchase Entry"
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleSubmit}
          submitText="Create Purchase"
          loading={loading}
        >
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <Label className="text-sm font-semibold text-blue-700 mb-3 block">Purchase Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-blue-600 mb-1 block">Supplier Name</Label>
                <Input
                  value={newPurchase.suppliername}
                  onChange={(e) => setNewPurchase(prev => ({ ...prev, suppliername: e.target.value }))}
                  placeholder="Enter supplier name"
                  className="bg-white border-blue-300 focus:border-blue-500"
                />
              </div>
              <div>
                <Label className="text-xs text-blue-600 mb-1 block">Mode of Payment</Label>
                <Input
                  value={newPurchase.modeofpayment}
                  onChange={(e) => setNewPurchase(prev => ({ ...prev, modeofpayment: e.target.value }))}
                  placeholder="Cash, UPI, Card, etc."
                  className="bg-white border-blue-300 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <Label className="text-lg font-bold text-gray-800 mb-3 block flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Product Details
            </Label>
          </div>
          
          {newPurchase.products.map((product, index) => (
            <Card key={index} className="p-5 bg-gradient-to-r from-white to-gray-50 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h4 className="font-bold text-gray-800">Product {index + 1}</h4>
                </div>
                {newPurchase.products.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeProductRow(index)}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Product Name</Label>
                  <Input
                    value={product.product}
                    onChange={(e) => updateProduct(index, 'product', e.target.value)}
                    placeholder="Enter product name"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Touch/Quality</Label>
                  <Input
                    value={product.touch}
                    onChange={(e) => updateProduct(index, 'touch', e.target.value)}
                    placeholder="Enter touch/quality"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Quantity</Label>
                  <Input
                    type="number"
                    value={product.qty}
                    onChange={(e) => updateProduct(index, 'qty', e.target.value)}
                    placeholder="Enter quantity"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Rate (₹)</Label>
                  <Input
                    type="number"
                    value={product.rate}
                    onChange={(e) => updateProduct(index, 'rate', e.target.value)}
                    placeholder="Enter rate"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
              </div>
              {product.qty && product.rate && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700 font-medium">
                    Subtotal: <span className="font-bold">{formatCurrency(parseFloat(product.qty) * parseFloat(product.rate) || 0)}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={addProductRow} className="inline-flex items-center gap-2 hover:bg-indigo-50 hover:border-indigo-300">
              <Plus className="w-4 h-4 flex-shrink-0 inline-flex" />
              <span>Add Another Product</span>
            </Button>
            
            {newPurchase.products.length > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotal(newPurchase.products))}
                </div>
              </div>
            )}
          </div>
        </FormDialog>
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
