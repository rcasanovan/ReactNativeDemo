import { Product, PaymentRequest, PaymentResponse } from '../types';

const BASE_URL = 'https://my-json-server.typicode.com/rcasanovan/fakeProductsAPI';

export class ApiService {
  static async getProducts(): Promise<Product[]> {
    try {
      console.log('Starting API request to:', `${BASE_URL}/products`);
      
      const response = await fetch(`${BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'ProductsApp/1.0',
        },
      });
      
      console.log('API response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiProducts = await response.json();
      
      // Transform API response to match our Product interface
      return apiProducts.map((apiProduct: any) => ({
        id: apiProduct.id.toString(), // Convert number to string
        name: apiProduct.name,
        price: apiProduct.price,
        image: apiProduct.image,
        stock: apiProduct.inventory, // Map inventory to stock
        currency: 'USD' as const, // Default to USD since API provides prices in dollars
        type: apiProduct.type, // Include type field for filtering
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error instanceof Error && error.message.includes('aborted')) {
        console.log('Request was aborted - likely timeout or network issue');
        throw new Error('Request timeout - please check your connection');
      }
      console.log('Other error occurred:', error);
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