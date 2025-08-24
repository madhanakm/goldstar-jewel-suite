import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout, PageContent, PageHeader, SearchFilter, FormField, FormSection, useSidebar, SidebarWrapper, GradientCard, ActionButton, DataGrid } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
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
  Package
} from "lucide-react";

interface CustomerManagementProps {
  onBack: () => void;
  onNavigate?: (module: string) => void;
}

export const CustomerManagement = ({ onBack, onNavigate }: CustomerManagementProps) => {
  const [selectedTab, setSelectedTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const { sidebarOpen, toggleSidebar } = useSidebar();

  const customers = [
    {
      id: "CUST001",
      name: "Priya Sharma",
      phone: "+91 9876543210",
      email: "priya.sharma@email.com",
      address: "123 Main St, Mumbai",
      kycStatus: "Verified",
      loyaltyPoints: 2450,
      totalPurchases: "₹2,45,000",
      lastVisit: "2024-01-15",
      memberSince: "2022-03-10"
    },
    {
      id: "CUST002",
      name: "Rajesh Kumar",
      phone: "+91 9876543211",
      email: "rajesh.kumar@email.com",
      address: "456 Park Road, Delhi",
      kycStatus: "Pending",
      loyaltyPoints: 1200,
      totalPurchases: "₹1,20,000",
      lastVisit: "2024-01-12",
      memberSince: "2023-01-20"
    },
    {
      id: "CUST003",
      name: "Anita Patel",
      phone: "+91 9876543212",
      email: "anita.patel@email.com",
      address: "789 Central Ave, Ahmedabad",
      kycStatus: "Verified",
      loyaltyPoints: 3800,
      totalPurchases: "₹3,80,000",
      lastVisit: "2024-01-18",
      memberSince: "2021-11-05"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">Customer List</TabsTrigger>
            <TabsTrigger value="add">Add Customer</TabsTrigger>
            <TabsTrigger value="kyc">KYC Management</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6 mt-6">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
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
                  key: 'loyaltyPoints',
                  header: 'Points',
                  render: (value) => (
                    <div className="text-center">
                      <div className="font-semibold text-amber-600">{value}</div>
                      <div className="text-xs text-slate-600">Loyalty</div>
                    </div>
                  )
                },
                {
                  key: 'kycStatus',
                  header: 'Status',
                  render: (value) => (
                    <Badge 
                      variant={value === "Verified" ? "default" : "secondary"}
                      className={value === "Verified" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                    >
                      {value}
                    </Badge>
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
          </TabsContent>

          <TabsContent value="add" className="space-y-6 mt-6">
            <GradientCard title="Add New Customer" icon={<Plus className="w-5 h-5 text-white" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="First Name" required>
                  <Input placeholder="Enter first name" />
                </FormField>
                <FormField label="Last Name" required>
                  <Input placeholder="Enter last name" />
                </FormField>
                <FormField label="Phone Number" required>
                  <Input placeholder="+91 9876543210" />
                </FormField>
                <FormField label="Email Address">
                  <Input type="email" placeholder="customer@email.com" />
                </FormField>
                <FormField label="Date of Birth">
                  <Input type="date" />
                </FormField>
                <FormField label="Anniversary Date">
                  <Input type="date" />
                </FormField>
              </div>
              
              <FormField label="Address">
                <Textarea placeholder="Enter complete address" />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="City">
                  <Input placeholder="Enter city" />
                </FormField>
                <FormField label="State">
                  <Input placeholder="Enter state" />
                </FormField>
                <FormField label="Pincode">
                  <Input placeholder="Enter pincode" />
                </FormField>
              </div>

              <div className="flex justify-end space-x-4">
                <ActionButton variant="outline">Cancel</ActionButton>
                <ActionButton variant="success" icon={Plus}>Add Customer</ActionButton>
              </div>
            </GradientCard>
          </TabsContent>

          <TabsContent value="kyc" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Document Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customer) => (
                    <Card key={customer.id} className="border-luxury-gold/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{customer.name}</h4>
                          <Badge 
                            variant={customer.kycStatus === "Verified" ? "default" : "secondary"}
                            className={customer.kycStatus === "Verified" ? "bg-green-500" : "bg-yellow-500"}
                          >
                            {customer.kycStatus}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Aadhar Card:</span>
                            <span className="text-green-600">✓ Verified</span>
                          </div>
                          <div className="flex justify-between">
                            <span>PAN Card:</span>
                            <span className="text-green-600">✓ Verified</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Address Proof:</span>
                            <span className="text-yellow-600">⏳ Pending</span>
                          </div>
                        </div>
                        <Button size="sm" variant="primary" className="w-full mt-3">
                          <FileText className="w-4 h-4 mr-2" />
                          Manage Documents
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Loyalty Program Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Members:</span>
                      <span className="font-semibold">2,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Members:</span>
                      <span className="font-semibold">1,832</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Points Redeemed:</span>
                      <span className="font-semibold">₹45,230</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Points/Customer:</span>
                      <span className="font-semibold">2,150</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Loyalty Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customers
                      .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
                      .map((customer, index) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">{customer.loyaltyPoints} pts</p>
                            <p className="text-sm text-muted-foreground">₹{(customer.loyaltyPoints * 0.1).toFixed(0)} value</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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