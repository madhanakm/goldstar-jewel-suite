import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, fetchAllPaginated, PageProps } from "@/shared";
import { FileText, Package, Calendar, Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrayStock {
  trayNo: string;
  openingQty: number;
  openingWeight: number;
  currentQty: number;
  currentWeight: number;
  soldQty: number;
  soldWeight: number;
}

interface TrayReportProps extends PageProps {}

export const TrayReport = ({ onNavigate }: TrayReportProps) => {
  const [trayStocks, setTrayStocks] = useState<TrayStock[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { request } = useApi();

  useEffect(() => {
    loadTrayReport();
  }, [selectedDate]);

  const loadTrayReport = async () => {
    setLoading(true);
    try {
      // Load all trays
      const traysResponse = await fetchAllPaginated(request, endpoints.trays.listAll());
      const allTrays = traysResponse.data || [];

      // Load all products
      const productsResponse = await fetchAllPaginated(request, endpoints.barcode.listBarcodes());
      const allProducts = productsResponse.data || [];

      // Load sales data for selected date only
      const salesMastersResponse = await fetchAllPaginated(request, endpoints.sales.masters.listAll());
      const salesMasters = salesMastersResponse.data || [];
      
      // Filter sales masters by selected date
      const selectedDateSales = salesMasters.filter(master => {
        const masterAttrs = master.attributes || master;
        const saleDate = new Date(masterAttrs.date).toISOString().split('T')[0];
        return saleDate === selectedDate;
      });
      
      const allSalesDetails = [];
      for (const master of selectedDateSales) {
        try {
          const masterAttrs = master.attributes || master;
          const detailsResponse = await request(endpoints.sales.details.list(masterAttrs.invoice));
          const details = detailsResponse.data || [];
          allSalesDetails.push(...details);
        } catch (error) {
          console.error(`Failed to load details for invoice ${masterAttrs.invoice}`);
        }
      }

      const trayStockData: TrayStock[] = [];

      for (const tray of allTrays) {
        const trayNo = tray.attributes?.trayno || tray.trayno;
        if (!trayNo) continue;
        
        // Only show trays that existed on or before the selected date
        const trayCreatedDate = new Date(tray.createdAt || tray.attributes?.createdAt).toISOString().split('T')[0];
        if (trayCreatedDate > selectedDate) continue;

        // Get products in this tray
        const trayProducts = allProducts.filter(p => p.trayno === trayNo);
        
        // Calculate opening stock (all products in tray)
        const openingQty = trayProducts.reduce((sum, p) => sum + (parseFloat(p.qty) || 0), 0);
        const openingWeight = trayProducts.reduce((sum, p) => sum + (parseFloat(p.weight) || 0) * (parseFloat(p.qty) || 0), 0);

        // Calculate sold items using same logic as tray management
        let soldQty = 0;
        let soldWeight = 0;

        console.log(`Processing tray ${trayNo} with ${trayProducts.length} products`);
        console.log('Sales details for date:', allSalesDetails.length, 'on date:', selectedDate);

        // Track sold products to avoid double counting
        const soldProductIds = new Set();
        
        for (const product of trayProducts) {
          console.log(`Checking tray product: ${product.product}, weight: ${product.weight}, touch: '${product.touch}', qty: ${product.qty}`);
          
          // Check if this specific product (by ID) was sold
          const wasSold = allSalesDetails.some(sale => {
            const saleAttrs = sale.attributes || sale;
            
            console.log(`  Comparing with sale: ${saleAttrs.product}, weight: ${saleAttrs.weight}, touch: '${saleAttrs.touch}'`);
            
            // Match by product name and handle static products (weight = 0)
            const productWeight = parseFloat(product.weight || 0);
            const saleWeight = parseFloat(saleAttrs.weight || 0);
            const productTouch = (product.touch || '').trim();
            const saleTouch = (saleAttrs.touch || '').trim();
            
            // For static products (sale weight = 0), only match by name and touch
            const isMatch = saleAttrs.product === product.product &&
                           (saleWeight === 0 ? productTouch === saleTouch : 
                            productWeight === saleWeight && productTouch === saleTouch);
            
            console.log(`  Match result: ${isMatch}`);
            
            if (isMatch && !soldProductIds.has(product.id)) {
              soldProductIds.add(product.id);
              return true;
            }
            return false;
          });
          
          if (wasSold) {
            soldQty += parseFloat(product.qty) || 0;
            soldWeight += (parseFloat(product.weight) || 0) * (parseFloat(product.qty) || 0);
            console.log(`Product ${product.product} (ID: ${product.id}) marked as sold`);
          } else {
            console.log(`Product ${product.product} (ID: ${product.id}) NOT sold`);
          }
        }
        
        console.log(`Tray ${trayNo} - Opening: ${openingQty}, Sold: ${soldQty}, Current: ${openingQty - soldQty}`);

        // Calculate current stock
        const currentQty = openingQty - soldQty;
        const currentWeight = openingWeight - soldWeight;

        trayStockData.push({
          trayNo,
          openingQty,
          openingWeight,
          currentQty: Math.max(0, currentQty),
          currentWeight: Math.max(0, currentWeight),
          soldQty,
          soldWeight
        });
      }

      setTrayStocks(trayStockData);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load tray report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatWeight = (weight: number) => {
    return weight >= 1000 ? `${(weight / 1000).toFixed(2)}kg` : `${weight.toFixed(1)}g`;
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Tray Stock Report - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { background-color: #e3f2fd; font-weight: bold; }
            .red { color: #dc2626; }
            .green { color: #16a34a; }
          </style>
        </head>
        <body>
          <h1>Tray Stock Report - ${selectedDate}</h1>
          <table>
            <thead>
              <tr>
                <th>Tray No</th>
                <th>Opening Qty</th>
                <th>Opening Weight</th>
                <th>Sold Qty</th>
                <th>Sold Weight</th>
                <th>Current Qty</th>
                <th>Current Weight</th>
              </tr>
            </thead>
            <tbody>
              ${trayStocks.map(tray => `
                <tr>
                  <td>${tray.trayNo}</td>
                  <td>${tray.openingQty}</td>
                  <td>${formatWeight(tray.openingWeight)}</td>
                  <td class="red">${tray.soldQty}</td>
                  <td class="red">${formatWeight(tray.soldWeight)}</td>
                  <td class="green">${tray.currentQty}</td>
                  <td class="green">${formatWeight(tray.currentWeight)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>TOTAL</td>
                <td>${totals.openingQty}</td>
                <td>${formatWeight(totals.openingWeight)}</td>
                <td class="red">${totals.soldQty}</td>
                <td class="red">${formatWeight(totals.soldWeight)}</td>
                <td class="green">${totals.currentQty}</td>
                <td class="green">${formatWeight(totals.currentWeight)}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const totals = trayStocks.reduce((acc, tray) => ({
    openingQty: acc.openingQty + tray.openingQty,
    openingWeight: acc.openingWeight + tray.openingWeight,
    currentQty: acc.currentQty + tray.currentQty,
    currentWeight: acc.currentWeight + tray.currentWeight,
    soldQty: acc.soldQty + tray.soldQty,
    soldWeight: acc.soldWeight + tray.soldWeight
  }), { openingQty: 0, openingWeight: 0, currentQty: 0, currentWeight: 0, soldQty: 0, soldWeight: 0 });

  return (
    <PageLayout>
      <PageHeader
        title="Tray Stock Report"
        onBack={() => onNavigate?.("Dashboard")}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Tray Stock Report" }
        ]}
        icon={<FileText className="w-6 h-6 text-primary mr-3" />}
        actions={
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        }
      />
      
      <PageContent>
        {/* Date Selection */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
            <Button onClick={loadTrayReport} loading={loading}>
              Generate Report
            </Button>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GradientCard title="Opening Stock" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-2xl font-bold text-blue-600">{totals.openingQty} qty</div>
            <div className="text-sm text-gray-600">{formatWeight(totals.openingWeight)}</div>
          </GradientCard>
          
          <GradientCard title="Current Stock" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-2xl font-bold text-green-600">{totals.currentQty} qty</div>
            <div className="text-sm text-gray-600">{formatWeight(totals.currentWeight)}</div>
          </GradientCard>
          
          <GradientCard title="Sold Today" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-2xl font-bold text-red-600">{totals.soldQty} qty</div>
            <div className="text-sm text-gray-600">{formatWeight(totals.soldWeight)}</div>
          </GradientCard>
        </div>

        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tray-wise Stock Report - {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">Tray No</th>
                    <th className="text-center p-3 font-semibold">Opening Qty</th>
                    <th className="text-center p-3 font-semibold">Opening Weight</th>
                    <th className="text-center p-3 font-semibold">Sold Qty</th>
                    <th className="text-center p-3 font-semibold">Sold Weight</th>
                    <th className="text-center p-3 font-semibold">Current Qty</th>
                    <th className="text-center p-3 font-semibold">Current Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2">Loading report...</p>
                      </td>
                    </tr>
                  ) : trayStocks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No tray data found for selected date
                      </td>
                    </tr>
                  ) : (
                    trayStocks.map((tray, index) => (
                      <tr key={tray.trayNo} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="p-3 font-medium">{tray.trayNo}</td>
                        <td className="p-3 text-center">{tray.openingQty}</td>
                        <td className="p-3 text-center">{formatWeight(tray.openingWeight)}</td>
                        <td className="p-3 text-center text-red-600">{tray.soldQty}</td>
                        <td className="p-3 text-center text-red-600">{formatWeight(tray.soldWeight)}</td>
                        <td className="p-3 text-center text-green-600">{tray.currentQty}</td>
                        <td className="p-3 text-center text-green-600">{formatWeight(tray.currentWeight)}</td>
                      </tr>
                    ))
                  )}
                  {/* Totals Row */}
                  {trayStocks.length > 0 && (
                    <tr className="border-t-2 bg-blue-50 font-bold">
                      <td className="p-3">TOTAL</td>
                      <td className="p-3 text-center">{totals.openingQty}</td>
                      <td className="p-3 text-center">{formatWeight(totals.openingWeight)}</td>
                      <td className="p-3 text-center text-red-600">{totals.soldQty}</td>
                      <td className="p-3 text-center text-red-600">{formatWeight(totals.soldWeight)}</td>
                      <td className="p-3 text-center text-green-600">{totals.currentQty}</td>
                      <td className="p-3 text-center text-green-600">{formatWeight(totals.currentWeight)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
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