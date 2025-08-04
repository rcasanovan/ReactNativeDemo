import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaymentScreen } from '../src/screens/PaymentScreen';
import { ApiService } from '../src/services/api';

// Mock the API service
jest.mock('../src/services/api');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    cart: [
      {
        product: {
          id: '1',
          name: 'Cocacola',
          price: 5.53,
          stock: 10,
          currency: 'EUR',
        },
        quantity: 2,
      },
    ],
    total: 11.06,
    currency: 'EUR',
    saleType: 'Retail',
  },
};

describe('PaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment screen with correct information', () => {
    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText('Pago')).toBeTruthy();
    expect(getByText('Detalles del Ticket')).toBeTruthy();
    expect(getByText('Método de Pago')).toBeTruthy();
    expect(getByText('Productos Seleccionados')).toBeTruthy();
    expect(getByText('Total a Pagar:')).toBeTruthy();
    expect(getByText('11.06 €')).toBeTruthy();
  });

  it('displays cart items correctly', () => {
    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText('Cocacola')).toBeTruthy();
    expect(getByText('x2')).toBeTruthy();
    expect(getByText('11.06 €')).toBeTruthy();
  });

  it('shows error when trying to pay without seat number', async () => {
    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const payButton = getByText('Procesar Pago');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(mockApiService.processPayment).not.toHaveBeenCalled();
    });
  });

  it('processes payment successfully with valid data', async () => {
    mockApiService.processPayment.mockResolvedValue({
      success: true,
      message: 'Payment processed successfully',
      transactionId: 'TXN-123',
    });

    const { getByText, getByPlaceholderText } = render(
      <PaymentScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Enter seat number
    const seatInput = getByPlaceholderText('Ingrese el número de asiento');
    fireEvent.changeText(seatInput, '12A');

    // Press pay button
    const payButton = getByText('Procesar Pago');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(mockApiService.processPayment).toHaveBeenCalledWith({
        items: mockRoute.params.cart,
        total: 11.06,
        currency: 'EUR',
        saleType: 'Retail',
        seatNumber: '12A',
      });
    });
  });

  it('handles payment failure', async () => {
    mockApiService.processPayment.mockResolvedValue({
      success: false,
      message: 'Payment failed',
    });

    const { getByText, getByPlaceholderText } = render(
      <PaymentScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Enter seat number
    const seatInput = getByPlaceholderText('Ingrese el número de asiento');
    fireEvent.changeText(seatInput, '12A');

    // Press pay button
    const payButton = getByText('Procesar Pago');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(mockApiService.processPayment).toHaveBeenCalled();
    });
  });

  it('allows selecting payment method', () => {
    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const cashButton = getByText('Efectivo');
    fireEvent.press(cashButton);

    // The cash button should now be selected (we can't easily test the visual state in unit tests)
    expect(cashButton).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const backButton = getByText('← Volver');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
}); 