import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout, PageContent, PageHeader, FormField, useSidebar, SidebarWrapper, ActionButton } from "@/components/common";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useApi, endpoints } from "@/shared";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { Customer, CustomerFormData } from "@/types/customer";
import {
  Users,
  Plus,
  Search,
  Edit,
  Eye,
  FileText,
  CreditCard,
  Gift,
  RefreshCw
} from "lucide-react";

interface CustomerManagementProps {
  onBack: () => void;
  onNavigate?: (module: string) => void;
}

export const CustomerManagement = ({ onBack, onNavigate }: CustomerManagementProps) => {

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    aadhar: '',
    gstin: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();

  const { loading, request } = useApi();
  const { goBack } = useNavigation();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await request(endpoints.customers.list(1, 1000));
      const customersData = (response.data || []).sort((a, b) => b.id - a.id);
      setCustomers(customersData);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      await request(`/api/customers/${selectedCustomer.documentId || selectedCustomer.id}`, 'PUT', {
        data: formData
      });
      toast({
        title: "✅ Success",
        description: "Customer updated successfully",
      });
      setIsEditMode(false);
      setSelectedCustomer(null);
      setFormData({ name: '', phone: '', email: '', address: '', aadhar: '', gstin: '' });
      loadCustomers();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    }
  };



  const handleAddCustomer = async () => {
    try {
      await request(endpoints.customers.create(), 'POST', {
        data: formData
      });
      toast({
        title: "✅ Success",
        description: "Customer added successfully",
      });
      setIsAddCustomerOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '', aadhar: '', gstin: '' });
      loadCustomers();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
  };

  // Computed values for table
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchFilter || 
      customer.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, pageSize]);

  return (
    <PageLayout>
      <PageHeader
        title="Customer Management"
        onBack={goBack}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Customer Management" }
        ]}
        icon={<Users className="w-6 h-6 text-primary mr-3" />}
      />
      <PageContent>
        <Card className="bg-white border shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Customer Management
                </h3>
                <p className="text-sm text-gray-500 mt-1">View and manage all customers</p>
              </div>
              <Dialog open={isAddCustomerOpen} onOpenChange={(open) => {
                setIsAddCustomerOpen(open);
                if (open) {
                  setFormData({ name: '', phone: '', email: '', address: '', aadhar: '', gstin: '' });
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <FormField label="Customer Name" required>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter customer name"
                      />
                    </FormField>
                    <FormField label="Phone Number" required>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </FormField>
                    <FormField label="Email">
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </FormField>
                    <FormField label="Address">
                      <Textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Enter address"
                      />
                    </FormField>
                    <FormField label="Aadhar Number">
                      <Input
                        value={formData.aadhar}
                        onChange={(e) => setFormData({...formData, aadhar: e.target.value})}
                        placeholder="Enter Aadhar number"
                        maxLength={12}
                      />
                    </FormField>
                    <FormField label="GSTIN">
                      <Input
                        value={formData.gstin}
                        onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                        placeholder="Enter GSTIN"
                        maxLength={15}
                      />
                    </FormField>
                    <div className="flex space-x-2">
                      <Button onClick={handleAddCustomer} className="flex-1">
                        Add Customer
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Search</Label>
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by name, phone, or email..."
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
              <div className="flex items-end">
                <Button onClick={loadCustomers} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GSTIN</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCustomers.map((customer, index) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mr-3">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div className="font-medium">{customer.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.phone}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.email || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.gstin || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setIsViewMode(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setFormData({
                                  name: customer.name || '',
                                  phone: customer.phone || '',
                                  email: customer.email || '',
                                  address: customer.address || '',
                                  aadhar: customer.aadhar || '',
                                  gstin: customer.gstin || ''
                                });
                                setIsEditMode(true);
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} entries
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
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))
                }
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
          </div>
        </Card>

            {/* View Customer Dialog */}
            <Dialog open={isViewMode} onOpenChange={setIsViewMode}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Customer Details</DialogTitle>
                </DialogHeader>
                {selectedCustomer && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="text-sm font-semibold">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-sm">{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-sm">{selectedCustomer.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">GSTIN</label>
                        <p className="text-sm">{selectedCustomer.gstin || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-sm">{selectedCustomer.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Aadhar</label>
                      <p className="text-sm">{selectedCustomer.aadhar || 'N/A'}</p>
                    </div>
                    <Button onClick={() => setIsViewMode(false)} className="w-full">
                      Close
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Customer Dialog */}
            <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <FormField label="Customer Name" required>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </FormField>
                  <FormField label="Phone Number" required>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </FormField>
                  <FormField label="Email">
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </FormField>
                  <FormField label="Address">
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </FormField>
                  <FormField label="Aadhar Number">
                    <Input
                      value={formData.aadhar}
                      onChange={(e) => setFormData({...formData, aadhar: e.target.value})}
                      placeholder="Enter Aadhar number"
                      maxLength={12}
                    />
                  </FormField>
                  <FormField label="GSTIN">
                    <Input
                      value={formData.gstin}
                      onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                      placeholder="Enter GSTIN"
                      maxLength={15}
                    />
                  </FormField>
                  <div className="flex space-x-2">
                    <Button onClick={handleUpdateCustomer} className="flex-1">
                      Update Customer
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>


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