import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, GradientCard, DataGrid } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints } from "@/shared";
import { TrendingUp, LogOut, Download, Calendar, DollarSign, ShoppingCart, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SalesReportProps {
  onNavigate?: (module: string) => void;
  onLogout?: () => void;
}

export const SalesReport = ({ onNavigate, onLogout }: SalesReportProps) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalCustomers: 0,
    avgOrderValue: 0
  });
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const response = await request(endpoints.sales.masters.list());
      console.log('Sales Masters:', response);
      const salesMasters = response.data || response || [];
      
      // Fetch customer and product details for each sale
      const enrichedData = await Promise.all(
        salesMasters.map(async (sale: any) => {
          try {
            const [customerRes, salesDetailsRes] = await Promise.all([
              request(endpoints.customers.list()).then(res => 
                res.data?.find((c: any) => c.id == sale.cid)
              ),
              request(endpoints.sales.details.list(sale.invoice))
            ]);
            
            console.log('Customer:', customerRes, 'Sales Details:', salesDetailsRes);
            
            return {
              ...sale,
              customerName: customerRes?.name || customerRes?.customername || 'Unknown',
              salesDetails: salesDetailsRes?.data || []
            };
          } catch (err) {
            console.error('Error fetching details:', err);
            return {
              ...sale,
              customerName: 'Unknown',
              salesDetails: []
            };
          }
        })
      );
      
      setSalesData(enrichedData);
      setFilteredData(enrichedData);
      calculateStats(enrichedData);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    }
  };

  const calculateStats = (data: any[]) => {
    const totalSales = data.length;
    const totalAmount = data.reduce((sum, sale) => sum + (parseFloat(sale.totalamount) || 0), 0);
    const uniqueCustomers = new Set(data.map(sale => sale.cid)).size;
    const avgOrderValue = totalSales > 0 ? totalAmount / totalSales : 0;

    setStats({
      totalSales,
      totalAmount,
      totalCustomers: uniqueCustomers,
      avgOrderValue
    });
  };

  const filterByDate = () => {
    console.log('Filter clicked:', { dateFrom, dateTo, salesData });
    if (!dateFrom || !dateTo) {
      setFilteredData(salesData);
      calculateStats(salesData);
      return;
    }
    
    const filtered = salesData.filter(sale => {
      const saleDate = sale.date.split('T')[0];
      console.log('Comparing:', saleDate, 'between', dateFrom, 'and', dateTo);
      return saleDate >= dateFrom && saleDate <= dateTo;
    });
    console.log('Filtered result:', filtered);
    setFilteredData(filtered);
    calculateStats(filtered);
  };

  const exportReport = () => {
    const csvContent = [
      ['Date', 'Customer', 'Phone', 'Amount', 'Items'],
      ...salesData.map(sale => [
        new Date(sale.createdAt).toLocaleDateString(),
        sale.customer_name,
        sale.customer_phone,
        sale.total_amount,
        sale.items_count || 1
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
        icon={<TrendingUp className="w-6 h-6 text-primary mr-3" />}
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
          <GradientCard title="Total Sales" icon={<ShoppingCart className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.totalSales}</div>
          </GradientCard>
          
          <GradientCard title="Total Revenue" icon={<DollarSign className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">₹{stats.totalAmount.toLocaleString()}</div>
          </GradientCard>
          
          <GradientCard title="Customers" icon={<Users className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-purple-600">{stats.totalCustomers}</div>
          </GradientCard>
          
          <GradientCard title="Avg Order Value" icon={<TrendingUp className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-orange-600">₹{stats.avgOrderValue.toFixed(0)}</div>
          </GradientCard>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
            />
            <Button onClick={filterByDate}>Filter</Button>
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Sales Data */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={filteredData}
              columns={[
                {
                  key: 'date',
                  header: 'Date',
                  render: (value) => new Date(value).toLocaleDateString()
                },
                { key: 'invoice', header: 'Invoice' },
                { key: 'customerName', header: 'Customer' },
                {
                  key: 'salesDetails',
                  header: 'Products',
                  render: (value) => value?.map((p: any) => p.productname || p.name || p.product).join(', ') || 'N/A'
                },
                { key: 'totalqty', header: 'Quantity' },
                {
                  key: 'salesDetails',
                  header: 'Weight',
                  render: (value) => {
                    const totalWeight = value?.reduce((sum: number, item: any) => 
                      sum + (parseFloat(item.weight || item.grossweight || 0)), 0
                    ) || 0;
                    return totalWeight > 0 ? `${totalWeight}g` : 'N/A';
                  }
                },
                {
                  key: 'salesDetails',
                  header: 'Touch',
                  render: (value) => {
                    const touches = value?.map((item: any) => item.touch || item.purity).filter(Boolean) || [];
                    return touches.length > 0 ? touches.join(', ') : 'N/A';
                  }
                },
                {
                  key: 'totalamount',
                  header: 'Amount',
                  render: (value) => `₹${parseFloat(value).toLocaleString()}`
                },
                { key: 'modeofpayment', header: 'Payment Mode' }
              ]}
              emptyMessage="No sales data found"
            />
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