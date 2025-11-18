import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({ isOpen, onScan, onClose }: BarcodeScannerProps) => {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  // Handle barcode scanner input (rapid character input)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  // Auto-submit when barcode scanner sends Enter after rapid input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualCode(value);
    
    // If input length suggests barcode scanner (typically 8-20 characters)
    if (value.length >= 8 && !isScanning) {
      setIsScanning(true);
      // Auto-submit after short delay to catch Enter key
      setTimeout(() => {
        if (value.trim() && value === manualCode) {
          handleManualSubmit();
        }
        setIsScanning(false);
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Camera scanner not available</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter barcode manually:</label>
            <div className="flex gap-2">
              <Input
                value={manualCode}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter barcode or product ID"
                autoFocus
              />
              <Button onClick={handleManualSubmit}>Add</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};