import { Invoice, InvoiceTemplate } from '@/types/invoice';

export class InvoiceService {
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

  static mapInvoiceToTemplate(invoice: Invoice): InvoiceTemplate {
    const sgst = invoice.gst.total / 2;
    const cgst = invoice.gst.total / 2;

    return {
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customer.name,
      customerAddress: invoice.customer.address || '',
      customerPhone: invoice.customer.phone,
      customerGstin: invoice.customer.gstin || '',
      silverRate: invoice.silverRate || 0,
      date: new Date(invoice.date).toLocaleDateString('en-GB'),
      items: invoice.items,
      subtotal: invoice.subtotal,
      sgst,
      cgst,
      roundoff: invoice.roundoff || 0,
      total: invoice.total,
      amountInWords: this.numberToWords(Math.floor(invoice.total))
    };
  }

  static generateInvoiceHTML(invoice: Invoice, logoBase64: string = ''): string {
    const template = this.mapInvoiceToTemplate(invoice);
    
    // Generate items rows with updated column widths
    const itemsHTML = template.items.map((item, index) => {
      // Hide weight for fixed price products (weight = 0)
      const weightDisplay = (item.weight && item.weight > 0) ? `${item.weight}g` : '-';
      
      return `
      <tr>
        <td style="border-right: 1px solid #000; padding: 2px; font-size: 12px;">${index + 1}</td>
        <td style="border-right: 1px solid #000; padding: 2px; text-align: left; font-size: 12px;" colspan="5">${item.itemName} (${item.purity || '-'})</td>
        <td style="border-right: 1px solid #000; padding: 2px; font-size: 12px;">${item.quantity}</td>
        <td style="border-right: 1px solid #000; padding: 2px; font-size: 12px;">${weightDisplay}</td>
        <td style="border-right: 1px solid #000; padding: 2px; font-size: 12px;">${item.discountAmount ? '₹' + item.discountAmount.toFixed(2) : '-'}</td>
        <td style="border-left: 1px solid #000; padding: 2px; font-size: 12px;">₹${item.total.toLocaleString()}</td>
      </tr>
      `;
    }).join('');
    
    // Generate empty rows to fill space
    const maxRows = 25; // Maximum rows that can fit
    const emptyRowsCount = Math.max(0, maxRows - template.items.length);
    const emptyRowsHTML = Array(emptyRowsCount).fill(0).map(() => `
      <tr>
        <td style="border-right: 1px solid #000; padding: 2px; font-size: 12px;">&nbsp;</td>
        <td style="border-right: 1px solid #000; padding: 2px;" colspan="5">&nbsp;</td>
        <td style="border-right: 1px solid #000; padding: 2px;">&nbsp;</td>
        <td style="border-right: 1px solid #000; padding: 2px;">&nbsp;</td>
        <td style="border-right: 1px solid #000; padding: 2px;">&nbsp;</td>
        <td style="border-left: 1px solid #000; padding: 2px;">&nbsp;</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prabanjam Jewellery Invoice</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10px; }
        .invoice-container { width: 210mm; height: 297mm; margin: 0 auto; padding: 5mm; }
        .invoice-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        .invoice-table td { padding: 2px 3px; text-align: center; }
        .logo { width: 90%; }
        .tax-badge { color: #fff; background-color: #000; padding: 2px 6px !important; display:inline-block; border-radius: 5px; font-size: 8px; }
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
                <td style="border-left: none; border-bottom: none; border-right: none; text-align: left; font-size: 12px; white-space: nowrap; width: 20%;" colspan="2">98422 44014</td>
                <td colspan="6" style="text-align: center; font-size: 12px; vertical-align: middle; width: 60%;">நடப்பது யாவும் நன்மைக்கே</td>
                <td style="text-align: right; font-size: 12px; white-space: nowrap; width: 20%;" colspan="2">90478 07888</td>
            </tr>
            <tr><td colspan="10"><img src="${logoBase64}" alt="Logo" class="logo"></td></tr>
            <tr style="font-weight: bold">
                <!-- <td style="text-align: left; font-size: 9px; width: 20%;" colspan="2">Invoice No: </td> -->
                <td style="text-align: left; font-size: 12px;" colspan="2">Invoice No: ${template.invoiceNumber.replace('PJ-', '')}</td>
                <td colspan="6" style="text-align: center; width: 60%;"><span class="tax-badge" style="font-size: 12px; padding: 3px 0px; white-space: nowrap; display: inline-block;">Tax Invoice</span></td>
                <td style="text-align: right; font-size: 12px; white-space: nowrap; width: 20%;" colspan="2">GSTIN: 33AAPCP7799B1ZX</td>
            </tr>
            <tr><td colspan="10" style="font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; font-size: 10px; padding: 2px;">NO-1, BRINDHAVAN GARDEN, BHARATHIYAR ROAD,MANIYAKARANPALAYAM , GANAPATHY, CBE-06.CELL : 98422 44014</td></tr>
            <tr>
                <td style="text-align: left; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px; font-size: 12px; width: 60%;" colspan="6"><strong>Name:</strong> ${template.customerName}</td>
                <td style="text-align: left; border-bottom: 1px solid #000; padding: 2px; font-size: 12px; width: 40%;" colspan="4"><strong>Date:</strong> ${template.date}</td>
            </tr>
            <tr><td style="text-align: left; border-bottom: 1px solid #000; padding: 2px; font-size: 12px;" colspan="10"><strong>Customer Details:</strong> ${template.customerAddress}</td></tr>
            <tr>
                <td style="text-align: left; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px; font-size: 12px; width: 50%;" colspan="5"><strong>Mobile:</strong> ${template.customerPhone}</td>
                <td style="text-align: left; border-bottom: 1px solid #000; padding: 2px; font-size: 12px; width: 50%;" colspan="5"><strong>Customer GSTIN:</strong> ${template.customerGstin}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #f5f5f5;">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; font-size: 12px; padding: 2px;">S. No</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 50%; font-size: 12px; padding: 2px;" colspan="5">Description ( HSN Code - 7113 )</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; font-size: 12px; padding: 2px;">QTY</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 12%; font-size: 12px; padding: 2px;">Weight</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 12%; font-size: 12px; padding: 2px;">Disc Amt</td>
                <td style="border-left: 1px solid #000; border-bottom: 1px solid #000; width: 10%; font-size: 12px; padding: 2px;">Amount</td>
            </tr>
            ${itemsHTML}
            ${emptyRowsHTML}
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; text-align: left; padding: 2px; font-weight: bold; font-size: 11px; width: 80%;" rowspan="5" colspan="8"><strong>Amount in Words:</strong> ${template.amountInWords}</td>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; padding: 2px; font-size: 11px; text-align: right; width: 12%;">Sub Total:</td>
                <td style="border-top: 1px solid #000; padding: 2px; font-size: 11px; text-align: right; width: 8%;">₹${invoice.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; padding: 2px; font-size: 11px; text-align: right; white-space: nowrap;">SGST 1.5%:</td>
                <td style="border-top: 1px solid #000; padding: 2px; font-size: 11px; text-align: right;">₹${template.sgst.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; padding: 2px; font-size: 11px; text-align: right; white-space: nowrap;">CGST 1.5%:</td>
                <td style="border-top: 1px solid #000; padding: 2px; font-size: 11px; text-align: right;">₹${template.cgst.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; padding: 2px; font-size: 11px; text-align: right;">Round Off:</td>
                <td style="border-top: 1px solid #000; padding: 2px; font-size: 11px; text-align: right;">₹${(template.roundoff || 0).toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; padding: 2px; font-weight: bold; font-size: 12px; text-align: right;"><strong>Total:</strong></td>
                <td style="border-top: 1px solid #000; padding: 2px; font-size: 12px; text-align: right; font-weight: bold;">₹${template.total.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; width: 50%;" colspan="5">Weight & Pieces Verified Found O.K</td>
                <td style="border-top: 1px solid #000; white-space: nowrap; width: 50%;" colspan="5">For PRABANJAM JEWELLERY LIMITED</td>
            </tr>
            <tr><td colspan="10" style="height: 15px;"></td></tr>
            <tr>
                <td colspan="5" style="width: 50%;">Customer Signature</td>
                <td colspan="5" style="width: 50%;">Authorised Signature</td>
            </tr>
<tr>
                <td colspan="5" style="text-align: center; color: red; font-weight: bold; padding: 2px; width: 50%;">தங்கள் வருகைக்கு நன்றி, மீண்டும் வருக!</td>
                <td colspan="5" style="width: 50%;"></td>
            </tr>
        </table>
    </div>
</body>
</html>`;
  }

  static async printInvoice(invoice: Invoice): Promise<void> {
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
    
    const html = this.generateInvoiceHTML(invoice, logoBase64);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for images to load before printing (Chrome fix)
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }
}