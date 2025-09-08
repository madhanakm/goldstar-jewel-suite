import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout, PageContent, PageHeader, SearchFilter, FormField, FormSection, useSidebar, SidebarWrapper, GradientCard, ActionButton, DataGrid } from "@/components/common";
import { useApi, endpoints, usePagination } from "@/shared";
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
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Package,
  IdCard
} from "lucide-react";

interface CustomerManagementProps {
  onBack: () => void;
  onNavigate?: (module: string) => void;
}

export const CustomerManagement = ({ onBack, onNavigate }: CustomerManagementProps) => {

  const [searchTerm, setSearchTerm] = useState("");
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
      const customersData = response.data || [];
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



  const handleSearch = (value: string) => {
    setSearchTerm(value);
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

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  });

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
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

            <DataGrid
              data={filteredCustomers}
              columns={[
                {
                  key: 'name',
                  header: 'Customer',
                  render: (_, customer) => (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{customer.name}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'phone',
                  header: 'Contact',
                  render: (_, customer) => (
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-slate-700">
                        <Phone className="w-3 h-3 mr-2 text-amber-600" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="w-3 h-3 mr-2 text-amber-600" />
                        {customer.email}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'gstin',
                  header: 'GST Details',
                  render: (_, customer) => (
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-slate-700">
                        <FileText className="w-3 h-3 mr-2 text-amber-600" />
                        {customer.gstin || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <IdCard className="w-3 h-3 mr-2 text-amber-600" />
                        {customer.aadhar || 'N/A'}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'totalPurchases',
                  header: 'Purchases',
                  render: (value) => (
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">{value}</div>
                      <div className="text-xs text-slate-600">Total</div>
                    </div>
                  )
                },

                {
                  key: 'id',
                  header: 'Actions',
                  render: (_, customer) => (
                    <div className="flex space-x-2">
                      <ActionButton 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsViewMode(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </ActionButton>
                      <ActionButton 
                        size="sm" 
                        variant="ghost"
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
                        <Edit className="w-4 h-4" />
                      </ActionButton>
                    </div>
                  )
                }
              ]}
              emptyMessage="No customers found. Add your first customer to get started."
            />
        </div>
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