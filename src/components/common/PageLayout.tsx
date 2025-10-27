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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-yellow-50/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-yellow-100/20" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

interface PageContentProps {
  children: ReactNode;
}

export const PageContent = ({ children }: PageContentProps) => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
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