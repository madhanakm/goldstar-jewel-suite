import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageLayout, PageContent, StatCard, ModuleCard, useSidebar, SidebarWrapper, GradientCard, ActionButton } from "@/components/common";
import { useApi, endpoints } from "@/shared";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { RateManagement } from "./RateManagement";
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
  Plus,
  Calculator
} from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export const Dashboard = ({ onLogout, onNavigate }: DashboardProps) => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  


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
  const { request } = useApi();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load customers count
      const customersResponse = await request(endpoints.customers.list(1, 1000));
      const customersCount = customersResponse.data?.length || 0;

      // Load products count
      const productsResponse = await request(endpoints.barcode.list(1000));
      const productsCount = productsResponse.data?.length || 0;

      // Load sales data
      const salesResponse = await request(endpoints.sales.masters.list(1, 1000));
      const salesData = salesResponse.data || [];
      
      // Calculate monthly and daily sales
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const todayStr = today.toISOString().split('T')[0];
      
      let monthlySales = 0;
      let dailySales = 0;
      
      salesData.forEach((sale: any) => {
        const saleAttributes = sale.attributes || sale;
        const saleDate = new Date(saleAttributes.date);
        const saleAmount = parseFloat(saleAttributes.totalamount || '0');
        
        // Monthly sales - current month only
        if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
          monthlySales += saleAmount;
        }
        
        // Daily sales - today only
        if (saleDate.toISOString().split('T')[0] === todayStr) {
          dailySales += saleAmount;
        }
      });

      setStats([
        { label: "Total Customers", value: customersCount.toString(), icon: Users, change: "+12%" },
        { label: "Monthly Sales", value: `₹${monthlySales.toLocaleString()}`, icon: ShoppingCart, change: "+8%" },
        { label: "Total Products", value: productsCount.toString(), icon: Package, change: "+5%" },
        { label: "Daily Sales", value: `₹${dailySales.toLocaleString()}`, icon: TrendingUp, change: "+15%" }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

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
                src="https://jewelapi.sricashway.com/uploads/logo_dark_cf76e8978d.png" 
                alt="PRABANJAM JWELLERY LIMITED Logo" 
                className="w-8 h-8 object-contain mr-3 rounded-lg shadow-sm"
              />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent">
                PRABANJAM JWELLERY LIMITED
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <ActionButton variant="secondary" size="sm" icon={Calculator}>
                    <span className="hidden sm:inline">Rates</span>
                  </ActionButton>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Rate Management</DialogTitle>
                  </DialogHeader>
                  <RateManagement onNavigate={onNavigate} />
                </DialogContent>
              </Dialog>
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
            <div key={index} className={stat.label === "Monthly Sales" ? "col-span-1 md:col-span-2 lg:col-span-1" : ""}>
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
              />
            </div>
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
              onClick={() => onNavigate("Stock Report")}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ActionButton 
                  variant="success" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("New Sale")}
                >
                  <ShoppingCart className="w-5 h-5 mb-1" />
                  <span className="text-xs">New Sale</span>
                </ActionButton>

                <ActionButton 
                  variant="info" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Estimation")}
                >
                  <Calculator className="w-5 h-5 mb-1" />
                  <span className="text-xs">New Estimation</span>
                </ActionButton>

                <ActionButton 
                  variant="warning" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Purchase Entry")}
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Purchase Management</span>
                </ActionButton>

                <ActionButton 
                  variant="dark" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Barcode Generator")}
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Barcode</span>
                </ActionButton>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ActionButton 
                  variant="default" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Daily Report")}
                >
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-xs">Reports</span>
                </ActionButton>

                <ActionButton 
                  variant="info" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Sales List")}
                >
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-xs">Sales List</span>
                </ActionButton>

                <ActionButton 
                  variant="secondary" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Estimation List")}
                >
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-xs">Est. List</span>
                </ActionButton>

                <ActionButton 
                  variant="secondary" 
                  className="h-16 flex-col p-3" 
                  onClick={() => onNavigate("Tray Management")}
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Manage Tray</span>
                </ActionButton>
              </div>
            </GradientCard>
          </div>

          {/* Tray Report */}
          <div className="space-y-4">
            <GradientCard 
              title="Tray Report" 
              icon={<FileText className="w-5 h-5 text-white" />}
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">View detailed tray-wise stock reports and inventory tracking</p>
                <ActionButton 
                  variant="primary" 
                  className="w-full" 
                  onClick={() => onNavigate("Tray Report")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Tray Report
                </ActionButton>
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