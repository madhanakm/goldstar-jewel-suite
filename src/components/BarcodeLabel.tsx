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
          className="border p-4 bg-white text-black text-center print-area"
          style={{
            width: '50mm',
            height: '25mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '20px'
          }}
        >
          <h3 className="font-bold" style={{fontSize: '28px', lineHeight: '1.1', color: '#000', margin: '1mm 0'}}>{product.name}</h3>
          <p style={{fontSize: '22px', margin: '1mm 0', color: '#000', fontWeight: 'bold'}}>SKU: {product.sku}</p>
          <div 
            className="my-1 font-mono font-bold"
            style={{
              fontSize: '24px',
              letterSpacing: '3px',
              fontFamily: 'Courier New, monospace',
              backgroundColor: '#000',
              color: '#fff',
              padding: '2mm 3mm',
              borderRadius: '1mm',
              minHeight: '8mm',
              border: '2px solid #000'
            }}
          >
            {product.barcode}
          </div>
          <p className="font-semibold" style={{fontSize: '22px', margin: '1mm 0', color: '#000', fontWeight: 'bold'}}>₹{product.price}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        <style>{`
          @media print {
            * { margin: 0; padding: 0; }
            body { margin: 0; padding: 0; }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { 
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 5px !important;
              transform: none !important;
              box-sizing: border-box !important;
            }
            @page { 
              margin: 0;
              size: 55mm 25mm;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
      </CardContent>
    </Card>
  );
};