interface EstimationItem {
  id: string;
  itemName: string;
  purity: string;
  quantity: number;
  weight: number;
  makingCharges: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

interface EstimationData {
  estimationNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  date: string;
  silverRate: number;
  items: EstimationItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export class EstimationService {
  private static numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };

    let result = '';
    let groupIndex = 0;
    
    while (num > 0) {
      const group = num % (groupIndex === 0 ? 1000 : 100);
      if (group !== 0) {
        result = convertHundreds(group) + thousands[groupIndex] + ' ' + result;
      }
      num = Math.floor(num / (groupIndex === 0 ? 1000 : 100));
      groupIndex++;
    }

    return result.trim() + ' Rupees Only';
  }

  static generateEstimationHTML(estimation: EstimationData, logoBase64: string = ''): string {
    console.log('Estimation items:', estimation.items);
    
    // Generate items rows
    const itemsHTML = estimation.items.map((item, index) => {
      // Hide weight for fixed price products (weight = 0)
      const weightDisplay = (item.weight && item.weight > 0) ? `${item.weight}g` : '-';
      
      return `
      <tr>
        <td style="border-right: 1px solid #000; width: 8%; padding: 1px; font-size: 9px;">${index + 1}</td>
        <td style="border-right: 1px solid #000; width: 50%; padding: 1px; text-align: left; font-size: 9px;" colspan="5">${item.itemName} (${item.purity || '-'})</td>
        <td style="border-right: 1px solid #000; width: 8%; padding: 1px; font-size: 9px;">${item.quantity}</td>
        <td style="border-right: 1px solid #000; width: 12%; padding: 1px; font-size: 9px;">${weightDisplay}</td>
        <td style="border-right: 1px solid #000; width: 12%; padding: 1px; font-size: 9px;">${item.discountAmount ? '₹' + parseFloat(item.discountAmount).toFixed(2) : '-'}</td>
        <td style="width: 12%; padding: 1px; font-size: 10px;">₹${item.total.toLocaleString()}</td>
      </tr>
      `;
    }).join('');
    
    // Generate empty rows to fill space
    const maxRows = 25; // Maximum rows that can fit
    const emptyRowsCount = Math.max(0, maxRows - estimation.items.length);
    const emptyRowsHTML = Array(emptyRowsCount).fill(0).map(() => `
      <tr>
        <td style="border-right: 1px solid #000; width: 8%; padding: 1px; font-size: 9px;">&nbsp;</td>
        <td style="border-right: 1px solid #000; width: 50%; padding: 1px;" colspan="5">&nbsp;</td>
        <td style="border-right: 1px solid #000; width: 8%; padding: 1px;">&nbsp;</td>
        <td style="border-right: 1px solid #000; width: 12%; padding: 1px;">&nbsp;</td>
        <td style="border-right: 1px solid #000; width: 12%; padding: 1px;">&nbsp;</td>
        <td style="width: 10%; padding: 1px;">&nbsp;</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prabanjam Jewellery Estimation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10px; }
        /* .invoice-container { width: 135mm; height: 200mm; margin: 0 auto; padding: 3mm; } */
        .invoice-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        .invoice-table td { padding: 2px 3px; text-align: center; }
        .logo { width: 90%; filter: grayscale(100%); }
        .estimation-badge { color: #fff; background-color: #007bff; padding: 2px 6px; border-radius: 5px; font-size: 8px; }
        @media print {
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
            .invoice-container { width: 210mm; height: 297mm; padding: 5mm; margin: 0; }
            @page { margin: 0; size: A4; }
            /* .invoice-container { width: 135mm; height: 200mm; padding: 5mm; margin: 0; }
            @page { margin: 5mm; size: 145mm 210mm; } */
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <table class="invoice-table">
            <tr style="font-weight: bold">
                <td style="border-left: none; border-bottom: none; border-right: none; text-align: left; font-size: 9px; white-space: nowrap; width: 20%;" colspan="2">98422 44014</td>
                <td colspan="6" style="text-align: center; font-size: 9px; vertical-align: middle; width: 60%;">நடப்பது யாவும் நன்மைக்கே</td>
                <td style="text-align: right; font-size: 9px; white-space: nowrap; width: 20%;" colspan="2">90478 07888</td>
            </tr>
            <tr><td colspan="10"><img src="${logoBase64}" alt="Logo" class="logo"></td></tr>
            <tr style="font-weight: bold">
                <td style="text-align: left; font-size: 9px; width: 20%;" colspan="2">EST-No: ${estimation.estimationNumber}</td>
                <td colspan="6" style="text-align: center; width: 60%;"><span class="estimation-badge" style="font-size: 10px; padding: 3px 8px; white-space: nowrap; display: inline-block;">Price Estimation</span></td>
                <td colspan="2" style="text-align: right; font-size: 9px; white-space: nowrap; width: 20%;"></td>
            </tr>
            <tr><td colspan="10" style="font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; font-size: 8px; padding: 1px;">NO-1, BRINDHAVAN GARDEN, BHARATHIYAR ROAD,MANIYAKARANPALAYAM , GANAPATHY, CBE-06.CELL : 98422 44014</td></tr>
            <tr>
                <td style="text-align: left; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 1px; font-size: 9px; width: 50%;" colspan="5"><strong>Name:</strong> ${estimation.customer.name}</td>
                <td style="text-align: left; border-bottom: 1px solid #000; padding: 1px; font-size: 9px; width: 50%;" colspan="5"><strong>Date:</strong> ${new Date(estimation.date).toLocaleDateString('en-GB')}</td>
            </tr>
            <tr><td style="text-align: left; border-bottom: 1px solid #000; padding: 1px; font-size: 9px;" colspan="10"><strong>Customer Details:</strong> ${estimation.customer.address}</td></tr>
            <tr>
                <td style="text-align: left; border-bottom: 1px solid #000; padding: 1px; font-size: 9px; width: 100%;" colspan="10"><strong>Mobile:</strong> ${estimation.customer.phone}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #f5f5f5;">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%;">S. No</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 50%;" colspan="5">Description</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%;">QTY</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 12%;">Weight</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 12%;">Disc Amt</td>
                <td style="border-bottom: 1px solid #000; width: 10%;">Amount</td>
            </tr>
            ${itemsHTML}
            ${emptyRowsHTML}
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; text-align: left; padding: 1px; font-weight: bold; font-size: 8px; width: 80%;" rowspan="3" colspan="8"><strong>Amount in Words:</strong> ${this.numberToWords(Math.round(estimation.total))}</td>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; padding: 1px; font-size: 8px; text-align: right; width: 12%;">Sub Total:</td>
                <td style="border-top: 1px solid #000; padding: 1px; font-size: 8px; text-align: right; width: 8%;">₹${estimation.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; padding: 1px; font-size: 8px; text-align: right;">Round Off:</td>
                <td style="border-top: 1px solid #000; padding: 1px; font-size: 8px; text-align: right;">₹${(estimation.roundoff || 0).toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; padding: 1px; font-weight: bold; font-size: 8px; text-align: right;"><strong>Total:</strong></td>
                <td style="border-top: 1px solid #000; padding: 1px; font-size: 8px; text-align: right; font-weight: bold;">₹${estimation.total.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; width: 50%;" colspan="5">Weight & Pieces Verified Found O.K</td>
                <td style="border-top: 1px solid #000; white-space: nowrap; width: 50%;" colspan="5">For PRABANJAM JEWELLERY LIMITED</td>
            </tr>
            <tr><td colspan="10" style="height: 30px; width: 100%;"></td></tr>
            <tr>
                <td colspan="5" style="width: 50%;">Customer Signature</td>
                <td colspan="5" style="width: 50%;">Authorised Signature</td>
            </tr>
            <tr>
                <td colspan="5" style="text-align: center; color: red; font-weight: bold; padding: 2px; width: 50%;">தங்கள் வருகைக்கு நன்றி, மீண்டும் வருக!</td>
                <td colspan="5" style="text-align: center; font-style: italic; color: #666; width: 50%;">*This is an estimation only</td>
            </tr>
        </table>
    </div>
</body>
</html>`;
  }

  static async printEstimation(estimation: EstimationData): Promise<void> {
    let logoBase64 = '';
    try {
      const response = await fetch('https://jewelapi.sricashway.com/api/logos');
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        logoBase64 = data.data[0].logo;
      }
    } catch (error) {
      console.warn('Failed to fetch logo:', error);
    }
    
    const html = this.generateEstimationHTML(estimation, logoBase64);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for images to load before printing (Chrome fix)
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  }
}