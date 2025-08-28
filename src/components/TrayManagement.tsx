import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, GradientCard, FormField } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { Package, LogOut, Search, QrCode, ShoppingCart, Plus } from "lucide-react";
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
  const [showAddDialog, setShowAddDialog] = useState(false);
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
      const response = await request(endpoints.trays.list());
      setAllTrays(response.data || []);
    } catch (error) {
      console.error("Failed to load trays");
    }
  };

  const loadTrayData = async () => {
    try {
      const response = await request(endpoints.barcode.listBarcodes());
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
      const response = await request(endpoints.sales.details.list('all'));
      setSalesData(response.data || []);
    } catch (error) {
      console.error("Failed to load sales data");
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
      await request(endpoints.trays.create(), 'POST', {
        data: { trayno: newTrayNo.trim() }
      });
      
      toast({
        title: "✅ Success",
        description: "Tray added successfully",
      });
      
      setNewTrayNo("");
      setShowAddDialog(false);
      loadAllTrays();
      loadTrayData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add tray",
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

    // Mark products as sold based on exact barcode match in sales data
    filtered = filtered.map(product => {
      const soldQty = salesData.reduce((total, sale) => {
        const saleAttrs = sale.attributes || sale;
        // Match by barcode/code for exact identification
        if (saleAttrs.code === product.code || 
            (saleAttrs.product === product.product && 
             saleAttrs.touch === product.touch && 
             saleAttrs.weight === product.weight)) {
          return total + (parseFloat(saleAttrs.qty) || 0);
        }
        return total;
      }, 0);
      
      const availableQty = (parseFloat(product.qty) || 0) - soldQty;
      const status = availableQty > 0 ? 'available' as const : 'sold' as const;
      
      return { ...product, status, availableQty, soldQty };
    });

    setFilteredProducts(filtered);
  };

  const getTrayStats = () => {
    const trays = [...new Set(filteredProducts.map(p => p.trayno))].filter(Boolean);
    const totalProducts = filteredProducts.reduce((sum, p) => sum + (parseFloat(p.qty) || 0), 0);
    const availableProducts = filteredProducts.filter(p => p.status === 'available').reduce((sum, p) => sum + (parseFloat(p.qty) || 0), 0);
    const soldProducts = filteredProducts.filter(p => p.status === 'sold').reduce((sum, p) => sum + (parseFloat(p.qty) || 0), 0);
    
    return { trays: trays.length, totalProducts, availableProducts, soldProducts };
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
        const soldQty = salesData.reduce((total, sale) => {
          const saleAttrs = sale.attributes || sale;
          if (saleAttrs.code === product.code || 
              (saleAttrs.product === product.product && 
               saleAttrs.touch === product.touch && 
               saleAttrs.weight === product.weight)) {
            return total + (parseFloat(saleAttrs.qty) || 0);
          }
          return total;
        }, 0);
        
        const productQty = parseFloat(product.qty) || 1;
        const availableQty = productQty - soldQty;
        const productWeight = parseFloat(product.weight) || 0;
        const availableWeight = (availableQty / productQty) * productWeight * productQty;
        
        trayData.total += productQty;
        trayData.productCount++;
        trayData.totalWeight += availableWeight;
        trayData.products.push({ ...product, availableQty, soldQty, status: availableQty > 0 ? 'available' : 'sold' });
        trayData.available += Math.max(0, availableQty);
        trayData.sold += soldQty;
        // Product added to tray successfully
      }
    });
    
    return Array.from(trayMap.entries());
  };

  const stats = getTrayStats();

  const renderProductCard = (product: TrayProduct) => {
    const isSold = product.status === 'sold';
    
    return (
      <Card key={product.id} className={`p-4 border-l-4 ${
        isSold ? 'border-l-red-500 bg-gradient-to-r from-red-50 to-white opacity-75' : 
        'border-l-green-500 bg-gradient-to-r from-green-50 to-white'
      }`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{product.product}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                isSold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {isSold ? 'Sold' : 'Available'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>Touch: {product.touch}</div>
              <div>Weight: {product.weight}g</div>
              <div>Qty: {product.qty}</div>
              <div>Tray: {product.trayno}</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <QrCode className="w-3 h-3" />
              {product.code}
            </div>
          </div>
          <div className="text-right">
            <div className={`p-2 rounded-full ${
              isSold ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            }`}>
              {isSold ? <ShoppingCart className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title="Tray Management"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GradientCard title="Total Trays" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.trays}</div>
          </GradientCard>
          
          <GradientCard title="Total Products" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-purple-600">{stats.totalProducts}</div>
          </GradientCard>
          
          <GradientCard title="Available" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">{stats.availableProducts}</div>
          </GradientCard>
          
          <GradientCard title="Sold" icon={<ShoppingCart className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-red-600">{stats.soldProducts}</div>
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
                  <DialogTitle>Add New Tray</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <FormField label="Tray Number" required>
                    <Input
                      value={newTrayNo}
                      onChange={(e) => setNewTrayNo(e.target.value)}
                      placeholder="Enter tray number (e.g., T001)"
                    />
                  </FormField>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddTray} loading={loading} className="flex-1">
                      Add Tray
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
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

        {/* Tray-wise View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Tray Overview</h2>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {getTrayWiseData().map(([trayNo, data]) => (
                <Card 
                  key={trayNo} 
                  className={`p-3 cursor-pointer hover:shadow-lg transition-all border-2 ${
                    selectedTray === trayNo ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    // Tray selected
                    setSelectedTray(trayNo);
                    const trayProductsWithStatus = data.products.map(product => {
                      const soldQty = salesData.reduce((total, sale) => {
                        const saleAttrs = sale.attributes || sale;
                        if (saleAttrs.code === product.code || 
                            (saleAttrs.product === product.product && 
                             saleAttrs.touch === product.touch && 
                             saleAttrs.weight === product.weight)) {
                          return total + (parseFloat(saleAttrs.qty) || 0);
                        }
                        return total;
                      }, 0);
                      
                      const availableQty = (parseFloat(product.qty) || 0) - soldQty;
                      const status = availableQty > 0 ? 'available' as const : 'sold' as const;
                      
                      return { ...product, status, availableQty, soldQty };
                    });
                    // Products processed for display
                    setFilteredProducts(trayProductsWithStatus);
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{trayNo}</div>
                    <div className="text-sm text-gray-600">{data.productCount} products ({data.total} qty)</div>
                    <div className="text-xs text-gray-500">{data.totalWeight.toFixed(1)}g</div>
                    <div className={`text-xs font-medium mt-1 ${
                      data.total === 0 ? 'text-gray-400' :
                      data.available > data.sold ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.total > 0 ? Math.round((data.available / data.total) * 100) : 0}%
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

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
                  {filteredProducts.length} products found
                </div>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading tray data...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {selectedTray ? `No products in Tray ${selectedTray}` : 'No products found'}
                </div>
              ) : (
                filteredProducts.map(renderProductCard)
              )}
            </div>
          </Card>
        </div>
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