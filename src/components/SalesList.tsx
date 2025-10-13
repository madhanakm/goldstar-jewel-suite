import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, DataGrid } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints } from "@/shared";
import { FileText, Printer, LogOut, Calendar, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
import { InvoiceService } from "@/services/invoice";

interface SalesListProps {
  onNavigate?: (module: string) => void;
  onLogout?: () => void;
}

export const SalesList = ({ onNavigate, onLogout }: SalesListProps) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();
  const { goBack } = useNavigation();

  useEffect(() => {
    loadSalesData();
  }, []);

  useEffect(() => {
    filterByDate();
  }, [salesData, selectedDate]);

  const loadSalesData = async () => {
    try {
      const response = await request('/api/sales-masters?pagination[pageSize]=1000');
      const salesMasters = response.data || [];
      
      const enrichedData = await Promise.all(
        salesMasters.map(async (sale: any) => {
          try {
            const [customerRes, salesDetailsRes] = await Promise.all([
              request('/api/customers?pagination[pageSize]=1000').then(res => 
                res.data?.find((c: any) => c.id == sale.cid)
              ),
              request(`/api/sales?filters[invoice_id][$eq]=${sale.invoice}`)
            ]);
            
            return {
              ...sale,
              customer: customerRes || { name: 'Unknown', phone: '', address: '', gstin: '', aadhar: '' },
              salesDetails: salesDetailsRes?.data || []
            };
          } catch (err) {
            return {
              ...sale,
              customer: { name: 'Unknown', phone: '', address: '', gstin: '', aadhar: '' },
              salesDetails: []
            };
          }
        })
      );
      
      // Sort by ID descending (latest first) then by date
      const sortedData = enrichedData.sort((a, b) => {
        // First sort by ID (latest entries have higher IDs)
        const idDiff = (b.id || 0) - (a.id || 0);
        if (idDiff !== 0) return idDiff;
        // Then by date as fallback
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setSalesData(sortedData);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    }
  };

  const filterByDate = () => {
    const filtered = salesData.filter(sale => {
      const saleDate = new Date(sale.date).toISOString().split('T')[0];
      return saleDate === selectedDate;
    });
    setFilteredData([...filtered]);
  };

  const handleEdit = (sale: any) => {
    // Ensure salesDetails are included in the edit data
    const editData = {
      ...sale,
      salesDetails: sale.salesDetails || []
    };
    sessionStorage.setItem('editSale', JSON.stringify(editData));
    onNavigate?.('Sales Entry');
  };

  const handleDelete = async (sale: any) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    
    try {
      // Delete sales details first
      for (const detail of sale.salesDetails) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/${detail.documentId || detail.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to delete detail ${detail.id}`);
      }
      
      // Then delete sales master
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales-masters/${sale.documentId || sale.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Failed to delete master ${sale.id}`);
      
      toast({
        title: "✅ Success",
        description: "Sale deleted successfully",
      });
      loadSalesData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    }
  };

  const handlePrintPDF = (sale: any) => {
    const invoice = {
      id: sale.id,
      invoiceNumber: sale.invoice,
      customer: sale.customer,
      date: sale.date,
      items: sale.salesDetails.map((detail: any) => {
        // Calculate wastage percentage from stored amount and price
        const itemPrice = parseFloat(detail.weight) * parseFloat(sale.currentSilverRate || 0);
        const totalWastageAmount = parseFloat(sale.wastage) || 0;
        const wastagePercent = itemPrice > 0 ? (totalWastageAmount / (itemPrice * sale.salesDetails.length)) * 100 : 0;
        
        // Hide weight for products with zero weight (fixed price products)
        const weight = parseFloat(detail.weight) || 0;
        
        return {
          id: detail.id,
          itemName: detail.product || 'Product',
          category: 'Jewelry',
          weight: (weight && weight > 0) ? weight : 0,
          purity: detail.touch || '',
          rate: 0,
          makingCharges: wastagePercent,
          quantity: parseFloat(detail.qty) || 1,
          discountPercent: parseFloat(detail.discount_percentage) || 0,
          discountAmount: parseFloat(detail.discount_amount) || 0,
          total: parseFloat(detail.amount) || 0
        };
      }),
      subtotal: sale.salesDetails.reduce((sum: number, detail: any) => sum + (parseFloat(detail.amount) || 0), 0),
      discount: 0,
      gst: {
        sgst: (parseFloat(sale.totalamount) * parseFloat(sale.taxpercentage || 3)) / 200,
        cgst: (parseFloat(sale.totalamount) * parseFloat(sale.taxpercentage || 3)) / 200,
        total: (parseFloat(sale.totalamount) * parseFloat(sale.taxpercentage || 3)) / 100
      },
      total: parseFloat(sale.totalamount) || 0,
      roundoff: parseFloat(sale.roundoff) || 0,
      paymentMethod: sale.modeofpayment || 'Cash',
      status: 'paid' as const,
      createdAt: sale.date,
      updatedAt: sale.date,
      silverRate: parseFloat(sale.currentSilverRate) || 0
    };
    
    InvoiceService.printInvoice(invoice);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Sales List"
        onBack={goBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Sales List" }
        ]}
        icon={<FileText className="w-6 h-6 text-primary mr-3" />}
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
              Showing {filteredData.length} sales for {new Date(selectedDate).toLocaleDateString()}
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Entries</CardTitle>
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
                { key: 'invoice', header: 'Invoice No.' },
                { 
                  key: 'customer', 
                  header: 'Customer',
                  render: (value) => value?.name || 'Unknown'
                },
                {
                  key: 'totalamount',
                  header: 'Amount',
                  render: (value) => `₹${Math.round(parseFloat(value)).toLocaleString()}`
                },
                { key: 'modeofpayment', header: 'Payment' },
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
                    </div>
                  )
                }
              ]}
              emptyMessage="No sales entries found"
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