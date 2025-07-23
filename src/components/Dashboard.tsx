import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  Gem,
  Scale,
  CreditCard,
  Warehouse,
  UserCheck,
  Receipt,
  Calculator,
  PieChart,
  LogOut
} from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export const Dashboard = ({ onLogout, onNavigate }: DashboardProps) => {
  const modules = [
    {
      category: "Customer Management",
      items: [
        { name: "Customer Profiles", icon: Users, description: "Add/edit customer profiles, KYC details", color: "bg-blue-500" },
        { name: "KYC Management", icon: UserCheck, description: "Aadhar, PAN, and document verification", color: "bg-green-500" },
        { name: "Purchase History", icon: Receipt, description: "Customer purchase tracking and history", color: "bg-purple-500" },
        { name: "Loyalty & Referrals", icon: TrendingUp, description: "Points system and referral management", color: "bg-orange-500" }
      ]
    },
    {
      category: "Product & Inventory",
      items: [
        { name: "Inventory Management", icon: Package, description: "Category-wise inventory tracking", color: "bg-emerald-500" },
        { name: "Stock Tracking", icon: Warehouse, description: "Weight and purity-wise tracking", color: "bg-teal-500" },
        { name: "Barcode System", icon: Scale, description: "Barcode generation and scanning", color: "bg-indigo-500" },
        { name: "Real-time Updates", icon: BarChart3, description: "Live stock and valuation updates", color: "bg-cyan-500" }
      ]
    },
    {
      category: "Sales & Billing",
      items: [
        { name: "Retail Billing", icon: ShoppingCart, description: "GST compliant billing system", color: "bg-rose-500" },
        { name: "Making Charges", icon: Calculator, description: "Configure charges and wastage", color: "bg-amber-500" },
        { name: "Old Gold Exchange", icon: Gem, description: "Buy-back and exchange management", color: "bg-yellow-500" },
        { name: "Payment Methods", icon: CreditCard, description: "Cash, UPI, Card, and credit sales", color: "bg-pink-500" }
      ]
    },
    {
      category: "Financial Modules",
      items: [
        { name: "Gold Loan", icon: DollarSign, description: "Loan against jewellery tracking", color: "bg-violet-500" },
        { name: "Advance Booking", icon: FileText, description: "Custom jewellery advance records", color: "bg-slate-500" },
        { name: "GST Reports", icon: Receipt, description: "GSTR-1, GSTR-3B compliance", color: "bg-red-500" },
        { name: "Accounting", icon: Calculator, description: "P&L, tax calculations, ledgers", color: "bg-lime-500" }
      ]
    },
    {
      category: "Analytics & Reports",
      items: [
        { name: "Business Dashboard", icon: BarChart3, description: "Sales insights and trends", color: "bg-blue-600" },
        { name: "Stock Reports", icon: PieChart, description: "Valuation and movement reports", color: "bg-green-600" },
        { name: "Customer Analytics", icon: Users, description: "Purchase behavior analysis", color: "bg-purple-600" },
        { name: "Performance Metrics", icon: TrendingUp, description: "Business KPIs and metrics", color: "bg-orange-600" }
      ]
    }
  ];

  const stats = [
    { label: "Total Customers", value: "2,456", icon: Users, change: "+12%" },
    { label: "Monthly Sales", value: "₹45.2L", icon: ShoppingCart, change: "+8.5%" },
    { label: "Stock Value", value: "₹1.2Cr", icon: Package, change: "+3.2%" },
    { label: "Active Loans", value: "124", icon: DollarSign, change: "-2.1%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-background to-luxury-cream">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Gem className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-luxury-dark">JewelCraft</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-luxury-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-luxury-dark">{stat.value}</p>
                    <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modules Grid */}
        {modules.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-8">
            <h2 className="text-xl font-semibold text-luxury-dark mb-4">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.items.map((item, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-luxury-gold/20 hover:border-luxury-gold/40"
                  onClick={() => onNavigate(item.name)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <Card className="mt-8 border-luxury-gold/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features for daily operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("New Sale")}>
                <ShoppingCart className="w-5 h-5 mb-1" />
                New Sale
              </Button>
              <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("Add Customer")}>
                <Users className="w-5 h-5 mb-1" />
                Add Customer
              </Button>
              <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("Stock Check")}>
                <Package className="w-5 h-5 mb-1" />
                Stock Check
              </Button>
              <Button variant="outline" className="h-16 flex-col" onClick={() => onNavigate("Daily Report")}>
                <FileText className="w-5 h-5 mb-1" />
                Daily Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};