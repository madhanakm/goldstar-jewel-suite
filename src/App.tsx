import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { ErrorBoundary } from "./components/common";
import { Dashboard } from "./components/Dashboard";
import { CustomerManagement } from "./components/CustomerManagement";
import { InventoryManagement } from "./components/InventoryManagement";
import { SalesBilling } from "./components/SalesBilling";
import { SilverSpecialBilling } from "./components/SilverSpecialBilling";
import { PurchaseManagement } from "./components/PurchaseManagement";
import { PurchaseEntry } from "./components/PurchaseEntry";
import { FinancialModules } from "./components/FinancialModules";
import { AnalyticsReports } from "./components/AnalyticsReports";
import { ProductManagementModule } from "./components/ProductManagementModule";
import { SimpleProductManagement } from "./components/SimpleProductManagement";
import { ProductModule } from "./components/ProductModule";
import { ProductModuleWithBarcode } from "./components/ProductModuleWithBarcode";
import { LockerRoomManagement } from "./components/LockerRoomManagement";
import { BarcodeGenerator } from "./components/BarcodeGenerator";
import { SalesEntry } from "./components/SalesEntry";
import { SalesReport } from "./components/SalesReport";
import { StockReport } from "./components/StockReport";
import { PurchaseReport } from "./components/PurchaseReport";
import { TrayManagement } from "./components/TrayManagement";
import { TrayAdd } from "./components/TrayAdd";
import { RateManagement } from "./components/RateManagement";
import { useState, useEffect } from "react";
import { authService } from "./lib/auth";
import { ROUTES } from "./constants";
import { LoginPage } from "./features/auth/components/LoginPage";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      setIsLoading(false);
      
      // Redirect to dashboard if authenticated and on root path
      if (isAuth && window.location.pathname === '/') {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    };
    
    // Initial check
    checkAuth();
    
    // Check session every minute
    const interval = setInterval(() => {
      const isAuth = authService.isAuthenticated();
      if (!isAuth && isAuthenticated) {
        setIsAuthenticated(false);
        navigate(ROUTES.HOME);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (type: string) => {
    setIsAuthenticated(true);
    navigate(ROUTES.DASHBOARD);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      toast({
        title: "✅ Logout Successful",
        description: "You have been logged out successfully",
      });
      navigate(ROUTES.HOME);
    } catch (error) {
      toast({
        title: "❌ Logout Failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (module: string) => {
    switch (module) {
      case "Dashboard":
        navigate('/dashboard');
        break;
      case "Customer Profiles":
      case "Add Customer":
      case "KYC Management":
      case "Purchase History":
      case "Loyalty & Referrals":
        navigate('/customer-management');
        break;
      case "Inventory Management":
      case "Stock Tracking":
      case "Barcode System":
      case "Real-time Updates":
      case "Product Inventory":
      case "Stock Management":
        navigate('/product-module');
        break;
      case "Product Catalog":
      case "Product Categories":
      case "Pricing Management":
      case "Product Variants":
      case "Add Product":
      case "New Product":
        navigate('/simple-product-management');
        break;
      case "Barcode Generation":
      case "Barcode Generator":
        navigate('/barcode-generator');
        break;
      case "Locker Room Management":
        navigate('/locker-room-management');
        break;
      case "Stock Check":
        navigate('/inventory-management');
        break;
      case "Sales Billing":
      case "Retail Billing":
      case "Invoice Generation":
      case "Quotation Management":
      case "Making Charges":
      case "Old Gold Exchange":
      case "Payment Methods":
        navigate('/sales-billing');
        break;
      case "New Sale":
      case "Sales Entry":
        navigate('/sales-entry');
        break;
      case "Sales Reports":
      case "Sales Report":
        navigate('/sales-report');
        break;
      case "Stock Report":
        navigate('/stock-report');
        break;
      case "Purchase Report":
        navigate('/purchase-report');
        break;
      case "Tray Management":
        navigate('/tray-management');
        break;
      case "Add Tray":
        navigate('/tray-add');
        break;
      case "Rate Management":
        navigate('/rate-management');
        break;
      case "Silver Billing":
      case "Silver Sales":
      case "Silver Exchange":
        navigate('/silver-billing');
        break;
      case "Purchase Orders":
      case "Vendor Management":
      case "Raw Material Inward":
        navigate('/purchase-management');
        break;
      case "Purchase Entry":
        navigate('/purchase-entry');
        break;
      case "Gold Loan":
      case "Gold Loan Management":
      case "Advance Booking":
      case "GST Reports":
      case "Accounting":
        navigate('/financial-modules');
        break;
      case "Business Dashboard":
      case "Stock Reports":
      case "Customer Analytics":
      case "Performance Metrics":
      case "Business Analytics":
      case "Sales Reports":
      case "Daily Report":
        navigate('/analytics-reports');
        break;
      default:
        alert(`${module} module coming soon!`);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.DASHBOARD);
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

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard onLogout={handleLogout} onNavigate={handleNavigate} />} />
      <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} onNavigate={handleNavigate} />} />
      <Route path="/customer-management" element={<CustomerManagement onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/inventory-management" element={<InventoryManagement onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/sales-billing" element={<SalesBilling onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/silver-billing" element={<SilverSpecialBilling onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/purchase-management" element={<PurchaseManagement onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/purchase-entry" element={<PurchaseEntry onBack={handleBack} onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/financial-modules" element={<FinancialModules onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/analytics-reports" element={<AnalyticsReports onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/product-management" element={<ProductManagementModule onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/simple-product-management" element={<SimpleProductManagement onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/product-module" element={<ProductModuleWithBarcode onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/add-product" element={<ProductModule onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="/barcode-generator" element={<BarcodeGenerator onBack={handleBack} onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/sales-entry" element={<SalesEntry onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/sales-report" element={<SalesReport onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/stock-report" element={<StockReport onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/purchase-report" element={<PurchaseReport onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/tray-management" element={<TrayManagement onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/tray-add" element={<TrayAdd onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/rate-management" element={<RateManagement onNavigate={handleNavigate} onLogout={handleLogout} />} />
      <Route path="/locker-room-management" element={<LockerRoomManagement onBack={handleBack} onNavigate={handleNavigate} />} />
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1>Page Not Found</h1></div>} />
    </Routes>
  );
};

import { Toaster } from "@/components/ui/toaster";

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <AppContent />
      <Toaster />
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;