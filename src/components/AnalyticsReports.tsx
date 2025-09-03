import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { BarChart3, LogOut, TrendingUp, Package, ShoppingCart, ShoppingBag, Users, DollarSign } from "lucide-react";

interface AnalyticsReportsProps {
  onNavigate?: (module: string) => void;
  onLogout?: () => void;
}

export const AnalyticsReports = ({ onNavigate, onLogout }: AnalyticsReportsProps) => {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  const reportModules = [
    {
      name: "Sales Report",
      description: "Sales analytics, revenue tracking, and customer insights",
      icon: TrendingUp,
      color: "bg-blue-500",
      onClick: () => onNavigate?.("Sales Report")
    },
    {
      name: "Stock Report", 
      description: "Inventory levels, stock status, and availability tracking",
      icon: Package,
      color: "bg-green-500",
      onClick: () => onNavigate?.("Stock Report")
    },
    {
      name: "Purchase Report",
      description: "Purchase analytics, vendor tracking, and cost analysis",
      icon: ShoppingBag,
      color: "bg-purple-500",
      onClick: () => onNavigate?.("Purchase Report")
    }
  ];

  const quickStats = [
    { title: "Today's Sales", value: "₹25,000", icon: ShoppingCart, color: "text-blue-600" },
    { title: "Stock Items", value: "1,250", icon: Package, color: "text-green-600" },
    { title: "Active Customers", value: "85", icon: Users, color: "text-purple-600" },
    { title: "Monthly Revenue", value: "₹5,50,000", icon: DollarSign, color: "text-orange-600" }
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Analytics & Reports"
        onBack={() => onNavigate?.("Dashboard")}
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Analytics & Reports" }
        ]}
        icon={<BarChart3 className="w-6 h-6 text-primary mr-3" />}
        actions={
          onLogout && (
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )
        }
      />
      
      <PageContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <GradientCard key={index} title={stat.title} icon={<stat.icon className="w-5 h-5 text-white" />}>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </GradientCard>
          ))}
        </div>

        {/* Report Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportModules.map((module, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                onClick={module.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800">{module.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{module.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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