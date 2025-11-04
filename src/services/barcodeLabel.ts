export class BarcodeLabelService {
  static generateBarcodeLabel(barcode: string, productName?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Barcode Label</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; }
        .label-container { 
            width: 9cm; 
            height: 1.5cm; 
            border: 1px solid #000; 
            display: flex; 
            margin: 0;
            padding: 0;
        }
        .fold-area { 
            width: 4cm; 
            height: 100%; 
            background-color: #f9f9f9; 
            border-right: 1px dashed #ccc;
        }
        .barcode-area { 
            width: 5cm; 
            height: 100%; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            padding: 2px;
        }
        .barcode { 
            font-family: 'Libre Barcode 128', monospace; 
            font-size: 24px; 
            letter-spacing: 0; 
            line-height: 1;
        }
        .barcode-text { 
            font-size: 6px; 
            margin-top: 1px; 
            text-align: center;
        }
        @media print {
            body { margin: 0; padding: 0; }
            .label-container { margin: 0; }
            @page { margin: 0; size: 9cm 1.5cm; }
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap" rel="stylesheet">
</head>
<body>
    <div class="label-container">
        <div class="fold-area"></div>
        <div class="barcode-area">
            <div class="barcode">${barcode}</div>
            <div class="barcode-text">${barcode}</div>
        </div>
    </div>
</body>
</html>`;
  }

  static printBarcodeLabel(barcode: string, productName?: string): void {
    const html = this.generateBarcodeLabel(barcode, productName);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }
}