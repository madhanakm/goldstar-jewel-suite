import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps, formatCurrency, formatDate } from "@/shared";
import { BarChart3, LogOut, Calendar, IndianRupee, Package, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SalesMaster {
  id: number;
  cid: string;
  date: string;
  invoice: string;
  totalamount: string;
  totalqty: string;
  wastage: string;
  taxpercentage: string;
  modeofpayment: string;
}

interface SalesReportProps extends PageProps {
  onLogout?: () => void;
}

export const SalesReport = ({ onNavigate, onLogout }: SalesReportProps) => {
  const [salesData, setSalesData] = useState<SalesMaster[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalItems: 0,
    avgSale: 0
  });
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const response = await request(endpoints.sales.masters.list(1, 100));
      const sales = response.data || [];
      setSalesData(sales);
      
      // Calculate stats
      const totalAmount = sales.reduce((sum: number, sale: any) => 
        sum + parseFloat(sale.attributes?.totalamount || sale.totalamount || 0), 0
      );
      const totalItems = sales.reduce((sum: number, sale: any) => 
        sum + parseFloat(sale.attributes?.totalqty || sale.totalqty || 0), 0
      );
      
      setStats({
        totalSales: sales.length,
        totalAmount,
        totalItems,
        avgSale: sales.length > 0 ? totalAmount / sales.length : 0
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    }
  };

  const renderSaleCard = (sale: any) => {
    const attrs = sale.attributes || sale;
    const amount = parseFloat(attrs.totalamount || 0);
    const isHighValue = amount > 10000;
    
    return (
      <Card key={sale.id} className={`p-4 border-l-4 ${
        isHighValue ? 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-white' : 
        'border-l-green-500 bg-gradient-to-r from-green-50 to-white'
      }`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">#{attrs.invoice}</span>
              {isHighValue && (
                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                  High Value
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(attrs.date)}
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {attrs.totalqty} items
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Customer: {attrs.cid}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Payment: {attrs.modeofpayment} | Tax: {attrs.taxpercentage}%
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              isHighValue ? 'text-amber-600' : 'text-green-600'
            }`}>
              {formatCurrency(attrs.totalamount)}
            </div>
            {attrs.wastage && (
              <div className="text-xs text-gray-500">
                Wastage: ₹{attrs.wastage}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title="Sales Report"
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Sales Report" }
        ]}
        icon={<BarChart3 className="w-6 h-6 text-primary mr-3" />}
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
          <GradientCard title="Total Sales" icon={<BarChart3 className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.totalSales}</div>
          </GradientCard>
          
          <GradientCard title="Total Amount" icon={<IndianRupee className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.totalAmount)}
            </div>
          </GradientCard>
          
          <GradientCard title="Total Items" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-purple-600">{stats.totalItems}</div>
          </GradientCard>
          
          <GradientCard title="Average Sale" icon={<BarChart3 className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(stats.avgSale)}
            </div>
          </GradientCard>
        </div>

        {/* Sales List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Sales</h2>
            <div className="text-sm text-gray-500">
              {salesData.length} total sales
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Loading sales data...</p>
              </div>
            ) : salesData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sales data found
              </div>
            ) : (
              salesData.map(renderSaleCard)
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