import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Textarea } from "@/components/ui/textarea";
import { PageLayout, PageContent, PageHeader, SearchFilter, FormField, FormSection, useSidebar, SidebarWrapper, GradientCard, ActionButton, DataGrid } from "@/components/common";
import { useApi, endpoints, usePagination } from "@/shared";
import { useToast } from "@/hooks/use-toast";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
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