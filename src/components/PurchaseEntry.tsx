import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { DataList, DetailPanel, FormDialog, useApi, usePagination, formatCurrency, formatDate, calculateTotal, BaseEntity, PageProps } from "@/shared";
import { endpoints } from "@/shared";
import { Package, Calendar, Hash, IndianRupee, Trash2, Plus, ShoppingBag, TrendingUp, Clock, Star, LogOut, RefreshCw, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
import "@/styles/scrollbar.css";

interface PurchaseMaster extends BaseEntity {
  totalamount: string;
  totalqty: string;
  totalweight?: string;
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
  weight: string;
}

interface ProductForm {
  product: string;
  touch: string;
  qty: string;
  totalWeight: string;
  totalPrice: string;
}

interface PurchaseEntryProps extends PageProps {
  onLogout?: () => void;
}

export const PurchaseEntry = ({ onBack, onNavigate, onLogout }: PurchaseEntryProps) => {
  const [purchaseMasters, setPurchaseMasters] = useState<PurchaseMaster[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseWeights, setPurchaseWeights] = useState<{[key: number]: string}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseMaster | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { page, hasMore, nextPage, resetPagination } = usePagination();
  const { loading, request } = useApi();
  const { goBack } = useNavigation();

  const [newPurchase, setNewPurchase] = useState<{ suppliername: string; modeofpayment: string; date: string; products: ProductForm[] }>({
    suppliername: "",
    modeofpayment: "",
    date: new Date().toISOString().split('T')[0],
    products: [{ product: "", touch: "", qty: "", totalWeight: "", totalPrice: "" }]
  });
  
  const [existingProducts, setExistingProducts] = useState<string[]>([]);
  const [existingSuppliers, setExistingSuppliers] = useState<string[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<{ [key: number]: string[] }>({});
  const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState<{ [key: number]: boolean }>({});
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Use purchaseMasters directly since API handles filtering and pagination
  const paginatedPurchases = purchaseMasters;
  const totalPages = Math.ceil(purchaseMasters.length / pageSize); // This will be updated when we get total count from API

  const loadPurchaseMasters = useCallback(async (pageNum = 1, search = "") => {
    try {
      const searchQuery = search ? `&filters[suppliername][$contains]=${encodeURIComponent(search)}` : '';
      const data = await request(`/api/purchase-masters?pagination[page]=${pageNum}&pagination[pageSize]=${pageSize}${searchQuery}&sort=id:desc`);
      const masters = data.data || [];
      
      if (pageNum === 1) {
        setPurchaseMasters(masters);
      } else {
        setPurchaseMasters(prev => [...prev, ...masters]);
      }
      
      // Load weights for new masters only
      const weights: {[key: number]: string} = {};
      for (const master of masters) {
        try {
          const detailsData = await request(`/api/purchases?filters[pid][$eq]=${master.id}`);
          const totalWeight = (detailsData.data || []).reduce((sum: number, purchase: any) => 
            sum + (parseFloat(purchase.weight) * parseFloat(purchase.qty)), 0
          );
          weights[master.id] = totalWeight.toFixed(2);
        } catch (error) {
          weights[master.id] = '0';
        }
      }
      setPurchaseWeights(prev => ({...prev, ...weights}));
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load purchase entries",
        variant: "destructive",
      });
    }
  }, [request, toast, pageSize]);

  const loadPurchaseDetails = async (masterId: string) => {
    try {
      const data = await request(`/api/purchases?filters[pid][$eq]=${masterId}`);
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
    // Removed pagination scroll logic
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    loadPurchaseMasters(1, value);
  }, [loadPurchaseMasters]);

  const handlePurchaseClick = (purchase: PurchaseMaster) => {
    setSelectedPurchase(purchase);
    setShowDetails(true);
    loadPurchaseDetails(purchase.id.toString());
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this purchase entry?')) return;
    
    try {
      await request(`/api/purchase-masters/${id}`, 'DELETE');
      toast({
        title: "✅ Success",
        description: "Purchase entry deleted successfully",
      });
      loadPurchaseMasters(1, searchTerm);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete purchase entry",
        variant: "destructive",
      });
    }
  };

  const addProductRow = () => {
    setNewPurchase(prev => ({
      ...prev,
      products: [...prev.products, { product: "", touch: "", qty: "", totalWeight: "", totalPrice: "" }]
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
      products: prev.products.map((product, i) => {
        if (i === index) {
          return { ...product, [field]: value };
        }
        return product;
      })
    }));
    
    // Handle product autocomplete
    if (field === 'product' && value.length > 0) {
      const filtered = existingProducts.filter(p => 
        p.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setProductSuggestions(prev => ({ ...prev, [index]: filtered }));
      setShowProductSuggestions(prev => ({ ...prev, [index]: filtered.length > 0 }));
    } else if (field === 'product') {
      setShowProductSuggestions(prev => ({ ...prev, [index]: false }));
    }
  };
  
  const handleSupplierChange = (value: string) => {
    setNewPurchase(prev => ({ ...prev, suppliername: value }));
    
    if (value.length > 0) {
      const filtered = existingSuppliers.filter(s => 
        s.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setSupplierSuggestions(filtered);
      setShowSupplierSuggestions(filtered.length > 0);
    } else {
      setShowSupplierSuggestions(false);
    }
  };
  
  const selectProduct = (index: number, product: string) => {
    updateProduct(index, 'product', product);
    setShowProductSuggestions(prev => ({ ...prev, [index]: false }));
  };
  
  const selectSupplier = (supplier: string) => {
    setNewPurchase(prev => ({ ...prev, suppliername: supplier }));
    setShowSupplierSuggestions(false);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!newPurchase.suppliername.trim()) {
      toast({
        title: "❌ Validation Error",
        description: "Supplier name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const totalAmount = newPurchase.products.reduce((sum, product) => 
        sum + (parseFloat(product.totalPrice) || 0), 0
      );
      const totalQty = newPurchase.products.reduce((sum, product) => 
        sum + (parseFloat(product.qty) || 0), 0
      );

      const totalWeight = newPurchase.products.reduce((sum, product) => 
        sum + (parseFloat(product.totalWeight) || 0), 0
      );

      // Create purchase master
      const masterData = await request('/api/purchase-masters', 'POST', {
        data: {
          suppliername: newPurchase.suppliername,
          modeofpayment: newPurchase.modeofpayment,
          totalamount: totalAmount.toString(),
          totalqty: totalQty.toString(),
          totalWeight: totalWeight.toString(),
          date: new Date(newPurchase.date).toISOString()
        }
      });

      const masterId = masterData.data.id;

      // Create individual purchases
      for (const product of newPurchase.products) {
        if (product.product && product.qty && product.totalWeight && product.totalPrice) {
          await request('/api/purchases', 'POST', {
            data: {
              pid: masterId.toString(),
              product: product.product,
              qty: product.qty,
              rate: (parseFloat(product.totalPrice) / parseFloat(product.qty)).toString(),
              touch: product.touch,
              weight: (parseFloat(product.totalWeight) / parseFloat(product.qty)).toString(),
              total_amount: parseFloat(product.totalPrice)
            }
          });
        }
      }

      toast({
        title: "✅ Success",
        description: "Purchase entry created successfully",
      });

      setShowAddDialog(false);
      setNewPurchase({ suppliername: "", modeofpayment: "", date: new Date().toISOString().split('T')[0], products: [{ product: "", touch: "", qty: "", totalWeight: "", totalPrice: "" }] });
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
    loadExistingData();
  }, [loadPurchaseMasters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, pageSize]);
  
  const loadExistingData = async () => {
    try {
      // Load from barcode products
      const barcodeData = await request('/api/barcodes?pagination[pageSize]=1000');
      const barcodeProducts = barcodeData.data?.map((p: any) => p.product).filter(Boolean) || [];
      
      // Load from purchases
      const purchaseData = await request('/api/purchases?pagination[pageSize]=1000');
      const purchaseProducts = purchaseData.data?.map((p: any) => p.product).filter(Boolean) || [];
      
      // Combine and deduplicate
      const allProducts = [...new Set([...barcodeProducts, ...purchaseProducts])];
      setExistingProducts(allProducts);
      
      // Load suppliers
      const masterData = await request('/api/purchase-masters?pagination[pageSize]=100');
      const suppliers = [...new Set(masterData.data?.map((p: any) => p.suppliername).filter(Boolean) || [])];
      setExistingSuppliers(suppliers);
    } catch (error) {
      console.error('Failed to load existing data:', error);
    }
  };

  const renderPurchaseItem = useCallback((purchase: PurchaseMaster) => {
    const isRecent = new Date(purchase.date) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    const amount = parseFloat(purchase.totalamount);
    const isHighValue = amount > 10000;
    
    return (
      <Card
        key={purchase.id}
        className={`cursor-pointer hover:shadow-md border-l-4 ${
          isHighValue ? 'border-l-amber-500 bg-amber-50' : 
          isRecent ? 'border-l-green-500 bg-green-50' :
          'border-l-blue-500 hover:bg-blue-50'
        }`}
        onClick={() => handlePurchaseClick(purchase)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isHighValue ? 'bg-amber-100 text-amber-600' :
                isRecent ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {isHighValue ? <Star className="w-5 h-5" /> :
                 isRecent ? <TrendingUp className="w-5 h-5" /> :
                 <ShoppingBag className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{purchase.suppliername || 'Unknown Supplier'}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(purchase.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {purchase.totalqty} items
                  </div>
                  <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {purchase.modeofpayment || 'Cash'}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold mb-1 ${
                isHighValue ? 'text-amber-600' :
                amount > 5000 ? 'text-green-600' :
                'text-blue-600'
              }`}>
                {formatCurrency(purchase.totalamount)}
              </div>
              <div className="flex gap-1">
                {isRecent && <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">New</span>}
                {isHighValue && <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">High Value</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, []);

  return (
    <PageLayout>
      <PageHeader
        title="Purchase Entry"
        onBack={goBack}
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
        {/* Purchase Table Section */}
        <div>
          <Card className="bg-white border shadow-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Purchase Entries
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">View and manage all purchase entries</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Purchase
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Search</Label>
                  <Input
                    value={searchFilter}
                    onChange={(e) => {
                      setSearchFilter(e.target.value);
                      setCurrentPage(1);
                      loadPurchaseMasters(1, e.target.value);
                    }}
                    placeholder="Search by supplier name or ID..."
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Entries per page</Label>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => {
                    setCurrentPage(1);
                    setPurchaseMasters([]);
                    loadPurchaseMasters(1, searchFilter);
                  }} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedPurchases.map((purchase, index) => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.suppliername || 'Unknown Supplier'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(purchase.date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(purchase.totalamount)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {purchaseWeights[purchase.id] ? `${purchaseWeights[purchase.id]}g` : 'Loading...'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {purchase.totalqty} items
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {purchase.modeofpayment || 'Cash'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePurchaseClick(purchase)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(purchase.id)}
                                className="text-red-600 hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, paginatedPurchases.length)} of {paginatedPurchases.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = Math.max(currentPage - 1, 1);
                      setCurrentPage(newPage);
                      loadPurchaseMasters(newPage, searchFilter);
                    }}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      loadPurchaseMasters(newPage, searchFilter);
                    }}
                    disabled={paginatedPurchases.length < pageSize || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Label className="text-xs text-blue-600 mb-1 block">Supplier Name *</Label>
                <Input
                  value={newPurchase.suppliername}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  placeholder="Enter supplier name"
                  className="bg-white border-blue-300 focus:border-blue-500"
                />
                {showSupplierSuggestions && supplierSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {supplierSuggestions.map((supplier, idx) => (
                      <div
                        key={idx}
                        className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectSupplier(supplier)}
                      >
                        {supplier}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-blue-600 mb-1 block">Purchase Date</Label>
                <Input
                  type="date"
                  value={newPurchase.date}
                  onChange={(e) => setNewPurchase(prev => ({ ...prev, date: e.target.value }))}
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
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                <div className="space-y-2 relative">
                  <Label className="text-sm font-semibold text-gray-700">Product Name</Label>
                  <Input
                    value={product.product}
                    onChange={(e) => updateProduct(index, 'product', e.target.value)}
                    placeholder="Enter product name"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                  {showProductSuggestions[index] && productSuggestions[index]?.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {productSuggestions[index].map((productName, idx) => (
                        <div
                          key={idx}
                          className="p-2 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => selectProduct(index, productName)}
                        >
                          {productName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Touch</Label>
                  <Input
                    value={product.touch}
                    onChange={(e) => updateProduct(index, 'touch', e.target.value)}
                    placeholder="Touch/Quality"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Quantity</Label>
                  <Input
                    type="number"
                    value={product.qty}
                    onChange={(e) => updateProduct(index, 'qty', e.target.value)}
                    placeholder="Quantity"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Total Weight (g)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.totalWeight}
                    onChange={(e) => updateProduct(index, 'totalWeight', e.target.value)}
                    placeholder="Total weight"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Total Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.totalPrice}
                    onChange={(e) => updateProduct(index, 'totalPrice', e.target.value)}
                    placeholder="Total price"
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
              </div>
              {product.totalPrice && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700 font-medium">
                    Price: <span className="font-bold">{formatCurrency(parseFloat(product.totalPrice) || 0)}</span>
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
                  {formatCurrency(newPurchase.products.reduce((sum, product) => sum + (parseFloat(product.totalPrice) || 0), 0))}
                </div>
              </div>
            )}
          </div>
        </FormDialog>

        {/* Purchase Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Purchase Details - #{selectedPurchase?.id}</DialogTitle>
            </DialogHeader>
            {selectedPurchase && (
              <div className="space-y-6 pt-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-blue-600 font-semibold text-sm mb-1">Date</div>
                    <div className="text-lg font-bold text-blue-800">{formatDate(selectedPurchase.date)}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-green-600 font-semibold text-sm mb-1">Total Amount</div>
                    <div className="text-lg font-bold text-green-800">{formatCurrency(selectedPurchase.totalamount)}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-orange-600 font-semibold text-sm mb-1">Supplier</div>
                    <div className="text-lg font-bold text-orange-800">{selectedPurchase.suppliername || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-purple-600 font-semibold text-sm mb-1">Items</div>
                    <div className="text-lg font-bold text-purple-800">{selectedPurchase.totalqty}</div>
                  </div>
                </div>

                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="text-cyan-600 font-semibold text-sm mb-1">Payment Mode</div>
                  <div className="text-lg font-bold text-cyan-800">{selectedPurchase.modeofpayment || 'Cash'}</div>
                </div>

                {/* Products Table */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Product Details ({purchases.length} items)
                  </h4>
                  
                  {purchases.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Loading products...</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Weight</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Touch</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {purchases.map((purchase, index) => (
                            <tr key={purchase.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{purchase.product}</td>
                              <td className="px-4 py-4 text-sm text-gray-500">{purchase.qty}</td>
                              <td className="px-4 py-4 text-sm text-gray-500">{(parseFloat(purchase.weight) * parseFloat(purchase.qty)).toFixed(2)}g</td>
                              <td className="px-4 py-4 text-sm text-gray-500">{purchase.touch}</td>
                              <td className="px-4 py-4 text-sm font-medium text-green-600">{formatCurrency(purchase.total_amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
