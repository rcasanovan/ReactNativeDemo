export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  inventory: number;
  currency: Currency;
  type?: string; // Add type field for filtering
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Currency = 'EUR' | 'USD' | 'GBP';

export type SaleType = 'Retail' | 'Crew' | 'Happy hour' | 'Business Invitation' | 'Tourist Invitation';

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