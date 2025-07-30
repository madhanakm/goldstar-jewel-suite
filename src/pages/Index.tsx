import { useState, useEffect } from "react";
import { LoginPage } from "@/components/LoginPage";
import { Dashboard } from "@/components/Dashboard";
import { authService } from "@/lib/auth";
import { CustomerManagement } from "@/components/CustomerManagement";
import { InventoryManagement } from "@/components/InventoryManagement";
import { SalesBilling } from "@/components/SalesBilling";
import { SilverSpecialBilling } from "@/components/SilverSpecialBilling";
import { PurchaseManagement } from "@/components/PurchaseManagement";
import { FinancialModules } from "@/components/FinancialModules";
import { AnalyticsReports } from "@/components/AnalyticsReports";
import { BarcodeModule } from "@/components/BarcodeModule";
import { ProductModuleWithBarcode } from "@/components/ProductModuleWithBarcode";
import { ProductModule } from "@/components/ProductModule";
import { SimpleProductManagement } from "@/components/SimpleProductManagement";
import { ProductManagementModule } from "@/components/ProductManagementModule";
import { LockerRoomManagement } from "@/components/LockerRoomManagement";

const Index = () => {
  const [currentView, setCurrentView] = useState<"login" | "dashboard" | string>("login");
  const [userType, setUserType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    if (authService.isAuthenticated()) {
      setUserType("admin");
      setCurrentView("dashboard");
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (type: string) => {
    setUserType(type);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentView("login");
    setUserType("");
  };

  const handleNavigate = (module: string) => {
    switch (module) {
      case "Customer Profiles":
      case "Add Customer":
      case "KYC Management":
      case "Purchase History":
      case "Loyalty & Referrals":
        setCurrentView("customer-management");
        break;
      case "Inventory Management":
      case "Stock Tracking":
      case "Barcode System":
      case "Real-time Updates":
      case "Product Inventory":
      case "Stock Management":
        setCurrentView("product-module");
        break;
      case "Product Catalog":
      case "Product Categories":
      case "Pricing Management":
      case "Product Variants":
      case "Add Product":
      case "Barcode Generation":
      case "New Product":
        setCurrentView("simple-product-management");
        break;
      case "Locker Room Management":
        setCurrentView("locker-room-management");
        break;
      case "Stock Check":
        setCurrentView("inventory-management");
        break;
      case "Sales Billing":
      case "Retail Billing":
      case "Invoice Generation":
      case "Quotation Management":
      case "Making Charges":
      case "Old Gold Exchange":
      case "Payment Methods":
      case "New Sale":
        setCurrentView("sales-billing");
        break;
      case "Silver Billing":
      case "Silver Sales":
      case "Silver Exchange":
        setCurrentView("silver-billing");
        break;
      case "Purchase Orders":
      case "Vendor Management":
      case "Raw Material Inward":
        setCurrentView("purchase-management");
        break;
      case "Gold Loan":
      case "Gold Loan Management":
      case "Advance Booking":
      case "GST Reports":
      case "Accounting":
        setCurrentView("financial-modules");
        break;
      case "Business Dashboard":
      case "Stock Reports":
      case "Customer Analytics":
      case "Performance Metrics":
      case "Business Analytics":
      case "Sales Reports":
      case "Daily Report":
        setCurrentView("analytics-reports");
        break;
      default:
        alert(`${module} module coming soon!`);
    }
  };

  const handleBack = () => {
    setCurrentView("dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentView === "dashboard") {
    return <Dashboard onLogout={handleLogout} onNavigate={handleNavigate} />;
  }

  if (currentView === "customer-management") {
    return <CustomerManagement onBack={handleBack} />;
  }

  if (currentView === "inventory-management") {
    return <InventoryManagement onBack={handleBack} />;
  }

  if (currentView === "sales-billing") {
    return <SalesBilling onBack={handleBack} />;
  }

  if (currentView === "silver-billing") {
    return <SilverSpecialBilling onBack={handleBack} />;
  }

  if (currentView === "purchase-management") {
    return <PurchaseManagement onBack={handleBack} />;
  }

  if (currentView === "financial-modules") {
    return <FinancialModules onBack={handleBack} />;
  }

  if (currentView === "analytics-reports") {
    return <AnalyticsReports onBack={handleBack} />;
  }

  if (currentView === "barcode-module") {
    return <BarcodeModule onBack={handleBack} />;
  }

  if (currentView === "product-module") {
    return <ProductModuleWithBarcode onBack={handleBack} />;
  }

  if (currentView === "simple-product-management") {
    return <ProductManagementModule onBack={handleBack} />;
  }

  if (currentView === "add-product") {
    return <ProductModule onBack={handleBack} />;
  }

  if (currentView === "locker-room-management") {
    return <LockerRoomManagement onBack={handleBack} />;
  }

  return null;
};

export default Index;
