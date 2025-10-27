import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ModuleCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

export const ModuleCard = ({ name, description, icon: Icon, color, onClick }: ModuleCardProps) => {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50/50 hover:from-amber-50/50 hover:to-yellow-50/50 transform hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
              {name}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600 line-clamp-2">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};