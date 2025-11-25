import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, GradientCard, DataGrid } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, fetchAllPaginated } from "@/shared";
import { Recycle, LogOut, Download, Calendar, DollarSign, Package, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";

interface OldSilverReportProps {
  onNavigate?: (module: string) => void;
  onLogout?: () => void;
}

export const OldSilverReport = ({ onNavigate, onLogout }: OldSilverReportProps) => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Paginate filtered data
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalWeight: 0,
    totalAmount: 0,
    uniqueCustomers: 0
  });
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { request } = useApi();
  const { goBack } = useNavigation();

  useEffect(() => {
    loadReportData();
  }, []);
  
  useEffect(() => {
    if (reportData.length > 0) {
      // Show current date by default, if no entries show all
      const today = new Date().toISOString().split('T')[0];
      const todayFiltered = reportData.filter(entry => {
        const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
        return entryDate === today;
      });
      
      // If no entries for today, show all data
      const dataToShow = todayFiltered.length > 0 ? todayFiltered : reportData;
      setFilteredData(dataToShow);
      calculateStats(dataToShow);
    }
  }, [reportData]);

  const loadReportData = async () => {
    try {
      const response = await fetchAllPaginated(request, endpoints.oldSilver.listAll());
      const entries = response.data || [];
      
      setReportData(entries);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load old silver report data",
        variant: "destructive",
      });
    }
  };

  const calculateStats = (data: any[]) => {
    const totalEntries = data.length;
    const totalWeight = data.reduce((sum, entry) => sum + (parseFloat(entry.totalWeight) || 0), 0);
    const totalAmount = data.reduce((sum, entry) => sum + (parseFloat(entry.totalAmount) || 0), 0);
    const uniqueCustomers = new Set(data.map(entry => entry.customerName)).size;

    setStats({
      totalEntries,
      totalWeight,
      totalAmount,
      uniqueCustomers
    });
  };

  const filterByDate = () => {
    if (!dateFrom || !dateTo) {
      setFilteredData(reportData);
      calculateStats(reportData);
      return;
    }
    
    const filtered = reportData.filter(entry => {
      const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
      return entryDate >= dateFrom && entryDate <= dateTo;
    });
    
    setFilteredData(filtered);
    calculateStats(filtered);
  };

  const exportReport = () => {
    const csvContent = [
      ['Date', 'Customer', 'Sales ID', 'Items', 'Weight (g)', 'Amount (₹)'],
      ...filteredData.map(entry => [
        new Date(entry.createdAt).toLocaleDateString(),
        entry.customerName,
        entry.salesEntryId || '-',
        entry.itemsCount,
        parseFloat(entry.totalWeight || 0).toFixed(2),
        parseFloat(entry.totalAmount || 0).toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `old-silver-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <PageLayout>
      <PageHeader
        title="Old Silver Report"
        onBack={goBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Old Silver Report" }
        ]}
        icon={<Recycle className="w-6 h-6 text-primary mr-3" />}
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
          <GradientCard title="Total Entries" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.totalEntries}</div>
          </GradientCard>
          
          <GradientCard title="Total Weight" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">{stats.totalWeight.toFixed(2)}g</div>
          </GradientCard>
          
          <GradientCard title="Total Amount" icon={<DollarSign className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-purple-600">₹{stats.totalAmount.toLocaleString()}</div>
          </GradientCard>
          
          <GradientCard title="Unique Customers" icon={<Users className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-orange-600">{stats.uniqueCustomers}</div>
          </GradientCard>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Date Range:</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 min-w-[60px]">From:</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 min-w-[60px]">To:</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={filterByDate} className="bg-blue-600 hover:bg-blue-700">
                  Apply Filter
                </Button>
                <Button variant="outline" onClick={exportReport} className="border-green-600 text-green-600 hover:bg-green-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Report Data */}
        <Card>
          <CardHeader>
            <CardTitle>Old Silver Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No old silver data found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((entry, index) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {entry.customerName}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {entry.salesEntryId || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {entry.itemsCount}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {parseFloat(entry.totalWeight || 0).toFixed(2)}g
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-green-600">
                          ₹{parseFloat(entry.totalAmount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex items-center justify-between mt-6">
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
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
            )}
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