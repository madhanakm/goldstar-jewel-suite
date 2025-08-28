import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, GradientCard, DataGrid } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints } from "@/shared";
import { ShoppingBag, LogOut, Download, Calendar, DollarSign, Package, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PurchaseReportProps {
  onNavigate?: (module: string) => void;
  onLogout?: () => void;
}

export const PurchaseReport = ({ onNavigate, onLogout }: PurchaseReportProps) => {
  const [purchaseData, setPurchaseData] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalAmount: 0,
    totalWeight: 0,
    avgPurchaseValue: 0
  });
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadPurchaseData();
  }, []);

  const loadPurchaseData = async () => {
    try {
      const response = await request(endpoints.barcode.listBarcodes());
      const data = response.data || [];
      setPurchaseData(data);
      calculateStats(data);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load purchase data",
        variant: "destructive",
      });
    }
  };

  const calculateStats = (data: any[]) => {
    const totalPurchases = data.length;
    const totalAmount = data.reduce((sum, purchase) => sum + (parseFloat(purchase.making_charges_or_wastages) || 0), 0);
    const totalWeight = data.reduce((sum, purchase) => sum + (parseFloat(purchase.weight) || 0) * (parseFloat(purchase.qty) || 1), 0);
    const avgPurchaseValue = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

    setStats({
      totalPurchases,
      totalAmount,
      totalWeight,
      avgPurchaseValue
    });
  };

  const filterByDate = () => {
    if (!dateFrom || !dateTo) return;
    
    const filtered = purchaseData.filter(purchase => {
      const purchaseDate = new Date(purchase.createdAt).toISOString().split('T')[0];
      return purchaseDate >= dateFrom && purchaseDate <= dateTo;
    });
    calculateStats(filtered);
  };

  const exportReport = () => {
    const csvContent = [
      ['Date', 'Product', 'Touch', 'Weight', 'Qty', 'Amount', 'Tray', 'Code'],
      ...purchaseData.map(purchase => [
        new Date(purchase.createdAt).toLocaleDateString(),
        purchase.product,
        purchase.touch,
        purchase.weight,
        purchase.qty,
        purchase.making_charges_or_wastages || 0,
        purchase.trayno || '',
        purchase.code
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <PageLayout>
      <PageHeader
        title="Purchase Report"
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Purchase Report" }
        ]}
        icon={<ShoppingBag className="w-6 h-6 text-primary mr-3" />}
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
          <GradientCard title="Total Purchases" icon={<ShoppingBag className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.totalPurchases}</div>
          </GradientCard>
          
          <GradientCard title="Total Amount" icon={<DollarSign className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">₹{stats.totalAmount.toLocaleString()}</div>
          </GradientCard>
          
          <GradientCard title="Total Weight" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-purple-600">{stats.totalWeight.toFixed(1)}g</div>
          </GradientCard>
          
          <GradientCard title="Avg Purchase Value" icon={<TrendingUp className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-orange-600">₹{stats.avgPurchaseValue.toFixed(0)}</div>
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

        {/* Purchase Data */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={purchaseData}
              columns={[
                {
                  key: 'createdAt',
                  header: 'Date',
                  render: (value) => new Date(value).toLocaleDateString()
                },
                { key: 'product', header: 'Product' },
                { key: 'touch', header: 'Touch' },
                {
                  key: 'weight',
                  header: 'Weight',
                  render: (value) => `${value}g`
                },
                { key: 'qty', header: 'Qty' },
                {
                  key: 'making_charges_or_wastages',
                  header: 'Amount',
                  render: (value) => `₹${parseFloat(value || 0).toLocaleString()}`
                },
                { key: 'trayno', header: 'Tray' },
                { key: 'code', header: 'Code' }
              ]}
              emptyMessage="No purchase data found"
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