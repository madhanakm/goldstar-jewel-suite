import React, { useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { useReactToPrint } from 'react-to-print';
import { Button } from './ui/button';

interface FoldLabelProps {
  barcodeValue: string;
  foldLength?: number; // cm
  printableLength?: number; // cm
  height?: number; // cm
}

export const FoldLabel: React.FC<FoldLabelProps> = ({
  barcodeValue,
  foldLength = 4,
  printableLength = 5,
  height = 1.5
}) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (barcodeRef.current && barcodeValue) {
      JsBarcode(barcodeRef.current, barcodeValue, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 16,
        fontOptions: "bold",
        font: "Arial",
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 3,
        margin: 3,
        background: "#ffffff",
        lineColor: "#000000"
      });
    }
  }, [barcodeValue]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `FoldLabel-${barcodeValue}`,
  });

  const totalWidth = foldLength + printableLength;

  return (
    <div className="space-y-4">
      <div 
        ref={printRef}
        className="border border-gray-300"
        style={{
          width: '9cm',
          height: '1.5cm',
          display: 'flex',
          margin: '0 auto'
        }}
      >
        {/* Fold Section */}
        <div 
          className="bg-gray-100 border-r border-dashed border-gray-400 flex items-center justify-center"
          style={{
            width: '4cm',
            height: '100%'
          }}
        >
          <span className="text-xs text-gray-500 rotate-90">FOLD</span>
        </div>
        
        {/* Printable Section with Barcode */}
        <div 
          className="bg-white flex items-center justify-center"
          style={{
            width: '5cm',
            height: '100%'
          }}
        >
          <svg ref={barcodeRef} style={{ maxWidth: '100%', maxHeight: '100%' }}></svg>
        </div>
      </div>
      
      <div className="text-center">
        <Button onClick={handlePrint} variant="outline">
          Print Fold Label
        </Button>
      </div>
      
      <style>{`
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          @page { margin: 0; size: 9cm 1.5cm; }
        }
      `}</style>
    </div>
  );
};