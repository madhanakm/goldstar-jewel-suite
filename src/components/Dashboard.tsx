import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout, PageContent, StatCard, ModuleCard, useSidebar, SidebarWrapper } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  FileText,
  UserCheck,
  Receipt,
  LogOut,
  Menu,
  Settings
} from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export const Dashboard = ({ onLogout, onNavigate }: DashboardProps) => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useSidebar();
  


  const customerModules = [
    { name: "Customer Profiles", icon: Users, description: "Add/edit customer profiles, KYC details", color: "bg-blue-500" },
    { name: "KYC Management", icon: UserCheck, description: "Aadhar, PAN, and document verification", color: "bg-green-500" },
    { name: "Purchase History", icon: Receipt, description: "Customer purchase tracking and history", color: "bg-purple-500" },
    { name: "Loyalty & Referrals", icon: TrendingUp, description: "Points system and referral management", color: "bg-orange-500" }
  ];

  const [stats, setStats] = useState([
    { label: "Total Customers", value: "0", icon: Users, change: "0%" },
    { label: "Monthly Sales", value: "₹0", icon: ShoppingCart, change: "0%" },
    { label: "Stock Value", value: "₹0", icon: Package, change: "0%" },
    { label: "Active Loans", value: "0", icon: DollarSign, change: "0%" }
  ]);

  return (
    <PageLayout>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={toggleSidebar} className="mr-3">
                <Menu className="w-5 h-5" />
              </Button>
              <img 
                src="https://jewelapi.sricashway.com/uploads/CASHWAY_FINAL_WORK_1_18740501ca_85998da533.png" 
                alt="Sri Cashway Logo" 
                className="w-8 h-8 object-contain mr-3"
              />
              <h1 className="text-2xl font-bold text-luxury-dark">Sri Cashway</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <PageContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              change={stat.change}
            />
          ))}
        </div>

        {/* Customer Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-luxury-dark mb-4">Customer Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerModules.map((item, index) => (
              <ModuleCard
                key={index}
                name={item.name}
                description={item.description}
                icon={item.icon}
                color={item.color}
                onClick={() => onNavigate(item.name)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border-luxury-gold/20">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used features for daily operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("New Sale")}>
                    <ShoppingCart className="w-5 h-5 mb-1" />
                    New Sale
                  </Button>
                  <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("Add Product")}>
                    <Package className="w-5 h-5 mb-1" />
                    Add Product
                  </Button>
                  <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("Stock Check")}>
                    <Package className="w-5 h-5 mb-1" />
                    Stock Check
                  </Button>
                  <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("Daily Report")}>
                    <FileText className="w-5 h-5 mb-1" />
                    Daily Report
                  </Button>
                  <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("API Debug")}>
                    <Settings className="w-5 h-5 mb-1" />
                    API Debug
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Connection Status */}
          <div className="space-y-4">
            <Card className="border-luxury-gold/20">
              <CardHeader>
                <CardTitle>API Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">API connection monitoring will be displayed here</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
      
      <SidebarWrapper
        categories={sidebarConfig}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
    </PageLayout>
  );
};