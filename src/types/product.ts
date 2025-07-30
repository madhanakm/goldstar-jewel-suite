export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  description?: string;
  weight: number;
  purity: string;
  making_charges: number;
  stone_charges?: number;
  other_charges?: number;
  total_amount: number;
  stock_quantity: number;
  min_stock_level: number;
  supplier?: string;
  purchase_date?: string;
  purchase_price: number;
  selling_price: number;
  discount_percentage?: number;
  tax_percentage: number;
  barcode: string;
  images?: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // API metadata
  attributes?: any;
}

export interface ProductFormData {
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  weight: number;
  purity: string;
  making_charges: number;
  stone_charges?: number;
  other_charges?: number;
  stock_quantity: number;
  min_stock_level: number;
  supplier?: string;
  purchase_date?: string;
  purchase_price: number;
  selling_price: number;
  discount_percentage?: number;
  tax_percentage: number;
  location?: string;
  notes?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  subcategories?: ProductSubcategory[];
}

export interface ProductSubcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
}