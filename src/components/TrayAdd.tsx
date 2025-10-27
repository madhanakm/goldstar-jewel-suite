import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, FormField, FormSection } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { Package, LogOut, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tray {
  id: number;
  trayno: string;
}

interface TrayAddProps extends PageProps {
  onLogout?: () => void;
}

export const TrayAdd = ({ onNavigate, onLogout }: TrayAddProps) => {
  const [trays, setTrays] = useState<Tray[]>([]);
  const [newTrayNo, setNewTrayNo] = useState("");
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  useEffect(() => {
    loadTrays();
  }, []);

  const loadTrays = async () => {
    try {
      const response = await request(endpoints.trays.list());
      const trayList = response.data?.map((item: any) => ({
        id: item.id,
        trayno: item.attributes?.trayno || item.trayno
      })) || [];
      setTrays(trayList);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load trays",
        variant: "destructive",
      });
    }
  };

  const handleAddTray = async () => {
    if (!newTrayNo.trim()) {
      toast({
        title: "⚠️ Warning",
        description: "Please enter a tray number",
        variant: "destructive",
      });
      return;
    }

    try {
      await request(endpoints.trays.create(), 'POST', {
        data: { trayno: newTrayNo.trim() }
      });
      
      toast({
        title: "✅ Success",
        description: "Tray added successfully",
      });
      
      setNewTrayNo("");
      loadTrays();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add tray",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Tray Management"
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Tray Management" }
        ]}
        icon={<Package className="w-6 h-6 text-primary mr-3" />}
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
          {/* Add New Tray */}
          <FormSection title="Add New Tray" description="Create a new tray for inventory management">
            <div className="flex gap-4">
              <FormField label="Tray Number" required>
                <Input
                  value={newTrayNo}
                  onChange={(e) => setNewTrayNo(e.target.value)}
                  placeholder="Enter tray number (e.g., T001)"
                />
              </FormField>
              <div className="flex items-end">
                <Button onClick={handleAddTray} loading={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tray
                </Button>
              </div>
            </div>
          </FormSection>

          {/* Existing Trays */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Existing Trays ({trays.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trays.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No trays found. Add your first tray!
                </div>
              ) : (
                trays.map((tray) => (
                  <div key={tray.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{tray.trayno}</span>
                    </div>
                  </div>
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