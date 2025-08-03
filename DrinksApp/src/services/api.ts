import { Product, PaymentRequest, PaymentResponse } from '../types';

const BASE_URL = 'https://my-json-server.typicode.com/your-username/refrescos-api';

export class ApiService {
  static async getProducts(): Promise<Product[]> {
    try {
      // For now, we'll return mock data since we don't have a real server
      // In a real implementation, this would be: const response = await fetch(`${BASE_URL}/products`);
      return [
        {
          id: '1',
          name: 'Cocacola',
          price: 5.53,
          stock: 10,
          currency: 'EUR',
        },
        {
          id: '2',
          name: 'Schweppes Tónica',
          price: 2.22,
          stock: 15,
          currency: 'EUR',
        },
        {
          id: '3',
          name: 'Fanta',
          price: 5.99,
          stock: 8,
          currency: 'EUR',
        },
        {
          id: '4',
          name: 'Sprite',
          price: 2.32,
          stock: 12,
          currency: 'EUR',
        },
      ];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  static async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simulate API call to payment gateway
      // In a real implementation, this would be: const response = await fetch(`${BASE_URL}/payments`, { method: 'POST', body: JSON.stringify(paymentRequest) });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always return success for demo purposes
      return {
        success: true,
        message: 'Payment processed successfully',
        transactionId: `TXN-${Date.now()}`,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error('Failed to process payment');
    }
  }
} 