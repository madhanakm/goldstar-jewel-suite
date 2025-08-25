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
  Lock
} from "lucide-react";

export const sidebarConfig = [
  {
    category: "Product Management",
    items: [
      { name: "Product Catalog", icon: Package, description: "Add, edit, and manage product listings", color: "bg-blue-500" },
      { name: "Product Categories", icon: FileText, description: "Organize products by categories and types", color: "bg-green-500" },
      { name: "Pricing Management", icon: DollarSign, description: "Set and update product pricing", color: "bg-yellow-500" },
      { name: "Product Variants", icon: Settings, description: "Manage size, weight, and design variants", color: "bg-purple-500" }
    ]
  },
  {
    category: "Product & Inventory",
    items: [
      { name: "Inventory Management", icon: Package, description: "Category-wise inventory tracking", color: "bg-emerald-500" },
      { name: "Stock Tracking", icon: Warehouse, description: "Weight and purity-wise tracking", color: "bg-teal-500" },
      { name: "Barcode Generator", icon: Scale, description: "Barcode generation and scanning", color: "bg-indigo-500" },
      { name: "Purchase Entry", icon: Receipt, description: "Record and manage purchase entries", color: "bg-orange-500" },
      { name: "Locker Room Management", icon: Lock, description: "Inside/outside locker product tracking", color: "bg-gray-600" },
      { name: "Real-time Updates", icon: BarChart3, description: "Live stock and valuation updates", color: "bg-cyan-500" }
    ]
  },
  {
    category: "Sales & Billing",
    items: [
      { name: "Retail Billing", icon: ShoppingCart, description: "GST compliant billing system", color: "bg-rose-500" },
      { name: "Silver Billing", icon: Gem, description: "Specialized silver jewelry billing", color: "bg-slate-400" },
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