import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, FormField, FormSection, DataGrid, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { TrendingUp, LogOut, Edit, Save, X, Plus, DollarSign, Calendar, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rate {
  id: number;
  price: string;
  updatedAt: string;
}

interface RateManagementProps extends PageProps {
  onLogout?: () => void;
}

export const RateManagement = ({ onNavigate, onLogout }: RateManagementProps) => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRate, setEditRate] = useState("");
  const [newRate, setNewRate] = useState({ price: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  // Filter rates by date
  const filteredRates = rates.filter(rate => {
    if (!dateFrom && !dateTo) return true;
    const rateDate = new Date(rate.updatedAt).toISOString().split('T')[0];
    if (dateFrom && dateTo) {
      return rateDate >= dateFrom && rateDate <= dateTo;
    }
    if (dateFrom) return rateDate >= dateFrom;
    if (dateTo) return rateDate <= dateTo;
    return true;
  });

  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const paginatedRates = filteredRates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    totalRates: filteredRates.length,
    currentRate: rates.length > 0 ? rates[0].price : '0',
    lastUpdated: rates.length > 0 ? rates[0].updatedAt : new Date().toISOString()
  };

  useEffect(() => {
    loadRates();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo]);



  const loadRates = async () => {
    try {
      console.log('Loading rates from:', endpoints.rates.list());
      const response = await request(endpoints.rates.list());
      console.log('Load rates response:', response);
      
      const ratesData = response.data || [];
      console.log('Raw rates data:', ratesData);
      
      // Handle Strapi v5 structure - use documentId for API calls
      const formattedRates = ratesData.map((rate: any) => {
        console.log('Processing rate:', rate);
        return {
          id: rate.documentId || rate.id, // Use documentId for API operations
          price: rate.attributes?.price || rate.price,
          updatedAt: rate.attributes?.updatedAt || rate.updatedAt || new Date().toISOString()
        };
      });
      console.log('Formatted rates:', formattedRates);
      
      // Sort by updatedAt descending (latest first)
      const sortedRates = formattedRates.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setRates(sortedRates);
      setTotalCount(sortedRates.length);
    } catch (error) {
      console.error('Load rates error:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load rates",
        variant: "destructive",
      });
    }
  };

  const handleSaveRate = async (id: number) => {
    try {
      console.log('Updating rate with documentId:', { id, editRate });
      
      const response = await fetch(`https://jewelapi.sricashway.com/api/rates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            price: editRate
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Direct fetch update error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Update response:', response);
      
      setEditingId(null);
      setEditRate("");
      await loadRates();
      
      toast({
        title: "✅ Success",
        description: "Rate updated successfully",
      });
    } catch (error) {
      console.error('Update error details:', error);
      console.error('Error response:', error.response);
      toast({
        title: "❌ Error",
        description: "Failed to update rate",
        variant: "destructive",
      });
    }
  };

  const handleAddRate = async () => {
    if (!newRate.price) {
      toast({
        title: "⚠️ Warning",
        description: "Please enter price",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adding rate:', { newRate, endpoint: endpoints.rates.create() });
      
      const response = await fetch('https://jewelapi.sricashway.com/api/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            price: newRate.price
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Direct fetch error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Add response:', response);
      
      setNewRate({ price: "" });
      await loadRates();
      
      toast({
        title: "✅ Success",
        description: "Silver rate added successfully",
      });
    } catch (error) {
      console.error('Add error details:', error);
      console.error('Error response:', error.response);
      toast({
        title: "❌ Error",
        description: "Failed to add silver rate",
        variant: "destructive",
      });
    }
  };

  const startEdit = (rate: Rate) => {
    setEditingId(rate.id);
    setEditRate(rate.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRate("");
  };

  return (
    <PageLayout>
      <PageHeader
        title="Rate Management"
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Rate Management" }
        ]}
        icon={<TrendingUp className="w-6 h-6 text-primary mr-3" />}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GradientCard title="Total Rate Records" icon={<Hash className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.totalRates}</div>
          </GradientCard>
          
          <GradientCard title="Current Silver Rate" icon={<DollarSign className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">₹{stats.currentRate}/g</div>
          </GradientCard>
          
          <GradientCard title="Last Updated" icon={<Calendar className="w-5 h-5 text-white" />}>
            <div className="text-lg font-bold text-purple-600">
              {new Date(stats.lastUpdated).toLocaleDateString()}
            </div>
          </GradientCard>
        </div>

        {/* Add New Rate Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Silver Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Silver Price per Gram (₹)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={newRate.price}
                  onChange={(e) => setNewRate(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter silver price per gram"
                  className="w-full"
                />
              </div>
              <Button onClick={handleAddRate} loading={loading} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Rate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Date Filters */}
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
              <Button 
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setCurrentPage(1);
                }} 
                variant="outline"
                className="px-3"
              >
                Clear
              </Button>
              <div className="text-sm text-gray-600 ml-auto">
                Showing {paginatedRates.length} of {filteredRates.length} rates
              </div>
            </div>
          </div>
        </Card>

        {/* Rates Table */}
        <Card className="bg-white border shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Silver Rate History
                </h3>
                <p className="text-sm text-gray-500 mt-1">View and manage silver rate records</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Pagination Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Entries per page</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-32">
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
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Gram</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedRates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          {loading ? 'Loading...' : 'No silver rates found'}
                        </td>
                      </tr>
                    ) : (
                      paginatedRates.map((rate, index) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editingId === rate.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editRate}
                                  onChange={(e) => setEditRate(e.target.value)}
                                  className="w-24"
                                />
                                <Button size="sm" onClick={() => handleSaveRate(rate.id)}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-green-600">₹{rate.price}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(rate.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(rate.updatedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {editingId === rate.id ? null : (
                              <Button size="sm" variant="outline" onClick={() => startEdit(rate)}>
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {filteredRates.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRates.length)} of {filteredRates.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  {totalPages > 1 && Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                        disabled={loading}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
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