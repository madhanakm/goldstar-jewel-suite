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
      date: new Date(invoice.date).toLocaleDateString('en-IN'),
      items: invoice.items,
      subtotal: invoice.subtotal,
      sgst,
      cgst,
      total: invoice.total,
      amountInWords: this.numberToWords(Math.floor(invoice.total))
    };
  }

  static generateInvoiceHTML(invoice: Invoice): string {
    const template = this.mapInvoiceToTemplate(invoice);
    
    // Generate items rows
    const itemsHTML = template.items.map((item, index) => `
      <tr>
        <td style="border-right: 1px solid #000">${index + 1}</td>
        <td style="border-right: 1px solid #000" colspan="3">${item.itemName} (${item.purity})</td>
        <td style="border-right: 1px solid #000">${item.quantity}</td>
        <td style="border-right: 1px solid #000">${item.weight}g</td>
        <td style="border-right: 1px solid #000">${item.makingCharges}%</td>
        <td colspan="2">₹${item.total.toLocaleString()}</td>
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
        body { font-family: Arial, sans-serif; font-size: 14px; }
        .invoice-container { max-width: 210mm; margin: 0 auto; padding: 14px; }
        .invoice-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        .invoice-table td { padding: 10px 6px; text-align: center; }
        .logo { width: 90%; }
        .tax-badge { color: #fff; background-color: #000; padding: 7px 15px; border-radius: 10px; }
        @media print {
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
            .invoice-container { max-width: none; padding: 0; margin: 0; }
            @page { margin: 5mm; size: A4; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <table class="invoice-table">
            <tr style="font-weight: bold">
                <td colspan="3" style="border-left: none; border-bottom: none; border-right: none">98422 44014</td>
                <td colspan="3">நடப்பது யாவும் நன்மைக்கே</td>
                <td colspan="3">90478 07888</td>
            </tr>
            <tr><td colspan="9"><img src="/logo.jpg" alt="Logo" class="logo"></td></tr>
            <tr style="font-weight: bold">
                <td colspan="3">Invoice No: ${template.invoiceNumber}</td>
                <td colspan="3"><span class="tax-badge">Tax Invoice</span></td>
                <td colspan="3">GSTIN: 33AAPCP7799B1ZX</td>
            </tr>
            <tr><td colspan="9" style="font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000">NO-1, BRINDHAVAN GARDEN, BHARATHIYAR ROAD, MANIYAKARANPALAYAM, GANAPATHY, CBE-06</td></tr>
            <tr>
                <td style="text-align: left; border-right: 1px solid #000; border-bottom: 1px solid #000" colspan="6">Name: ${template.customerName}</td>
                <td style="text-align: left; border-bottom: 1px solid #000" colspan="3">Date: ${template.date}</td>
            </tr>
            <tr><td style="text-align: left; border-bottom: 1px solid #000" colspan="9">Address: ${template.customerAddress}</td></tr>
            <tr>
                <td style="text-align: left; border-right: 1px solid #000; border-bottom: 1px solid #000" colspan="3">Mobile: ${template.customerPhone}</td>
                <td style="text-align: left; border-right: 1px solid #000; border-bottom: 1px solid #000" colspan="3">Buyer GSTIN: ${template.customerGstin}</td>
                <td style="text-align: left; border-bottom: 1px solid #000" colspan="3">Silver Rate: ₹${template.silverRate}/g</td>
            </tr>
            <tr style="font-weight: bold">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000">S. No</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000" colspan="3">Description</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000">Quantity</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000">Weight</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000">VA%</td>
                <td style="border-bottom: 1px solid #000" colspan="2">Amount</td>
            </tr>
            <tbody>${itemsHTML}</tbody>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000; text-align: left" rowspan="4" colspan="5">Amount in Words: ${template.amountInWords}</td>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000" colspan="2">Sub Total:</td>
                <td style="border-top: 1px solid #000" colspan="2">₹${template.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000" colspan="2">Add SGST 1.5%:</td>
                <td style="border-top: 1px solid #000" colspan="2">₹${template.sgst.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000" colspan="2">Add CGST 1.5%:</td>
                <td style="border-top: 1px solid #000" colspan="2">₹${template.cgst.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000; border-right: 1px solid #000" colspan="2">Grand Total:</td>
                <td style="border-top: 1px solid #000" colspan="2">₹${template.total.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #000" colspan="5">Weight & Pieces Verified Found O.K</td>
                <td style="border-top: 1px solid #000" colspan="4">For PRABANJAM JEWELLERY LIMITED</td>
            </tr>
            <tr><td colspan="9" rowspan="2"></td></tr>
            <tr></tr>
            <tr>
                <td colspan="5">Customer Signature</td>
                <td colspan="4">Authorised Signature</td>
            </tr>
            <tr>
                <td colspan="5" style="text-align: center; color: red; font-weight: bold; padding: 2px;">தங்கள் வருககக்கு நன்றி மீண்டும் வருக.</td>
                <td colspan="4"></td>
            </tr>
        </table>
    </div>
</body>
</html>`;
  }

  static printInvoice(invoice: Invoice): void {
    const html = this.generateInvoiceHTML(invoice);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }
}