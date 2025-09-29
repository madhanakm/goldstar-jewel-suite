import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, DataGrid } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints } from "@/shared";
import { Calculator, Printer, LogOut, Calendar, ShoppingCart, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
import { EstimationService } from "@/services/estimation";

interface EstimationListProps {
  onNavigate?: (module: string) => void;
  onLogout?: () => void;
}

export const EstimationList = ({ onNavigate, onLogout }: EstimationListProps) => {
  const [estimationData, setEstimationData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();
  const { goBack } = useNavigation();

  useEffect(() => {
    loadEstimationData();
  }, []);

  useEffect(() => {
    filterByDate();
  }, [estimationData, selectedDate]);

  const loadEstimationData = async () => {
    try {
      const response = await request('/api/estimation-masters');
      const estimationMasters = response.data || response || [];
      
      const enrichedData = await Promise.all(
        estimationMasters.map(async (estimation: any) => {
          try {
            const [customerRes, estimationDetailsRes] = await Promise.all([
              request(endpoints.customers.list()).then(res => 
                res.data?.find((c: any) => c.id == estimation.cid)
              ),
              request(endpoints.estimation.details.list(estimation.estimation_number))
            ]);
            
            return {
              ...estimation,
              customer: customerRes || { name: 'Unknown', phone: '', address: '', gstin: '', aadhar: '' },
              estimationDetails: estimationDetailsRes?.data || []
            };
          } catch (err) {
            return {
              ...estimation,
              customer: { name: 'Unknown', phone: '', address: '', gstin: '', aadhar: '' },
              estimationDetails: []
            };
          }
        })
      );
      
      // Sort by date descending (latest first)
      const sortedData = enrichedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEstimationData(sortedData);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load estimation data",
        variant: "destructive",
      });
    }
  };

  const filterByDate = () => {
    const filtered = estimationData.filter(estimation => {
      const estimationDate = new Date(estimation.date).toISOString().split('T')[0];
      return estimationDate === selectedDate;
    });
    setFilteredData([...filtered]);
  };

  const handleConvertToSale = (estimation: any) => {
    // Navigate to sales entry page with estimation data
    const estimationData = {
      customer: estimation.customer,
      items: estimation.estimationDetails,
      discountPercent: parseFloat(estimation.discount_percentage) || 0,
      discountAmount: parseFloat(estimation.discount_amount) || 0,
      silverRate: parseFloat(estimation.current_silver_rate) || 0,
      wastage: parseFloat(estimation.wastage) || 0,
      estimationId: estimation.documentId || estimation.id,
      estimationNumber: estimation.estimation_number
    };
    
    // Store estimation data in sessionStorage for sales entry page
    sessionStorage.setItem('estimationToConvert', JSON.stringify(estimationData));
    
    // Navigate to sales entry page
    onNavigate?.('Sales Entry');
  };

  const handleEdit = (estimation: any) => {
    // Navigate to estimation entry page with data for editing
    sessionStorage.setItem('editEstimation', JSON.stringify(estimation));
    onNavigate?.('Estimation');
  };

  const handleDelete = async (estimation: any) => {
    if (!confirm('Are you sure you want to delete this estimation?')) return;
    
    try {
      await request(`/api/estimation-masters/${estimation.documentId}`, 'DELETE');
      toast({
        title: "✅ Success",
        description: "Estimation deleted successfully",
      });
      loadEstimationData();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete estimation",
        variant: "destructive",
      });
    }
  };

  const handlePrintPDF = (estimation: any) => {
    const avgWastage = parseFloat(estimation.wastage) || 0;
    
    const estimationData = {
      estimationNumber: estimation.estimation_number,
      customer: {
        name: estimation.customer?.name || 'Unknown',
        phone: estimation.customer?.phone || '',
        address: estimation.customer?.address || ''
      },
      date: estimation.date,
      silverRate: parseFloat(estimation.current_silver_rate) || 0,
      items: estimation.estimationDetails.map((item: any) => ({
        id: item.id,
        itemName: item.product || 'Product',
        purity: item.touch || '',
        quantity: parseFloat(item.qty) || 1,
        weight: parseFloat(item.weight) || 0,
        makingCharges: avgWastage,
        total: parseFloat(item.total) || 0
      })),
      subtotal: parseFloat(estimation.subtotal) || 0,
      discount: parseFloat(estimation.discount_amount) || 0,
      total: parseFloat(estimation.total_amount) || 0
    };
    
    EstimationService.printEstimation(estimationData);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Estimation List"
        onBack={goBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Estimation List" }
        ]}
        icon={<Calculator className="w-6 h-6 text-primary mr-3" />}
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
        {/* Date Filter */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
            <span className="text-sm text-gray-600">
              Showing {filteredData.length} estimations for {new Date(selectedDate).toLocaleDateString()}
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimation Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              key={`${selectedDate}-${filteredData.length}`}
              data={filteredData}
              columns={[
                {
                  key: 'date',
                  header: 'Date',
                  render: (value) => new Date(value).toLocaleDateString()
                },
                { key: 'estimation_number', header: 'Estimation No.' },
                { 
                  key: 'customer', 
                  header: 'Customer',
                  render: (value) => value?.name || 'Unknown'
                },
                {
                  key: 'total_amount',
                  header: 'Amount',
                  render: (value) => `₹${parseFloat(value || 0).toLocaleString()}`
                },
                {
                  key: 'discount_amount',
                  header: 'Discount',
                  render: (value) => `₹${parseFloat(value || 0).toLocaleString()}`
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (_, row) => (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(row)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintPDF(row)}
                      >
                        <Printer className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={row.converted_to_sale ? "secondary" : "default"}
                        onClick={() => handleConvertToSale(row)}
                        disabled={row.converted_to_sale}
                      >
                        <ShoppingCart className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                }
              ]}
              emptyMessage="No estimation entries found"
              loading={loading}
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