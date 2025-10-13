import { BaseEntity } from './index';
import { Customer } from './customer';

export interface InvoiceItem {
  id: string;
  itemName: string;
  category: string;
  weight: number;
  purity: string;
  rate: number;
  makingCharges: number;
  quantity: number;
  total: number;
  hsnCode?: string;
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  customer: Customer;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  oldSilverExchange?: {
    weight: number;
    rate: number;
    value: number;
  };
  gst: {
    sgst: number;
    cgst: number;
    total: number;
  };
  total: number;
  roundoff?: number;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'partially_paid';
  notes?: string;
}

export interface InvoiceTemplate {
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerGstin: string;
  customerAadhar: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  roundoff?: number;
  total: number;
  amountInWords: string;
}