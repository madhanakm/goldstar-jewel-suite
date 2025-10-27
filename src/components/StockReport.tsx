import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints } from "@/shared";
import { Package, LogOut, Download, Search, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";

interface StockReportProps {
  onNavigate?: (module: string) => void;
  onLogout?: () => void;
}

export const StockReport = ({ onNavigate, onLogout }: StockReportProps) => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWeight: 0
  });
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();
  const { goBack } = useNavigation();

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      const barcodeResponse = await request(endpoints.barcode.listBarcodes());
      const products = barcodeResponse.data || [];
      
      // Load all sales data
      const salesMastersResponse = await request(endpoints.sales.masters.list(1, 1000));
      const salesMasters = salesMastersResponse.data || [];
      
      const allSalesDetails = [];
      for (const master of salesMasters) {
        try {
          const detailsResponse = await request(endpoints.sales.details.list(master.invoice));
          allSalesDetails.push(...(detailsResponse.data || []));
        } catch (error) {
          console.error(`Failed to load details for invoice ${master.invoice}`);
        }
      }

      // Filter out sold products - only show available items
      const availableProducts = products.filter((product: any) => {
        const isSold = allSalesDetails.some((sale: any) => {
          const saleAttrs = sale.attributes || sale;
          return saleAttrs.barcode && product.code && saleAttrs.barcode === product.code;
        });
        return !isSold;
      });

      setStockData(availableProducts);
      calculateStats(availableProducts);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load stock data",
        variant: "destructive",
      });
    }
  };

  const calculateStats = (data: any[]) => {
    const totalProducts = data.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
    const totalWeight = data.reduce((sum, item) => {
      const weight = parseFloat(item.weight) || 0;
      const qty = parseFloat(item.qty) || 0;
      return sum + (weight * qty);
    }, 0);

    setStats({
      totalProducts,
      totalWeight
    });
  };

  const filteredData = stockData.filter(item =>
    item.product.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.code.includes(searchFilter) ||
    item.trayno?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, pageSize]);

  const exportReport = () => {
    const csvContent = [
      ['Product', 'Code', 'Touch', 'Weight', 'Available Qty', 'Sold Qty', 'Tray', 'Status'],
      ...filteredData.map(item => [
        item.product,
        item.code,
        item.touch,
        item.weight,
        item.qty,
        item.trayno || '',
        'Available'
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
        onBack={goBack}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <GradientCard title="Available Products" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">{stats.totalProducts}</div>
          </GradientCard>
          
          <GradientCard title="Total Weight" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.totalWeight >= 1000 ? `${(stats.totalWeight / 1000).toFixed(2)}kg` : `${stats.totalWeight.toFixed(1)}g`}</div>
          </GradientCard>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Search</Label>
              <Input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by product, code, or tray..."
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Items per page</Label>
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
            <div className="flex items-end gap-2">
              <Button onClick={loadStockData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Stock Data */}
        <Card>
          <CardHeader>
            <CardTitle>Available Stock Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Touch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tray</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((item, index) => {
                      const weight = parseFloat(item.weight) || 0;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.product}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.code}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.touch || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {weight > 0 ? (weight >= 1000 ? `${(weight / 1000).toFixed(2)}kg` : `${weight.toFixed(1)}g`) : '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{item.qty}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.trayno || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))
                }
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
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