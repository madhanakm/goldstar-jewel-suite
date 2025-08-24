import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, TrendingUp, TrendingDown, Download, Calendar, Users, Package, DollarSign } from "lucide-react";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";

interface AnalyticsReportsProps {
  onBack: () => void;
  onNavigate: (module: string) => void;
}

export const AnalyticsReports = ({ onBack, onNavigate }: AnalyticsReportsProps) => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useSidebar();
  const [selectedPeriod, setSelectedPeriod] = useState("last30");
  const [activeTab, setActiveTab] = useState("overview");

  const salesData = [
    { month: "Oct", sales: 320000, profit: 45000 },
    { month: "Nov", sales: 420000, profit: 62000 },
    { month: "Dec", sales: 520000, profit: 78000 },
    { month: "Jan", sales: 480000, profit: 71000 }
  ];

  const topSellingItems = [
    { item: "22K Gold Chains", quantity: 45, revenue: 234000, growth: "+12%" },
    { item: "Diamond Earrings", quantity: 28, revenue: 189000, growth: "+8%" },
    { item: "Silver Bangles", quantity: 156, revenue: 123000, growth: "+15%" },
    { item: "Gold Rings", quantity: 67, revenue: 145000, growth: "+5%" }
  ];

  const customerAnalytics = [
    { segment: "Premium Customers", count: 245, avgSpend: 25000, totalRevenue: 6125000 },
    { segment: "Regular Customers", count: 1240, avgSpend: 8500, totalRevenue: 10540000 },
    { segment: "New Customers", count: 456, avgSpend: 4200, totalRevenue: 1915200 },
    { segment: "Inactive Customers", count: 678, avgSpend: 0, totalRevenue: 0 }
  ];

  const stockReports = [
    { category: "Gold", totalWeight: 245.6, totalValue: 12750000, fastMoving: 15, slowMoving: 3 },
    { category: "Silver", totalWeight: 1240.8, totalValue: 9306000, fastMoving: 25, slowMoving: 8 },
    { category: "Diamond", totalWeight: 45.2, totalValue: 38340000, fastMoving: 8, slowMoving: 12 },
    { category: "Platinum", totalWeight: 89.4, totalValue: 2862080, fastMoving: 5, slowMoving: 7 }
  ];

  return (
    <PageLayout>
      <PageHeader 
        title="Analytics & Reports"
        description="Business insights, trends, and performance analytics"
        onBack={onBack}
        onMenuClick={toggleSidebar}
        actions={
          <div className="flex space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="last90">Last 90 Days</SelectItem>
                <SelectItem value="thisyear">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />
      
      <PageContent>
        <div className="space-y-6">

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹18.6L</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold">296</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">₹6,284</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3.8% from last month
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Growth</p>
                <p className="text-2xl font-bold">+45</p>
                <p className="text-sm text-red-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -2.1% from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Business Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="inventory">Stock Reports</TabsTrigger>
        </TabsList>

        {/* Business Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales Trend</CardTitle>
                <CardDescription>Revenue and profit trends over the last 4 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{data.month} 2024</p>
                        <p className="text-sm text-muted-foreground">Sales: ₹{data.sales.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">₹{data.profit.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Profit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key business performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Profit Margin</span>
                  <span className="font-bold text-green-600">14.8%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Customer Retention</span>
                  <span className="font-bold">78.5%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Inventory Turnover</span>
                  <span className="font-bold">2.3x</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Return Rate</span>
                  <span className="font-bold text-red-600">1.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Best performing products by revenue and quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellingItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>{item.quantity} units</TableCell>
                      <TableCell>₹{item.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">{item.growth}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-muted rounded-full mr-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${(item.revenue / 250000) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((item.revenue / 250000) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Gold</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Silver</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diamond</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Others</span>
                    <span className="font-medium">9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>UPI</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Card</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credit</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>10-12 AM</span>
                    <span className="font-medium">₹45K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>12-2 PM</span>
                    <span className="font-medium">₹82K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2-4 PM</span>
                    <span className="font-medium">₹67K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4-6 PM</span>
                    <span className="font-medium">₹95K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Insights Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation</CardTitle>
              <CardDescription>Customer categories and their contribution to revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Segment</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Avg Spend</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Contribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerAnalytics.map((segment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{segment.segment}</TableCell>
                      <TableCell>{segment.count}</TableCell>
                      <TableCell>₹{segment.avgSpend.toLocaleString()}</TableCell>
                      <TableCell>₹{segment.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-muted rounded-full mr-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${(segment.totalRevenue / 12000000) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((segment.totalRevenue / 18580200) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Referrals</span>
                    <span className="font-medium">38%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Walk-ins</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Social Media</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Online</span>
                    <span className="font-medium">12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purchase Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Festival Season</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Wedding Season</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Regular</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Gifts</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stock Reports Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Summary by Category</CardTitle>
              <CardDescription>Current inventory levels and movement analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Weight (g)</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Fast Moving</TableHead>
                    <TableHead>Slow Moving</TableHead>
                    <TableHead>Turnover Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockReports.map((stock, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stock.category}</TableCell>
                      <TableCell>{stock.totalWeight}</TableCell>
                      <TableCell>₹{stock.totalValue.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">{stock.fastMoving} items</TableCell>
                      <TableCell className="text-red-600">{stock.slowMoving} items</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-muted rounded-full mr-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${(stock.fastMoving / (stock.fastMoving + stock.slowMoving)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((stock.fastMoving / (stock.fastMoving + stock.slowMoving)) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-red-600">
                    <span>Low Stock</span>
                    <span className="font-medium">12 items</span>
                  </div>
                  <div className="flex justify-between items-center text-orange-600">
                    <span>Reorder Level</span>
                    <span className="font-medium">8 items</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Well Stocked</span>
                    <span className="font-medium">245 items</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valuation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Current Market Value</span>
                    <span className="font-medium">₹6.3Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Value</span>
                    <span className="font-medium">₹5.8Cr</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Appreciation</span>
                    <span className="font-medium">+8.6%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Movement Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Fast Moving</span>
                    <span className="font-medium">53 items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium Moving</span>
                    <span className="font-medium">182 items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Moving</span>
                    <span className="font-medium">30 items</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </PageContent>
      
      <SidebarWrapper
        categories={sidebarConfig}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
    </PageLayout>
  );
};