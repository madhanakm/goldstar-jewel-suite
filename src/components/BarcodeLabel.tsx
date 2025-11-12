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
        <div 
          className="border p-4 bg-white text-black text-center"
          style={{
            width: '50mm',
            height: '25mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '8px'
          }}
        >
          <h3 className="font-bold text-xs">{product.name}</h3>
          <p className="text-xs">SKU: {product.sku}</p>
          <div 
            className="my-1 font-mono font-bold"
            style={{
              fontSize: '10px',
              letterSpacing: '1px',
              fontFamily: 'Courier New, monospace',
              backgroundColor: '#000',
              color: '#fff',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
          >
            {product.barcode}
          </div>
          <p className="font-semibold text-xs">₹{product.price}</p>
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