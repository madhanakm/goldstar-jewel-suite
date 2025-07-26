import { useState } from "react";
import { LoginPage } from "@/components/LoginPage";
import { Dashboard } from "@/components/Dashboard";
import { CustomerManagement } from "@/components/CustomerManagement";
import { InventoryManagement } from "@/components/InventoryManagement";
import { SalesBilling } from "@/components/SalesBilling";
import { PurchaseManagement } from "@/components/PurchaseManagement";
import { FinancialModules } from "@/components/FinancialModules";
import { AnalyticsReports } from "@/components/AnalyticsReports";

const Index = () => {
  const [currentView, setCurrentView] = useState<"login" | "dashboard" | string>("login");
  const [userType, setUserType] = useState<string>("");

  const handleLogin = (type: string) => {
    setUserType(type);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setCurrentView("login");
    setUserType("");
  };

  const handleNavigate = (module: string) => {
    switch (module) {
      case "Customer Profiles":
      case "Add Customer":
        setCurrentView("customer-management");
        break;
      case "Product Inventory":
      case "Stock Management":
      case "Barcode Generation":
        setCurrentView("inventory-management");
        break;
      case "Sales Billing":
      case "Invoice Generation":
      case "Quotation Management":
        setCurrentView("sales-billing");
        break;
      case "Purchase Orders":
      case "Vendor Management":
      case "Raw Material Inward":
        setCurrentView("purchase-management");
        break;
      case "Gold Loan Management":
      case "Advance Booking":
      case "GST Reports":
      case "Accounting":
        setCurrentView("financial-modules");
        break;
      case "Business Analytics":
      case "Sales Reports":
      case "Stock Reports":
        setCurrentView("analytics-reports");
        break;
      default:
        alert(`${module} module coming soon!`);
    }
  };

  const handleBack = () => {
    setCurrentView("dashboard");
  };

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

  if (currentView === "purchase-management") {
    return <PurchaseManagement onBack={handleBack} />;
  }

  if (currentView === "financial-modules") {
    return <FinancialModules onBack={handleBack} />;
  }

  if (currentView === "analytics-reports") {
    return <AnalyticsReports onBack={handleBack} />;
  }

  return null;
};

export default Index;
