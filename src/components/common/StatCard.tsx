import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  color?: string;
}

export const StatCard = ({ label, value, icon: Icon, change, color = "text-primary" }: StatCardProps) => {
  const isPositive = change?.startsWith('+');
  
  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50/50">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="relative p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2">{label}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 truncate">{value}</p>
            {change && (
              <div className={cn(
                "inline-flex items-center text-xs sm:text-sm font-medium px-2 py-1 rounded-full",
                isPositive 
                  ? 'text-emerald-700 bg-emerald-100/80' 
                  : 'text-red-700 bg-red-100/80'
              )}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {change}
              </div>
            )}
          </div>
          <div className="ml-3 sm:ml-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};