import { useState, useEffect, useCallback } from 'react';

interface UseBarcodeScanner {
  onScan: (barcode: string) => void;
  minLength?: number;
  timeout?: number;
}

export const useBarcodeScanner = ({ onScan, minLength = 8, timeout = 100 }: UseBarcodeScanner) => {
  const [buffer, setBuffer] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastKeyTime;

    // If time between keystrokes is very short (< 50ms), it's likely a barcode scanner
    const isRapidInput = timeDiff < 50 && timeDiff > 0;
    
    if (event.key === 'Enter') {
      if (buffer.length >= minLength) {
        onScan(buffer.trim());
        setBuffer('');
      }
      return;
    }

    // Only capture alphanumeric characters and some symbols
    if (/^[a-zA-Z0-9\-_]$/.test(event.key)) {
      if (isRapidInput || buffer.length === 0) {
        setBuffer(prev => prev + event.key);
      } else {
        // Reset buffer if typing is too slow (manual input)
        setBuffer(event.key);
      }
      setLastKeyTime(currentTime);

      // Auto-clear buffer after timeout
      setTimeout(() => {
        setBuffer('');
      }, timeout * 10);
    }
  }, [buffer, lastKeyTime, minLength, onScan, timeout]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    buffer,
    clearBuffer: () => setBuffer('')
  };
};

// Enhanced input component for barcode scanning
export const BarcodeInput = ({ 
  value, 
  onChange, 
  onBarcodeScanned, 
  placeholder = "Enter barcode or search...",
  className = "",
  ...props 
}: {
  value: string;
  onChange: (value: string) => void;
  onBarcodeScanned?: (barcode: string) => void;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) => {
  const [inputBuffer, setInputBuffer] = useState('');
  const [lastInputTime, setLastInputTime] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastInputTime;

    onChange(newValue);
    setInputBuffer(newValue);
    setLastInputTime(currentTime);

    // If input is rapid and long enough, treat as barcode
    if (newValue.length >= 8 && timeDiff < 100) {
      setTimeout(() => {
        if (newValue === inputBuffer && onBarcodeScanned) {
          onBarcodeScanned(newValue);
          onChange(''); // Clear after scanning
        }
      }, 150);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      if (onBarcodeScanned) {
        onBarcodeScanned(value.trim());
        onChange('');
      }
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};