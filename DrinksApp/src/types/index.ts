export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  currency: Currency;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Currency = 'EUR' | 'USD' | 'GBP';

export type SaleType = 'Retail' | 'Crew' | 'Happy hour' | 'Invitación business' | 'Invitación turista';

export interface PaymentRequest {
  items: CartItem[];
  total: number;
  currency: Currency;
  saleType: SaleType;
  seatNumber: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
} 