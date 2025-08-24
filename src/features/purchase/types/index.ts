export interface PurchaseMaster {
  id: number;
  documentId: string;
  totalamount: string;
  totalqty: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Purchase {
  id: number;
  documentId: string;
  total_amount: number;
  pid: string;
  rate: string;
  qty: string;
  touch: string;
  product: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ProductFormData {
  product: string;
  qty: string;
  rate: string;
  touch: string;
}

export interface NewPurchaseForm {
  products: ProductFormData[];
}