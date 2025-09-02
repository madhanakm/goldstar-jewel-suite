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
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { page, hasMore, nextPage, resetPagination } = usePagination();
  const { loading, request } = useApi();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (pageNum = 1, search = "") => {
    try {
      const data = await request(endpoints.customers.list(pageNum, 10, search));
      if (pageNum === 1) {
        setCustomers(data.data || []);
      } else {
        setCustomers(prev => [...prev, ...(data.data || [])]);
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
      nextPage();
      loadCustomers(page + 1, searchTerm);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    resetPagination();
    loadCustomers(1, value);
  };

  const handleAddCustomer = async () => {
    try {
      await request(endpoints.customers.create(formData));
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

  const filteredCustomers = customers;

  return (
    <PageLayout>
      <PageHeader
        title="Customer Management"
        onBack={onBack}
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
              <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              searchPlaceholder="Search by name, phone, or ID..."
              filters={[
                {
                  label: "KYC Status",
                  value: "all",
                  options: [
                    { value: "all", label: "All Status" },
                    { value: "verified", label: "Verified" },
                    { value: "pending", label: "Pending" },
                    { value: "rejected", label: "Rejected" }
                  ],
                  onChange: () => {}
                },
                {
                  label: "Member Type",
                  value: "all",
                  options: [
                    { value: "all", label: "All Types" },
                    { value: "premium", label: "Premium" },
                    { value: "regular", label: "Regular" },
                    { value: "vip", label: "VIP" }
                  ],
                  onChange: () => {}
                }
              ]}
              />
              <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
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
                        <p className="text-sm text-slate-600">{customer.id}</p>
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
                  render: () => (
                    <div className="flex space-x-2">
                      <ActionButton size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </ActionButton>
                      <ActionButton size="sm" variant="ghost">
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