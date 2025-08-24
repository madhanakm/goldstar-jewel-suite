import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface BarcodeLabelProps {
  product?: {
    name: string;
    sku: string;
    barcode: string;
    price: number;
  };
}

export const BarcodeLabel = ({ product }: BarcodeLabelProps) => {
  if (!product) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          No product selected for label generation
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barcode Label</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border p-4 bg-white text-black text-center">
          <h3 className="font-bold">{product.name}</h3>
          <p className="text-sm">SKU: {product.sku}</p>
          <div className="my-2 font-mono text-lg">||||| {product.barcode} |||||</div>
          <p className="font-semibold">₹{product.price}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};