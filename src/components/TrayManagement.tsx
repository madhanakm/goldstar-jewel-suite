import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, GradientCard, FormField } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, fetchAllPaginated, PageProps } from "@/shared";
import { Package, LogOut, Search, QrCode, ShoppingCart, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrayProduct {
  id: number;
  product: string;
  touch: string;
  weight: string;
  qty: string;
  code: string;
  trayno: string;
  status: 'available' | 'sold';
  availableQty?: number;
  soldQty?: number;
}

interface TrayManagementProps extends PageProps {
  onLogout?: () => void;
}

export const TrayManagement = ({ onNavigate, onLogout }: TrayManagementProps) => {
  const [trayProducts, setTrayProducts] = useState<TrayProduct[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [allTrays, setAllTrays] = useState<any[]>([]);
  const [searchTray, setSearchTray] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<TrayProduct[]>([]);
  const [newTrayNo, setNewTrayNo] = useState("");
  const [newTrayWeight, setNewTrayWeight] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTray, setEditingTray] = useState<any>(null);
  const [selectedTray, setSelectedTray] = useState<string | null>(null);
  const [showTrayProducts, setShowTrayProducts] = useState(false);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadAllTrays();
    loadTrayData();
    loadSalesData();
  }, []);

  useEffect(() => {
    if (!selectedTray) {
      filterProducts();
    }
  }, [searchTray, trayProducts, salesData]);

  const loadAllTrays = async () => {
    try {
      const response = await fetchAllPaginated(request, endpoints.trays.list());
      setAllTrays(response.data || []);
    } catch (error) {
      console.error("Failed to load trays");
    }
  };

  const loadTrayData = async () => {
    try {
      const response = await fetchAllPaginated(request, endpoints.barcode.listBarcodes());
      console.log('Barcode data:', response.data);
      const products = response.data?.map((item: any) => {
        return {
          id: item.id,
          product: item.product || '',
          touch: item.touch || '',
          weight: item.weight || '0',
          qty: item.qty || '1',
          code: item.code || '',
          trayno: item.trayno || '',
          status: 'available' as const
        };
      }) || [];
      console.log('Processed products:', products);
      setTrayProducts(products);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load tray data",
        variant: "destructive",
      });
    }
  };

  const loadSalesData = async () => {
    try {
      // Load all sales masters first
      const salesMastersResponse = await request(endpoints.sales.masters.list(1, 1000));
      const salesMasters = salesMastersResponse.data || [];
      
      // Load all sales details for each master
      const allSalesDetails = [];
      for (const master of salesMasters) {
        try {
          const masterAttrs = master.attributes || master;
          const detailsResponse = await request(endpoints.sales.details.list(masterAttrs.invoice));
          const details = detailsResponse.data || [];
          allSalesDetails.push(...details);
        } catch (error) {
          console.error(`Failed to load details for invoice ${masterAttrs.invoice}`);
        }
      }
      
      setSalesData(allSalesDetails);
    } catch (error) {
      console.error("Failed to load sales data");
    }
  };

  const handleDeleteTray = async (tray: any) => {
    if (!confirm('Are you sure you want to delete this tray?')) return;

    try {
      const trayId = tray.documentId;
      await request(`/api/trays/${trayId}`, 'DELETE');
      toast({
        title: "✅ Success",
        description: "Tray deleted successfully",
      });
      loadAllTrays();
      loadTrayData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete tray",
        variant: "destructive",
      });
    }
  };

  const handleAddTray = async () => {
    if (!newTrayNo.trim()) {
      toast({
        title: "⚠️ Warning",
        description: "Please enter a tray number",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        data: { 
          trayno: newTrayNo.trim(),
          tray_weight: newTrayWeight || '0'
        }
      };
      


      if (editingTray) {
        const trayId = editingTray.documentId;
        await request(`/api/trays/${trayId}`, 'PUT', payload);
        toast({
          title: "✅ Success",
          description: "Tray updated successfully",
        });
      } else {
        await request(endpoints.trays.create(), 'POST', payload);
        toast({
          title: "✅ Success",
          description: "Tray added successfully",
        });
      }
      
      setNewTrayNo("");
      setNewTrayWeight("");
      setEditingTray(null);
      setShowAddDialog(false);
      loadAllTrays();
      loadTrayData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: editingTray ? "Failed to update tray" : "Failed to add tray",
        variant: "destructive",
      });
    }
  };

  const filterProducts = () => {
    let filtered = trayProducts;
    
    if (searchTray) {
      filtered = filtered.filter(product => 
        product.trayno.toLowerCase().includes(searchTray.toLowerCase()) ||
        product.product.toLowerCase().includes(searchTray.toLowerCase()) ||
        product.code.includes(searchTray)
      );
    }

    // Filter out sold products - only show available items
    filtered = filtered.filter(product => {
      const isSold = salesData.some(sale => {
        const saleAttrs = sale.attributes || sale;
        return saleAttrs.barcode && product.code && saleAttrs.barcode === product.code;
      });
      return !isSold;
    }).map(product => ({ ...product, status: 'available' as const, availableQty: 1, soldQty: 0 }));
    
    setFilteredProducts(filtered);
  };

  const getTrayStats = () => {
    const availableProducts = filteredProducts.reduce((sum, p) => sum + (parseFloat(p.qty) || 0), 0);
    
    return { trays: allTrays.length, availableProducts };
  };

  const getTrayWiseData = () => {
    const trayMap = new Map();
    
    // Initialize all trays from /trays API
    allTrays.forEach(tray => {
      const trayNo = tray.attributes?.trayno || tray.trayno;
      if (trayNo) {
        trayMap.set(trayNo, { total: 0, available: 0, sold: 0, totalWeight: 0, products: [], productCount: 0 });
      }
    });
    
    // Trays initialized and products loaded
    
    // Add products to their respective trays
    trayProducts.forEach(product => {
      // Processing product for tray assignment
      if (product.trayno && trayMap.has(product.trayno)) {
        const trayData = trayMap.get(product.trayno);
        // Check if this specific barcode is sold
        const isSold = salesData.some(sale => {
          const saleAttrs = sale.attributes || sale;
          return saleAttrs.barcode && product.code && saleAttrs.barcode === product.code;
        });
        
        // Only add available products to tray data
        if (!isSold) {
          const productWeight = parseFloat(product.weight || 0);
          
          trayData.total += 1;
          trayData.productCount++;
          trayData.totalWeight += productWeight;
          trayData.products.push({ ...product, availableQty: 1, soldQty: 0, status: 'available' });
          trayData.available += 1;
        }
        // Product added to tray successfully
      }
    });
    
    return Array.from(trayMap.entries());
  };

  const stats = getTrayStats();

  const renderProductCard = (product: TrayProduct) => {
    const weight = parseFloat(product.weight) || 0;
    
    return (
      <Card key={product.id} className="p-3 border-l-4 border-l-green-500 bg-green-50/50 transition-all">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-sm truncate">{product.product}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <QrCode className="w-3 h-3" />
                {product.code}
              </div>
            </div>
            <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
              Available
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {product.touch && <div><span className="text-gray-500">Touch:</span> {product.touch}</div>}
            {weight > 0 && <div><span className="text-gray-500">Weight:</span> {weight >= 1000 ? `${(weight / 1000).toFixed(1)}kg` : `${weight}g`}</div>}
            <div><span className="text-gray-500">Qty:</span> {product.qty}</div>
            <div><span className="text-gray-500">Tray:</span> {product.trayno}</div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title="Tray Management"
        onBack={() => onNavigate?.("Dashboard")}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Tray Management" }
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GradientCard title="Total Trays" icon={<Package className="w-4 h-4 text-white" />}>
            <div className="text-2xl font-bold text-blue-600">{stats.trays}</div>
          </GradientCard>
          
          <GradientCard title="Available Products" icon={<Package className="w-4 h-4 text-white" />}>
            <div className="text-2xl font-bold text-green-600">{stats.availableProducts}</div>
          </GradientCard>
          
          <GradientCard title="Available Weight" icon={<Package className="w-4 h-4 text-white" />}>
            <div className="text-2xl font-bold text-purple-600">{(filteredProducts.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0) / 1000).toFixed(1)}kg</div>
          </GradientCard>
        </div>

        {/* Search and Add */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={searchTray}
              onChange={(e) => setSearchTray(e.target.value)}
              placeholder="Search by tray number, product name, or barcode..."
              className="flex-1"
            />
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tray
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTray ? 'Edit Tray' : 'Add New Tray'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <FormField label="Tray Number" required>
                    <Input
                      value={newTrayNo}
                      onChange={(e) => setNewTrayNo(e.target.value)}
                      placeholder="Enter tray number (e.g., T001)"
                      readOnly={!!editingTray}
                      disabled={!!editingTray}
                    />
                  </FormField>
                  <FormField label="Tray Weight (g)">
                    <Input
                      type="number"
                      value={newTrayWeight}
                      onChange={(e) => setNewTrayWeight(e.target.value)}
                      placeholder="Enter tray weight in grams"
                    />
                  </FormField>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddTray} loading={loading} className="flex-1">
                      {editingTray ? 'Update Tray' : 'Add Tray'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowAddDialog(false);
                      setEditingTray(null);
                      setNewTrayNo("");
                      setNewTrayWeight("");
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Tray Products Dialog */}
        <Dialog open={showTrayProducts} onOpenChange={setShowTrayProducts}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Products in Tray {selectedTray}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {selectedTray && getTrayWiseData()
                .find(([trayNo]) => trayNo === selectedTray)?.[1]
                .products.map(renderProductCard)
              }
            </div>
          </DialogContent>
        </Dialog>

        {/* Tray Grid */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Tray Overview</h2>
            <div className="text-sm text-gray-500">
              {getTrayWiseData().length} trays
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {getTrayWiseData().map(([trayNo, data]) => {
              const trayData = allTrays.find(t => (t.attributes?.trayno || t.trayno) === trayNo);
              const trayWeight = parseFloat(trayData?.attributes?.tray_weight || trayData?.tray_weight || '0');
              const productWeight = data.totalWeight;
              const actualWeight = productWeight + trayWeight;
              
              return (
              <Card 
                key={trayNo} 
                className={`p-3 cursor-pointer hover:shadow-md transition-all border-2 ${
                  selectedTray === trayNo ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                } bg-green-50/30`}
                onClick={() => {
                  setSelectedTray(trayNo);
                  const trayProductsWithStatus = data.products.map(product => {
                    const isSold = salesData.some(sale => {
                      const saleAttrs = sale.attributes || sale;
                      return saleAttrs.barcode && product.code && saleAttrs.barcode === product.code;
                    });
                    
                    const soldQty = isSold ? 1 : 0;
                    const availableQty = isSold ? 0 : 1;
                    const status = availableQty > 0 ? 'available' as const : 'sold' as const;
                    
                    return { ...product, status, availableQty, soldQty };
                  });
                  setFilteredProducts(trayProductsWithStatus);
                }}
              >
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold text-blue-600">{trayNo}</div>
                  <div className="flex justify-center">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {data.available} items
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Items: {productWeight >= 1000 ? `${(productWeight / 1000).toFixed(1)}kg` : `${productWeight.toFixed(0)}g`}</div>
                    <div>Tray: {trayWeight >= 1000 ? `${(trayWeight / 1000).toFixed(1)}kg` : `${trayWeight.toFixed(0)}g`}</div>
                    <div className="font-medium text-blue-600">Total: {actualWeight >= 1000 ? `${(actualWeight / 1000).toFixed(1)}kg` : `${actualWeight.toFixed(0)}g`}</div>
                  </div>
                  <div className="flex justify-center gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => {
                      e.stopPropagation();
                      setEditingTray(trayData);
                      setNewTrayNo(trayNo);
                      setNewTrayWeight(trayWeight.toString());
                      setShowAddDialog(true);
                    }}><Edit className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTray(trayData);
                    }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        </Card>

        {/* Products Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {selectedTray ? `Products in Tray ${selectedTray}` : 'All Products'}
            </h2>
            <div className="flex items-center gap-4">
              {selectedTray && (
                <Button variant="outline" size="sm" onClick={() => {
                  setSelectedTray(null);
                  filterProducts();
                }}>
                  Show All
                </Button>
              )}
              <div className="text-sm text-gray-500">
                {filteredProducts.length} products
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Loading tray data...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                {selectedTray ? `No products in Tray ${selectedTray}` : 'No products found'}
              </div>
            ) : (
              filteredProducts.map(renderProductCard)
            )}
          </div>
        </Card>
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