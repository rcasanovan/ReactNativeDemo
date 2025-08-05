import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaymentScreen } from '../src/screens/PaymentScreen';
import { ApiService } from '../src/services/api';

// Mock the API service
jest.mock('../src/services/api');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  ActivityIndicator: 'ActivityIndicator',
  SafeAreaView: 'SafeAreaView',
  Modal: 'Modal',
  TextInput: 'TextInput',
  Image: 'Image',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  Alert: {
    alert: jest.fn(),
  },
  Animated: {
    View: 'Animated.View',
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  },
}));

// Mock React Navigation
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

const mockUseNavigation = jest.fn(() => mockNavigation);
const mockUseRoute = jest.fn(() => mockRoute);

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockUseNavigation(),
  useRoute: () => mockUseRoute(),
}));

describe('PaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment screen with correct information', () => {
    const { getAllByText } = render(<PaymentScreen />);

    expect(getAllByText('Ticket')[0]).toBeTruthy();
    expect(getAllByText('Productos seleccionados')[0]).toBeTruthy();
    expect(getAllByText('ASIENTO')[0]).toBeTruthy();
    expect(getAllByText('TOTAL')[0]).toBeTruthy();
    // Use getAllByText to handle duplicate text
    expect(getAllByText(/11\.06 €/)[0]).toBeTruthy();
  });

  it('displays cart items correctly', () => {
    const { getByText } = render(<PaymentScreen />);

    expect(getByText('Cocacola')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // quantity
  });

  it('navigates back when close button is pressed', () => {
    const { getAllByText } = render(<PaymentScreen />);

    // Get all close buttons and use the first one
    const closeButtons = getAllByText('✕');
    fireEvent.press(closeButtons[0]);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProductSelection', {
      updatedCart: mockRoute.params.cart,
      selectedSaleType: 'Retail',
    });
  });
}); 