import { useState } from "react";
import { LoginPage } from "@/components/LoginPage";
import { Dashboard } from "@/components/Dashboard";
import { CustomerManagement } from "@/components/CustomerManagement";

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
    if (module === "Customer Profiles" || module === "Add Customer") {
      setCurrentView("customer-management");
    } else {
      // For now, just show an alert for other modules
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

  return null;
};

export default Index;
