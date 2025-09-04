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
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadRates();
    testApiEndpoint();
  }, []);

  const testApiEndpoint = async () => {
    try {
      // Test the base endpoint
      const response = await fetch('https://jewelapi.sricashway.com/api/rates');
      const data = await response.json();
      console.log('Direct API test response:', data);
      
      // Test if rates have different ID structure
      if (data.data && data.data.length > 0) {
        const firstRate = data.data[0];
        console.log('First rate structure:', firstRate);
        console.log('Rate ID:', firstRate.id);
        console.log('Rate attributes:', firstRate.attributes);
      }
    } catch (error) {
      console.error('API test error:', error);
    }
  };

  const loadRates = async () => {
    try {
      console.log('Loading rates from:', endpoints.rates.list());
      const response = await request(endpoints.rates.list());
      console.log('Load rates response:', response);
      
      const ratesData = response.data || [];
      console.log('Raw rates data:', ratesData);
      console.log('First rate object:', ratesData[0]);
      
      // Handle Strapi v5 structure - use documentId for API calls
      const formattedRates = ratesData.map((rate: any) => {
        console.log('Processing rate:', rate);
        console.log('Rate documentId:', rate.documentId, 'Rate id:', rate.id);
        return {
          id: rate.documentId, // Use documentId for API operations
          price: rate.attributes?.price || rate.price,
          updatedAt: rate.attributes?.updatedAt || rate.updatedAt || new Date().toISOString()
        };
      });
      console.log('Formatted rates:', formattedRates);
      setRates(formattedRates);
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
      
      await loadRates();
      setEditingId(null);
      setEditRate("");
      
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
      
      setRates(prev => [...prev, responseData.data]);
      setNewRate({ price: "" });
      
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Rate */}
          <FormSection title="Silver Rate" description="Set current silver price per gram">
            <div className="space-y-4">
              <FormField label="Silver Price per Gram (₹)" required>
                <Input
                  type="number"
                  step="0.01"
                  value={newRate.price}
                  onChange={(e) => setNewRate(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter silver price per gram"
                />
              </FormField>
              <Button onClick={handleAddRate} loading={loading} className="w-full">
                Update Silver Rate
              </Button>
            </div>
          </FormSection>

          {/* Current Rates */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Current Silver Rate</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No silver rate found. Add the current rate!
                </div>
              ) : (
                rates.map((rate) => (
                  <Card key={rate.id} className="p-4 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-center">
                      <div className="w-full">
                        <h3 className="font-bold">Silver Price per Gram</h3>
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
                            <div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-bold text-green-600">
                                  ₹{rate.price}/gram
                                </span>
                                <Button size="sm" variant="outline" onClick={() => startEdit(rate)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Last updated: {new Date(rate.updatedAt).toLocaleString()}
                              </div>
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