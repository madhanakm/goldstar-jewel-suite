import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Scale,
  Receipt,
  ShoppingBag
} from "lucide-react";

export const sidebarConfig = [
  {
    category: "Inventory Management",
    items: [

      { name: "Barcode Generator", icon: Scale, description: "Generate and print product barcodes", color: "bg-indigo-500" },
      { name: "Tray Management", icon: Package, description: "Track products in trays", color: "bg-purple-500" },
      { name: "Purchase Entry", icon: Receipt, description: "Record purchase entries", color: "bg-orange-500" }
    ]
  },
  {
    category: "Sales & Billing",
    items: [
      { name: "Sales Entry", icon: ShoppingCart, description: "Create sales with barcode scanning", color: "bg-green-500" },
      { name: "Customer Profiles", icon: Users, description: "Manage customer information", color: "bg-blue-600" },
      { name: "Rate Management", icon: TrendingUp, description: "Manage rates per gram", color: "bg-indigo-500" }
    ]
  },
  {
    category: "Reports & Analytics",
    items: [
      { name: "Sales Report", icon: TrendingUp, description: "Sales analytics and revenue tracking", color: "bg-blue-500" },
      { name: "Stock Report", icon: Package, description: "Inventory levels and stock analysis", color: "bg-green-500" },
      { name: "Purchase Report", icon: ShoppingBag, description: "Purchase analytics and cost tracking", color: "bg-purple-500" }
    ]
  }
];