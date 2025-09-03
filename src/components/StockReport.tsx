import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, GradientCard, DataGrid } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints } from "@/shared";
import { Package, LogOut, Download, Search, AlertTriangle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockReportProps {
  onNavigate?: (module: string) => void;
  onLogout?: () => void;
}

export const StockReport = ({ onNavigate, onLogout }: StockReportProps) => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWeight: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      const [barcodeResponse, salesResponse] = await Promise.all([
        request(endpoints.barcode.listBarcodes()),
        request(endpoints.sales.details.list('all'))
      ]);

      const products = barcodeResponse.data || [];
      const sales = salesResponse.data || [];

      // Calculate available stock
      const stockWithAvailability = products.map((product: any) => {
        const soldQty = sales.reduce((total: number, sale: any) => {
          const saleAttrs = sale.attributes || sale;
          if (saleAttrs.code === product.code) {
            return total + (parseFloat(saleAttrs.qty) || 0);
          }
          return total;
        }, 0);

        const availableQty = (parseFloat(product.qty) || 0) - soldQty;
        const status = availableQty <= 0 ? 'out_of_stock' : availableQty <= 2 ? 'low_stock' : 'in_stock';

        return {
          ...product,
          availableQty,
          soldQty,
          status
        };
      });

      setStockData(stockWithAvailability);
      calculateStats(stockWithAvailability);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load stock data",
        variant: "destructive",
      });
    }
  };

  const calculateStats = (data: any[]) => {
    const totalProducts = data.reduce((sum, item) => {
      const availableQty = parseFloat(item.availableQty) || 0;
      return sum + (availableQty > 0 ? availableQty : 0);
    }, 0);
    const totalWeight = data.reduce((sum, item) => {
      const weight = parseFloat(item.weight) || 0;
      const availableQty = parseFloat(item.availableQty) || 0;
      return sum + (availableQty > 0 ? weight * availableQty : 0);
    }, 0);
    const lowStock = data.filter(item => item.status === 'low_stock').length;
    const outOfStock = data.filter(item => item.status === 'out_of_stock').length;

    setStats({
      totalProducts,
      totalWeight,
      lowStock,
      outOfStock
    });
  };

  const filteredData = stockData.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.includes(searchTerm) ||
    item.trayno?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportReport = () => {
    const csvContent = [
      ['Product', 'Code', 'Touch', 'Weight', 'Available Qty', 'Sold Qty', 'Tray', 'Status'],
      ...filteredData.map(item => [
        item.product,
        item.code,
        item.touch,
        item.weight,
        item.availableQty,
        item.soldQty,
        item.trayno || '',
        item.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <PageLayout>
      <PageHeader
        title="Stock Report"
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Stock Report" }
        ]}
        icon={<Package className="w-6 h-6 text-primary mr-3" />}
        actions={
          onLogout && (
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )
        }
      />
      
      <PageContent>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GradientCard title="Total Stock" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.totalProducts}</div>
          </GradientCard>
          
          <GradientCard title="Total Weight" icon={<TrendingUp className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">{stats.totalWeight >= 1000 ? `${(stats.totalWeight / 1000).toFixed(2)}kg` : `${stats.totalWeight.toFixed(1)}g`}</div>
          </GradientCard>
          
          <GradientCard title="Low Stock" icon={<AlertTriangle className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-yellow-600">{stats.lowStock}</div>
          </GradientCard>
          
          <GradientCard title="Out of Stock" icon={<AlertTriangle className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-red-600">{stats.outOfStock}</div>
          </GradientCard>
        </div>

        {/* Search and Export */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product, code, or tray..."
              className="flex-1"
            />
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Stock Data */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={filteredData}
              columns={[
                { key: 'product', header: 'Product' },
                { key: 'code', header: 'Code' },
                { key: 'touch', header: 'Touch' },
                {
                  key: 'weight',
                  header: 'Weight',
                  render: (value) => {
                    const weight = parseFloat(value) || 0;
                    return weight >= 1000 ? `${(weight / 1000).toFixed(2)}kg` : `${weight.toFixed(1)}g`;
                  }
                },
                {
                  key: 'availableQty',
                  header: 'Qty',
                  render: (value) => (
                    <span className={value <= 0 ? 'text-red-600' : value <= 2 ? 'text-yellow-600' : 'text-green-600'}>
                      {value}
                    </span>
                  )
                },
                {
                  key: 'totalWeight',
                  header: 'Total Weight',
                  render: (value, row) => {
                    const weight = parseFloat(row.weight) || 0;
                    const qty = parseFloat(row.availableQty) || 0;
                    const totalWeight = weight * qty;
                    return totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(2)}kg` : `${totalWeight.toFixed(1)}g`;
                  }
                },
                { key: 'soldQty', header: 'Sold' },
                { key: 'trayno', header: 'Tray' },
                {
                  key: 'status',
                  header: 'Status',
                  render: (value) => (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      value === 'out_of_stock' ? 'bg-red-100 text-red-700' :
                      value === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {value.replace('_', ' ').toUpperCase()}
                    </span>
                  )
                }
              ]}
              emptyMessage="No stock data found"
            />
            
            {/* Summary Totals */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-600">
                  Total Items: <span className="text-blue-600 font-bold">{filteredData.reduce((sum, item) => {
                    const availableQty = parseFloat(item.availableQty) || 0;
                    return sum + (availableQty > 0 ? availableQty : 0);
                  }, 0)}</span>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Total Weight: <span className="text-green-600 font-bold">{(() => {
                    const totalWeight = filteredData.reduce((sum, item) => {
                      const weight = parseFloat(item.weight) || 0;
                      const availableQty = parseFloat(item.availableQty) || 0;
                      return sum + (availableQty > 0 ? weight * availableQty : 0);
                    }, 0);
                    return totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(2)}kg` : `${totalWeight.toFixed(1)}g`;
                  })()}</span>
                </div>
              </div>
            </div>
          </CardContent>
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