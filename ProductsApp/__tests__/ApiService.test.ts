import { ApiService } from '../src/services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('fetches products successfully', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Cocacola',
          price: 5.53,
          inventory: 10,
          image: 'https://example.com/cocacola.jpg',
          type: 'Beverage',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      const result = await ApiService.getProducts();

      expect(fetch).toHaveBeenCalledWith(
        'https://my-json-server.typicode.com/rcasanovan/fakeProductsAPI/products',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'ProductsApp/1.0',
          },
        })
      );

      expect(result).toEqual([
        {
          id: '1',
          name: 'Cocacola',
          price: 5.53,
          inventory: 10,
          currency: 'USD',
          image: 'https://example.com/cocacola.jpg',
          type: 'Beverage',
        },
      ]);
    });

    it('handles network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiService.getProducts()).rejects.toThrow('Failed to fetch products');
    });

    it('handles HTTP errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(ApiService.getProducts()).rejects.toThrow('Failed to fetch products');
    });
  });

  describe('processPayment', () => {
    it('processes payment successfully', async () => {
      const paymentRequest = {
        items: [
          {
            product: {
              id: '1',
              name: 'Cocacola',
              price: 5.53,
              inventory: 10,
              currency: 'EUR' as const,
            },
            quantity: 2,
          },
        ],
        total: 11.06,
        currency: 'EUR' as const,
        saleType: 'Retail' as const,
        seatNumber: 'A1',
      };

      const result = await ApiService.processPayment(paymentRequest);

      expect(result).toEqual({
        success: true,
        message: 'Payment processed successfully',
        transactionId: expect.stringMatching(/^TXN-\d+$/),
      });
    });
  });

  describe('getPaymentResponse', () => {
    it('fetches payment response successfully', async () => {
      const mockResponse = {
        paymentResponse: {
          success: true,
          message: 'Payment processed successfully',
          transactionId: 'TXN-123456',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiService.getPaymentResponse('TXN-123456');

      expect(fetch).toHaveBeenCalledWith(
        'https://my-json-server.typicode.com/rcasanovan/fakeProductsAPI/paymentResponse',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'ProductsApp/1.0',
          },
          body: JSON.stringify({ transactionId: 'TXN-123456' }),
        })
      );

      expect(result).toEqual({
        success: true,
        message: 'Payment processed successfully',
        transactionId: 'TXN-123456',
      });
    });

    it('handles missing paymentResponse in response', async () => {
      const mockResponse = {
        success: true,
        message: 'Payment processed successfully',
        transactionId: 'TXN-123456',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiService.getPaymentResponse('TXN-123456');

      expect(result).toEqual({
        success: true,
        message: 'Payment processed successfully',
        transactionId: 'TXN-123456',
      });
    });

    it('handles network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiService.getPaymentResponse('TXN-123456')).rejects.toThrow('Failed to fetch payment response');
    });

    it('handles HTTP errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(ApiService.getPaymentResponse('TXN-123456')).rejects.toThrow('Failed to fetch payment response');
    });
  });
}); 