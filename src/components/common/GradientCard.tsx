import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  hover?: boolean;
}

export const GradientCard = ({ 
  children, 
  className, 
  title, 
  description, 
  icon, 
  hover = true 
}: GradientCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/50",
      hover && "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      {(title || description || icon) && (
        <CardHeader className="relative">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                {icon}
              </div>
            )}
            <div>
              {title && <CardTitle className="text-slate-800">{title}</CardTitle>}
              {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="relative">
        {children}
      </CardContent>
    </Card>
  );
};