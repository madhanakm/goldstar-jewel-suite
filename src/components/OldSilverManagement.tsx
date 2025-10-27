import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { Recycle, LogOut, Plus, Trash2, Save, Users, Package, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";

interface OldSilverItem {
  customerName: string;
  silverWeight: string;
  lessWeight: string;
  price: string;
  total: string;
}

interface OldSilverManagementProps extends PageProps {
  onLogout?: () => void;
}

export const OldSilverManagement = ({ onNavigate, onLogout }: OldSilverManagementProps) => {
  const [oldSilverEntries, setOldSilverEntries] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchFilter, setSearchFilter] = useState("");

  // Filter and paginate entries
  const filteredEntries = oldSilverEntries.filter(entry => {
    const matchesSearch = !searchFilter || 
      entry.customerName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      entry.salesEntryId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      entry.id?.toString().includes(searchFilter);
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const [newEntry, setNewEntry] = useState<{
    customerName: string;
    salesEntryId: string;
    items: OldSilverItem[];
  }>({
    customerName: "",
    salesEntryId: "",
    items: [{ customerName: "", silverWeight: "", lessWeight: "", price: "", total: "" }]
  });
  
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();
  const { goBack } = useNavigation();

  const stats = {
    totalEntries: oldSilverEntries.length,
    totalWeight: oldSilverEntries.reduce((sum, entry) => sum + (parseFloat(entry.totalWeight) || 0), 0),
    totalValue: oldSilverEntries.reduce((sum, entry) => sum + (parseFloat(entry.totalAmount) || 0), 0)
  };

  useEffect(() => {
    loadOldSilverEntries();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, pageSize]);

  const handleDelete = async (entry: any) => {
    if (!confirm('Are you sure you want to delete this old silver entry?')) return;
    
    try {
      const deleteId = entry.documentId;
      console.log('Deleting entry with documentId:', deleteId);
      
      const response = await fetch(`https://jewelapi.sricashway.com/api/old-silver-entries/${deleteId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        throw new Error('Failed to delete entry');
      }
      
      toast({
        title: "✅ Success",
        description: "Old silver entry deleted successfully",
      });
      
      loadOldSilverEntries();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete old silver entry",
        variant: "destructive",
      });
    }
  };



  const loadOldSilverEntries = async () => {
    try {
      const response = await fetch('https://jewelapi.sricashway.com/api/old-silver-entries?sort=createdAt:desc');
      const data = await response.json();
      console.log('Loaded entries:', data.data);
      if (data.data && data.data.length > 0) {
        console.log('First entry structure:', data.data[0]);
      }
      setOldSilverEntries(data.data || []);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load old silver entries",
        variant: "destructive",
      });
    }
  };

  const addItemRow = () => {
    setNewEntry(prev => ({
      ...prev,
      items: [...prev.items, { customerName: "", silverWeight: "", lessWeight: "", price: "", total: "" }]
    }));
  };

  const removeItemRow = (index: number) => {
    setNewEntry(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof OldSilverItem, value: string) => {
    setNewEntry(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-calculate total when weight changes
          if (field === 'silverWeight' || field === 'lessWeight') {
            const silverWeight = parseFloat(updatedItem.silverWeight) || 0;
            const lessWeight = parseFloat(updatedItem.lessWeight) || 0;
            const netWeight = silverWeight - lessWeight;
            updatedItem.total = netWeight.toFixed(2);
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleSubmit = async () => {
    if (!newEntry.customerName.trim()) {
      toast({
        title: "❌ Validation Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const totalWeight = newEntry.items.reduce((sum, item) => 
        sum + (parseFloat(item.total) || 0), 0
      );
      const totalAmount = newEntry.items.reduce((sum, item) => 
        sum + ((parseFloat(item.total) || 0) * (parseFloat(item.price) || 0)), 0
      );

      // Create master entry
      const masterResponse = await fetch('https://jewelapi.sricashway.com/api/old-silver-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            customerName: newEntry.customerName,
            salesEntryId: newEntry.salesEntryId,
            totalWeight: totalWeight.toString(),
            totalAmount: totalAmount.toString(),
            itemsCount: newEntry.items.length.toString()
          }
        })
      });

      if (!masterResponse.ok) {
        const errorData = await masterResponse.json();
        console.error('Master entry error:', errorData);
        throw new Error(`Failed to create master entry: ${masterResponse.status}`);
      }

      const masterData = await masterResponse.json();
      console.log('Master entry created:', masterData);
      const masterId = masterData.data.id;

      // Create individual items
      for (const item of newEntry.items) {
        if (item.silverWeight) {
          await fetch('https://jewelapi.sricashway.com/api/old-silver-items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                oldSilverEntryId: masterId.toString(),
                customerName: item.customerName || newEntry.customerName,
                silverWeight: item.silverWeight,
                lessWeight: item.lessWeight || "0",
                price: item.price || "0",
                total: item.total || "0"
              }
            })
          });
        }
      }

      toast({
        title: "✅ Success",
        description: "Old silver entry created successfully",
      });

      setNewEntry({
        customerName: "",
        salesEntryId: "",
        items: [{ customerName: "", silverWeight: "", lessWeight: "", price: "", total: "" }]
      });
      loadOldSilverEntries();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create old silver entry",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Old Silver Management"
        onBack={goBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Old Silver Management" }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GradientCard title="Total Entries" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-blue-600">{stats.totalEntries}</div>
          </GradientCard>
          
          <GradientCard title="Total Weight" icon={<Package className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-green-600">{stats.totalWeight.toFixed(2)}g</div>
          </GradientCard>
          
          <GradientCard title="Total Value" icon={<DollarSign className="w-5 h-5 text-white" />}>
            <div className="text-3xl font-bold text-purple-600">₹{stats.totalValue.toLocaleString()}</div>
          </GradientCard>
        </div>

        {/* Add New Entry Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Old Silver Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="text-sm font-semibold text-blue-700 mb-3 block">Entry Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-blue-600 mb-1 block">Customer Name *</Label>
                    <Input
                      value={newEntry.customerName}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter customer name"
                      className="bg-white border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-blue-600 mb-1 block">Sales Invoice</Label>
                    <Input
                      value={newEntry.salesEntryId}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, salesEntryId: e.target.value }))}
                      placeholder="Enter sales invoice number (optional)"
                      className="bg-white border-blue-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <Label className="text-lg font-bold text-gray-800 mb-3 block flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-indigo-600" />
                  Silver Items
                </Label>
              </div>

              {newEntry.items.map((item, index) => (
                <Card key={index} className="p-5 bg-gradient-to-r from-white to-gray-50 border-l-4 border-l-indigo-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <h4 className="font-bold text-gray-800">Item {index + 1}</h4>
                    </div>
                    {newEntry.items.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItemRow(index)}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Silver Weight (g)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.silverWeight}
                        onChange={(e) => updateItem(index, 'silverWeight', e.target.value)}
                        placeholder="Weight"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Less Weight (g)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.lessWeight}
                        onChange={(e) => updateItem(index, 'lessWeight', e.target.value)}
                        placeholder="Less weight"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Price per gram (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        placeholder="Price"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Net Weight (g)</Label>
                      <Input
                        value={item.total}
                        readOnly
                        className="bg-gray-100"
                        placeholder="Auto calculated"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Total Value (₹)</Label>
                      <Input
                        value={((parseFloat(item.total) || 0) * (parseFloat(item.price) || 0)).toFixed(2)}
                        readOnly
                        className="bg-gray-100"
                        placeholder="Auto calculated"
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={addItemRow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Item
                </Button>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Net Weight</div>
                  <div className="text-2xl font-bold text-green-600">
                    {newEntry.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2)}g
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Value</div>
                  <div className="text-xl font-bold text-purple-600">
                    ₹{newEntry.items.reduce((sum, item) => 
                      sum + ((parseFloat(item.total) || 0) * (parseFloat(item.price) || 0)), 0
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

              <Button onClick={handleSubmit} loading={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Old Silver Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entries Table */}
        <Card className="bg-white border shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-primary" />
                  Old Silver Entries
                </h3>
                <p className="text-sm text-gray-500 mt-1">View and manage all old silver entries</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Search</Label>
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by customer name, sales ID..."
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Entries per page</Label>
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
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No old silver entries found
                      </td>
                    </tr>
                  ) : (
                    paginatedEntries.map((entry, index) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {entry.customerName || 'Unknown'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {entry.salesEntryId || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {entry.itemsCount} items
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {parseFloat(entry.totalWeight || 0).toFixed(2)}g
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-green-600">
                          ₹{parseFloat(entry.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log('Delete clicked for entry:', entry);
                              handleDelete(entry);
                            }}
                            className="text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredEntries.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredEntries.length)} of {filteredEntries.length} entries
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