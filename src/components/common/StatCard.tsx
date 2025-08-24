import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  color?: string;
}

export const StatCard = ({ label, value, icon: Icon, change, color = "text-primary" }: StatCardProps) => {
  return (
    <Card className="border-luxury-gold/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-luxury-dark">{value}</p>
            {change && (
              <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {change} from last month
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};