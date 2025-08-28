import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, FormField, FormSection } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { TrendingUp, LogOut, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rate {
  id: number;
  product: string;
  price: string;
}

interface RateManagementProps extends PageProps {
  onLogout?: () => void;
}

export const RateManagement = ({ onNavigate, onLogout }: RateManagementProps) => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRate, setEditRate] = useState("");
  const [newRate, setNewRate] = useState({ product: "", price: "" });
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      const response = await request('/api/rates?pagination[pageSize]=100');
      setRates(response.data || []);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load rates",
        variant: "destructive",
      });
    }
  };

  const handleSaveRate = async (id: number) => {
    try {
      await request(`/api/rates/${id}`, 'PUT', {
        data: { price: editRate }
      });
      
      setRates(prev => prev.map(rate => 
        rate.id === id ? { ...rate, price: editRate } : rate
      ));
      
      setEditingId(null);
      setEditRate("");
      
      toast({
        title: "✅ Success",
        description: "Rate updated successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update rate",
        variant: "destructive",
      });
    }
  };

  const handleAddRate = async () => {
    if (!newRate.product || !newRate.price) {
      toast({
        title: "⚠️ Warning",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await request('/api/rates', 'POST', {
        data: newRate
      });
      
      setRates(prev => [...prev, response.data]);
      setNewRate({ product: "", price: "" });
      
      toast({
        title: "✅ Success",
        description: "Rate added successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add rate",
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Rate */}
          <FormSection title="Add New Rate" description="Set rates per gram for different touch/purity levels">
            <div className="space-y-4">
              <FormField label="Touch/Purity" required>
                <Input
                  value={newRate.product}
                  onChange={(e) => setNewRate(prev => ({ ...prev, product: e.target.value }))}
                  placeholder="22K, 18K, 925, Pure"
                />
              </FormField>
              <FormField label="Price per Gram (₹)" required>
                <Input
                  type="number"
                  step="0.01"
                  value={newRate.price}
                  onChange={(e) => setNewRate(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter price per gram"
                />
              </FormField>
              <Button onClick={handleAddRate} loading={loading} className="w-full">
                Add Rate
              </Button>
            </div>
          </FormSection>

          {/* Current Rates */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Current Rates ({rates.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No rates found. Add your first rate!
                </div>
              ) : (
                rates.map((rate) => (
                  <Card key={rate.id} className="p-4 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{rate.product}</h3>
                        <div className="text-sm text-gray-600">
                          {editingId === rate.id ? (
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={editRate}
                                onChange={(e) => setEditRate(e.target.value)}
                                className="w-32"
                              />
                              <Button size="sm" onClick={() => handleSaveRate(rate.id)}>
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-lg font-bold text-green-600">
                                ₹{rate.price}/gram
                              </span>
                              <Button size="sm" variant="outline" onClick={() => startEdit(rate)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
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