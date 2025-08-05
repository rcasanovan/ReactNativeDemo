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
          image: 'https://example.com/cocacola.jpg',
        },
        quantity: 2,
      },
    ],
    total: 11.06,
    currency: 'EUR',
    saleType: 'Retail',
  },
};

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: ({ children }: any) => children,
}));

describe('PaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment screen with correct information', () => {
    const { getByText } = render(<PaymentScreen />);

    expect(getByText('Ticket')).toBeTruthy();
    expect(getByText('Productos seleccionados')).toBeTruthy();
    expect(getByText('ASIENTO')).toBeTruthy();
    expect(getByText('TOTAL')).toBeTruthy();
    expect(getByText('11.06 €')).toBeTruthy();
  });

  it('displays cart items correctly', () => {
    const { getByText } = render(<PaymentScreen />);

    expect(getByText('Cocacola')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // quantity
  });

  it('shows cash payment modal when cash button is pressed', async () => {
    const { getByText } = render(<PaymentScreen />);

    const cashButton = getByText('Efectivo');
    fireEvent.press(cashButton);

    await waitFor(() => {
      expect(getByText('Cash Payment')).toBeTruthy();
    });
  });

  it('shows card form modal when card button is pressed', async () => {
    const { getByText } = render(<PaymentScreen />);

    const cardButton = getByText('Tarjeta');
    fireEvent.press(cardButton);

    await waitFor(() => {
      expect(getByText('Card Details')).toBeTruthy();
    });
  });

  it('processes cash payment successfully', async () => {
    mockApiService.processPayment.mockResolvedValue({
      success: true,
      message: 'Payment processed successfully',
      transactionId: 'TXN-123',
    });

    mockApiService.getPaymentResponse.mockResolvedValue({
      success: true,
      message: 'Payment processed successfully',
      transactionId: 'TXN-123',
    });

    const { getByText, getByPlaceholderText } = render(<PaymentScreen />);

    // Click cash button
    const cashButton = getByText('Efectivo');
    fireEvent.press(cashButton);

    // Wait for cash modal to appear
    await waitFor(() => {
      expect(getByText('Cash Payment')).toBeTruthy();
    });

    // Enter cash amount
    const cashInput = getByPlaceholderText('0.00');
    fireEvent.changeText(cashInput, '15.00');

    // Process payment
    const processButton = getByText('Process Payment');
    fireEvent.press(processButton);

    await waitFor(() => {
      expect(mockApiService.processPayment).toHaveBeenCalled();
    });
  });

  it('processes card payment successfully', async () => {
    mockApiService.processPayment.mockResolvedValue({
      success: true,
      message: 'Payment processed successfully',
      transactionId: 'TXN-123',
    });

    mockApiService.getPaymentResponse.mockResolvedValue({
      success: true,
      message: 'Payment processed successfully',
      transactionId: 'TXN-123',
    });

    const { getByText, getByPlaceholderText } = render(<PaymentScreen />);

    // Click card button
    const cardButton = getByText('Tarjeta');
    fireEvent.press(cardButton);

    // Wait for card modal to appear
    await waitFor(() => {
      expect(getByText('Card Details')).toBeTruthy();
    });

    // Fill card details
    const cardNumberInput = getByPlaceholderText('Card Number');
    const expiryInput = getByPlaceholderText('MM/YY');
    const cvvInput = getByPlaceholderText('CVV');
    const nameInput = getByPlaceholderText('Cardholder Name');

    fireEvent.changeText(cardNumberInput, '1234567890123456');
    fireEvent.changeText(expiryInput, '12/25');
    fireEvent.changeText(cvvInput, '123');
    fireEvent.changeText(nameInput, 'John Doe');

    // Pay button should be enabled now
    const payButton = getByText('Pay');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(mockApiService.processPayment).toHaveBeenCalled();
    });
  });

  it('handles payment failure', async () => {
    mockApiService.processPayment.mockResolvedValue({
      success: false,
      message: 'Payment failed',
    });

    const { getByText } = render(<PaymentScreen />);

    // Click cash button
    const cashButton = getByText('Efectivo');
    fireEvent.press(cashButton);

    // Wait for cash modal to appear
    await waitFor(() => {
      expect(getByText('Cash Payment')).toBeTruthy();
    });

    // Enter cash amount
    const cashInput = getByPlaceholderText('0.00');
    fireEvent.changeText(cashInput, '15.00');

    // Process payment
    const processButton = getByText('Process Payment');
    fireEvent.press(processButton);

    await waitFor(() => {
      expect(mockApiService.processPayment).toHaveBeenCalled();
    });
  });

  it('validates cash amount is sufficient', async () => {
    const { getByText, getByPlaceholderText } = render(<PaymentScreen />);

    // Click cash button
    const cashButton = getByText('Efectivo');
    fireEvent.press(cashButton);

    // Wait for cash modal to appear
    await waitFor(() => {
      expect(getByText('Cash Payment')).toBeTruthy();
    });

    // Enter insufficient amount
    const cashInput = getByPlaceholderText('0.00');
    fireEvent.changeText(cashInput, '5.00');

    // Process payment button should be disabled
    const processButton = getByText('Process Payment');
    expect(processButton.props.style).toContainEqual(expect.objectContaining({ opacity: 0.6 }));
  });

  it('navigates back when close button is pressed', () => {
    const { getByText } = render(<PaymentScreen />);

    const closeButton = getByText('✕');
    fireEvent.press(closeButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProductSelection', {
      updatedCart: mockRoute.params.cart,
      selectedSaleType: 'Retail',
    });
  });
}); 