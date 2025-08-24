import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, Home, ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  onMenuClick?: () => void;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  icon?: ReactNode;
}

export const PageHeader = ({ title, description, onBack, onMenuClick, breadcrumbs, actions, icon }: PageHeaderProps) => {
  return (
    <header className="bg-card shadow-sm border-b border-luxury-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {onMenuClick && (
              <Button variant="ghost" size="sm" onClick={onMenuClick} className="mr-3">
                <Menu className="w-5 h-5" />
              </Button>
            )}
            {onBack && !onMenuClick && (
              <Button variant="ghost" onClick={onBack} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {icon}
            <h1 className="text-xl font-semibold text-luxury-dark">{title}</h1>
          </div>
          {actions && <div className="flex items-center space-x-4">{actions}</div>}
        </div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center space-x-2 px-4 pb-3 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronRight className="w-4 h-4" />
                {crumb.onClick ? (
                  <button onClick={crumb.onClick} className="hover:text-primary">
                    {crumb.label}
                  </button>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <p className="text-muted-foreground">{description}</p>
        </div>
      )}
    </header>
  );
};