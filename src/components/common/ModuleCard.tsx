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
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-luxury-gold/20 hover:border-luxury-gold/40"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">{name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};