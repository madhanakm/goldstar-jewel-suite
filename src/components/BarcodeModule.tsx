import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarcodeGenerator } from '../lib/barcodeGenerator';
import { BarcodeLabel } from './BarcodeLabel';
import { BarcodeLabelService } from '@/services/barcodeLabel';
import { FoldLabel } from './FoldLabel';

interface JewelryItem {
  id: string;
  name: string;
  weight: string;
  purity: string;
  price: string;
}

interface BarcodeModuleProps {
  onBack?: () => void;
}

export const BarcodeModule: React.FC<BarcodeModuleProps> = ({ onBack }) => {
  const [item, setItem] = useState<JewelryItem>({
    id: '',
    name: '',
    weight: '',
    purity: '',
    price: ''
  });
  const [generatedBarcode, setGeneratedBarcode] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Barcode-${item.id}`,
  });

  const generateBarcode = () => {
    if (!item.id) return;
    const barcode = BarcodeGenerator.generate(item.id);
    setGeneratedBarcode(barcode);
  };

  const handleInputChange = (field: keyof JewelryItem, value: string) => {
    setItem(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Jewelry Barcode Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id">Item ID</Label>
              <Input
                id="id"
                value={item.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                placeholder="Enter item ID"
              />
            </div>
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={item.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (grams)</Label>
              <Input
                id="weight"
                value={item.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter weight"
              />
            </div>
            <div>
              <Label htmlFor="purity">Purity</Label>
              <Input
                id="purity"
                value={item.purity}
                onChange={(e) => handleInputChange('purity', e.target.value)}
                placeholder="e.g., 22K, 18K"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={item.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter price"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {onBack && (
              <Button onClick={onBack} variant="outline">
                Back
              </Button>
            )}
            <Button onClick={generateBarcode} disabled={!item.id}>
              Generate Barcode
            </Button>
            <Button onClick={handlePrint} disabled={!generatedBarcode} variant="outline">
              Print Label
            </Button>
            <Button 
              onClick={() => BarcodeLabelService.printBarcodeLabel(generatedBarcode, item.name)} 
              disabled={!generatedBarcode} 
              variant="secondary"
            >
              Fold Type Label
            </Button>
          </div>

          {generatedBarcode && (
            <div className="space-y-6">
              <div ref={printRef}>
                <BarcodeLabel product={{
                  name: item.name,
                  sku: item.id,
                  barcode: generatedBarcode,
                  price: parseFloat(item.price) || 0
                }} />
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Fold-Type Label Preview</h3>
                <FoldLabel barcodeValue={generatedBarcode} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};