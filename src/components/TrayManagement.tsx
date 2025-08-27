import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { Package, LogOut, Search, QrCode, ShoppingCart } from "lucide-react";
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
}

interface TrayManagementProps extends PageProps {
  onLogout?: () => void;
}

export const TrayManagement = ({ onNavigate, onLogout }: TrayManagementProps) => {
  const [trayProducts, setTrayProducts] = useState<TrayProduct[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [searchTray, setSearchTray] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<TrayProduct[]>([]);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadTrayData();
    loadSalesData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTray, trayProducts, salesData]);

  const loadTrayData = async () => {
    try {
      const response = await request(endpoints.barcode.list());
      const products = response.data?.map((item: any) => {
        const attrs = item.attributes || item;
        return {
          id: item.id,
          product: attrs.product || '',
          touch: attrs.touch || '',
          weight: attrs.weight || '',
          qty: attrs.qty || '',
          code: attrs.code || '',
          trayno: attrs.trayno || '',
          status: 'available' as const
        };
      }) || [];
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
      const response = await request('/api/sales?pagination[pageSize]=1000');
      setSalesData(response.data || []);
    } catch (error) {
      console.error("Failed to load sales data");
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

    // Mark products as sold based on barcode match in sales data
    filtered = filtered.map(product => {
      const isSold = salesData.some(sale => {
        const saleAttrs = sale.attributes || sale;
        return saleAttrs.product === product.product && 
               saleAttrs.touch === product.touch &&
               saleAttrs.weight === product.weight;
      });
      return { ...product, status: isSold ? 'sold' as const : 'available' as const };
    });

    setFilteredProducts(filtered);
  };

  const getTrayStats = () => {
    const trays = [...new Set(filteredProducts.map(p => p.trayno))].filter(Boolean);
    const totalProducts = filteredProducts.length;
    const availableProducts = filteredProducts.filter(p => p.status === 'available').length;
    const soldProducts = filteredProducts.filter(p => p.status === 'sold').length;
    
    return { trays: trays.length, totalProducts, availableProducts, soldProducts };
  };

  const getTrayWiseData = () => {
    const trayMap = new Map();
    filteredProducts.forEach(product => {
      if (product.trayno) {
        if (!trayMap.has(product.trayno)) {
          trayMap.set(product.trayno, { total: 0, available: 0, sold: 0, products: [] });
        }
        const trayData = trayMap.get(product.trayno);
        trayData.total++;
        trayData.products.push(product);
        if (product.status === 'available') trayData.available++;
        if (product.status === 'sold') trayData.sold++;
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

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={searchTray}
              onChange={(e) => setSearchTray(e.target.value)}
              placeholder="Search by tray number, product name, or barcode..."
              className="flex-1"
            />
          </div>
        </Card>

        {/* Tray-wise View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Tray Overview</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getTrayWiseData().map(([trayNo, data]) => (
                <Card key={trayNo} className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">Tray {trayNo}</h3>
                      <div className="text-sm text-gray-600">
                        {data.total} products | {data.available} available | {data.sold} sold
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        data.available > data.sold ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.round((data.available / data.total) * 100)}% Available
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">All Products</h2>
              <div className="text-sm text-gray-500">
                {filteredProducts.length} products found
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
                  No products found
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