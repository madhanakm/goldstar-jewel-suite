import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";

interface SidebarItem {
  name: string;
  icon: any;
  description: string;
  color: string;
}

interface SidebarCategory {
  category: string;
  items: SidebarItem[];
}

interface PageLayoutProps {
  children: ReactNode;
  sidebarCategories?: SidebarCategory[];
  onNavigate?: (module: string) => void;
}

export const PageLayout = ({ children, sidebarCategories, onNavigate }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-background to-luxury-cream">
      {children}
    </div>
  );
};

interface PageContentProps {
  children: ReactNode;
}

export const PageContent = ({ children }: PageContentProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  );
};

// Hook to get sidebar state
export const useSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen)
  };
};

// Sidebar wrapper component
interface SidebarWrapperProps {
  categories: SidebarCategory[];
  onNavigate: (module: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarWrapper = ({ categories, onNavigate, isOpen, onToggle }: SidebarWrapperProps) => {
  return (
    <Sidebar 
      categories={categories.map(category => ({
        ...category,
        items: category.items.map(item => ({
          ...item,
          onClick: () => {
            onNavigate(item.name);
            onToggle();
          }
        }))
      }))}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
};