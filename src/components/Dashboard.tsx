import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout, PageContent, StatCard, ModuleCard, useSidebar, SidebarWrapper, GradientCard, ActionButton } from "@/components/common";
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
  Settings,
  Plus
} from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export const Dashboard = ({ onLogout, onNavigate }: DashboardProps) => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useSidebar();
  


  const customerModules = [
    { name: "Customer Profiles", icon: Users, description: "Add/edit customer profiles and details", color: "bg-blue-500" },
    { name: "Purchase History", icon: Receipt, description: "Customer purchase tracking and history", color: "bg-purple-500" }
  ];

  const [stats, setStats] = useState([
    { label: "Total Customers", value: "0", icon: Users, change: "0%" },
    { label: "Monthly Sales", value: "₹0", icon: ShoppingCart, change: "0%" },
    { label: "Total Products", value: "0", icon: Package, change: "0%" },
    { label: "Daily Sales", value: "₹0", icon: TrendingUp, change: "0%" }
  ]);

  return (
    <PageLayout>
      {/* Header */}
      <header className="relative bg-gradient-to-r from-amber-50 via-white to-amber-50 border-b border-amber-200/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ActionButton variant="ghost" size="sm" onClick={toggleSidebar} className="mr-3">
                <Menu className="w-5 h-5" />
              </ActionButton>
              <img 
                src="https://jewelapi.sricashway.com/uploads/CASHWAY_FINAL_WORK_1_18740501ca_85998da533.png" 
                alt="Sri Cashway Logo" 
                className="w-8 h-8 object-contain mr-3 rounded-lg shadow-sm"
              />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent">
                Sri Cashway
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ActionButton variant="danger" size="sm" onClick={onLogout} icon={LogOut}>
                <span className="hidden sm:inline">Logout</span>
              </ActionButton>
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

        {/* Business Modules */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Business Management</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard
              name="Inventory Management"
              description="Stock tracking and product management"
              icon={Package}
              color="bg-blue-500"
              onClick={() => onNavigate("Product Module")}
            />
            <ModuleCard
              name="Customer Profiles"
              description="Customer information and purchase history"
              icon={Users}
              color="bg-green-500"
              onClick={() => onNavigate("Customer Profiles")}
            />
            <ModuleCard
              name="Sales Reports"
              description="Business analytics and performance metrics"
              icon={TrendingUp}
              color="bg-purple-500"
              onClick={() => onNavigate("Sales Reports")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <GradientCard 
              title="Daily Operations" 
              description="Essential tools for jewelry business management"
              icon={<TrendingUp className="w-5 h-5 text-white" />}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <ActionButton 
                  variant="success" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("New Sale")}
                >
                  <ShoppingCart className="w-5 h-5 mb-1" />
                  <span className="text-xs">New Sale</span>
                </ActionButton>

                <ActionButton 
                  variant="warning" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Purchase Entry")}
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Purchase Entry</span>
                </ActionButton>

                <ActionButton 
                  variant="default" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Daily Report")}
                >
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-xs">Daily Report</span>
                </ActionButton>
                <ActionButton 
                  variant="dark" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Barcode Generator")}
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Barcode</span>
                </ActionButton>
                <ActionButton 
                  variant="info" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Sales Entry")}
                >
                  <ShoppingCart className="w-5 h-5 mb-1" />
                  <span className="text-xs">Sales Entry</span>
                </ActionButton>
                <ActionButton 
                  variant="secondary" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Tray Management")}
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Tray Mgmt</span>
                </ActionButton>

              </div>
            </GradientCard>
          </div>

          {/* API Connection Status */}
          <div className="space-y-4">
            <GradientCard 
              title="System Status" 
              icon={<Settings className="w-5 h-5 text-white" />}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-sm font-medium text-emerald-800">API Connection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600">Connected</span>
                  </div>
                </div>
              </div>
            </GradientCard>
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