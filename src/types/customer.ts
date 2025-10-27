import { BaseEntity } from './index';

export interface Customer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  aadhar?: string;
  gstin?: string;
  totalPurchases: number;
  totalAmount: number;
  kycStatus: 'verified' | 'pending' | 'rejected';
  memberType: 'premium' | 'regular' | 'vip';
  lastPurchaseDate?: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  aadhar?: string;
  gstin?: string;
}