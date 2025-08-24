import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, Home, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <header className="relative bg-gradient-to-r from-amber-50 via-white to-amber-50 border-b border-amber-200/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5" />
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2">
          <div className="flex items-center min-w-0 flex-1">
            {onMenuClick && (
              <Button variant="ghost" size="sm" onClick={onMenuClick} className="mr-2 sm:mr-3 hover:bg-amber-100/50">
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
            {onBack && !onMenuClick && (
              <Button variant="ghost" onClick={onBack} className="mr-2 sm:mr-4 hover:bg-amber-100/50 text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <div className="flex items-center min-w-0">
              {icon && <div className="mr-2 sm:mr-3 text-amber-600">{icon}</div>}
              <div className="min-w-0">
                <h1 className={cn(
                  "font-bold text-slate-800 truncate",
                  "text-lg sm:text-xl lg:text-2xl",
                  "bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent"
                )}>
                  {title}
                </h1>
                {description && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2 sm:space-x-4 ml-2">
              {actions}
            </div>
          )}
        </div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center space-x-1 sm:space-x-2 pb-3 text-xs sm:text-sm text-slate-500 overflow-x-auto">
            <Home className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                {crumb.onClick ? (
                  <button 
                    onClick={crumb.onClick} 
                    className="hover:text-amber-600 transition-colors whitespace-nowrap"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-slate-700 font-medium whitespace-nowrap">{crumb.label}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};