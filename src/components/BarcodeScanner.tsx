import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Scan } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, isOpen }) => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (code.trim()) {
      onScan(code.trim().toUpperCase());
      setCode('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Product Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter barcode (SLV001, GLD001, etc.)"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!code.trim()} className="flex-1">
              <Scan className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};