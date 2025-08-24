import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Gem, Star } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    purity: string;
    weight: number;
    rate: number;
    makingCharges: number;
    barcode: string;
    wastage?: number;
  };
  onAddToBill: (product: any) => void;
}

export const ProductCard = ({ product, onAddToBill }: ProductCardProps) => {
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'Gold': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Silver': return <Gem className="w-4 h-4 text-gray-400" />;
      case 'Diamond': return <Star className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const calculateTotal = () => {
    if (product.wastage) {
      const totalWeight = product.weight + (product.weight * product.wastage) / 100;
      return totalWeight * product.rate + product.makingCharges;
    }
    return product.weight * product.rate + product.makingCharges;
  };

  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{product.name}</h4>
            {getCategoryIcon()}
          </div>
          <Badge variant={product.category === 'Gold' ? 'default' : 'outline'}>
            {product.category} {product.purity}
          </Badge>
          <p className="text-sm">Weight: {product.weight}g • Rate: ₹{product.rate}/g</p>
          <p className="text-sm">Making Charges: ₹{product.makingCharges}</p>
          {product.wastage && (
            <p className="text-sm text-orange-600">Wastage: {product.wastage}%</p>
          )}
          <p className="text-xs text-muted-foreground">Code: {product.barcode}</p>
          <p className="font-medium">Total: ₹{calculateTotal().toLocaleString()}</p>
          <Button size="sm" onClick={() => onAddToBill(product)} className="w-full">
            Add to Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};