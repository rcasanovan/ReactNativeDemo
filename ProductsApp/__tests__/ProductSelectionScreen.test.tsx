import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProductSelectionScreen } from '../src/screens/ProductSelectionScreen';
import { ApiService } from '../src/services/api';

// Mock the API service
jest.mock('../src/services/api');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock React Navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    updatedCart: [],
    selectedSaleType: 'Retail',
  },
};

const mockUseNavigation = jest.fn(() => mockNavigation);
const mockUseRoute = jest.fn(() => mockRoute);

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockUseNavigation(),
  useRoute: () => mockUseRoute(),
}));

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: ({ children }: any) => children,
}));

describe('ProductSelectionScreen', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Cocacola',
      price: 5.53,
      stock: 10,
      currency: 'EUR' as const,
      image: 'https://example.com/cocacola.jpg',
      type: 'Beverage',
    },
    {
      id: '2',
      name: 'Chicken Sandwich',
      price: 7.99,
      stock: 5,
      currency: 'USD' as const,
      image: 'https://example.com/sandwich.jpg',
      type: 'Food',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.getProducts.mockResolvedValue(mockProducts);
  });

  it('renders product selection screen with correct information', async () => {
    const { getByText } = render(<ProductSelectionScreen />);

    await waitFor(() => {
      expect(getByText('Products')).toBeTruthy();
    });
  });

  it('loads and displays products', async () => {
    const { getByText } = render(<ProductSelectionScreen />);

    await waitFor(() => {
      expect(getByText('Cocacola')).toBeTruthy();
      expect(getByText('Chicken Sandwich')).toBeTruthy();
    });

    expect(mockApiService.getProducts).toHaveBeenCalledTimes(1);
  });

  it('shows loading state initially', () => {
    const { getByText } = render(<ProductSelectionScreen />);

    expect(getByText('Loading products...')).toBeTruthy();
  });

  it('shows error state when products fail to load', async () => {
    mockApiService.getProducts.mockRejectedValue(new Error('Failed to load'));

    const { getByText } = render(<ProductSelectionScreen />);

    await waitFor(() => {
      expect(getByText('No products available')).toBeTruthy();
      expect(getByText('Please check your connection and try again')).toBeTruthy();
    });
  });

  it('navigates to payment screen when payment button is pressed', async () => {
    const { getByText } = render(<ProductSelectionScreen />);

    await waitFor(() => {
      expect(getByText('Cocacola')).toBeTruthy();
    });

    // Add product to cart
    const addButton = getByText('+');
    fireEvent.press(addButton);

    // Payment button should be enabled
    const paymentButton = getByText(/PAGAR/);
    fireEvent.press(paymentButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Payment', {
      cart: expect.arrayContaining([
        expect.objectContaining({
          product: mockProducts[0],
          quantity: 1,
        }),
      ]),
      total: expect.any(Number),
      currency: 'EUR',
      saleType: 'Retail',
    });
  });

  it('disables payment button when cart is empty', async () => {
    const { getByText } = render(<ProductSelectionScreen />);

    await waitFor(() => {
      expect(getByText('Cocacola')).toBeTruthy();
    });

    // Payment button should be disabled initially
    const paymentButton = getByText(/PAGAR/);
    expect(paymentButton.props.style).toContainEqual(expect.objectContaining({ opacity: 0.6 }));
  });

  it('handles cart updates from navigation params', async () => {
    const updatedRoute = {
      params: {
        updatedCart: [
          {
            product: mockProducts[0],
            quantity: 2,
          },
        ],
        selectedSaleType: 'Crew',
      },
    };

    mockUseRoute.mockReturnValue(updatedRoute as any);

    const { getByText } = render(<ProductSelectionScreen />);

    await waitFor(() => {
      expect(getByText('Crew')).toBeTruthy();
    });

    // Should show updated cart quantity
    expect(getByText('2')).toBeTruthy();
  });
}); 