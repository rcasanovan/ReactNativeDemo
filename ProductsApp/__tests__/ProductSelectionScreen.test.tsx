import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProductSelectionScreen } from '../src/screens/ProductSelectionScreen';
import { ApiService } from '../src/services/api';

// Mock the API service
jest.mock('../src/services/api');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

// Mock React Native components with minimal setup
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  FlatList: ({ data, renderItem, keyExtractor }: any) => {
    if (!data || data.length === 0) return null;
    return data.map((item: any, index: number) => {
      const key = keyExtractor ? keyExtractor(item, index) : item.id || index;
      return { type: 'View', key, children: renderItem({ item, index }) };
    });
  },
  ActivityIndicator: 'ActivityIndicator',
  SafeAreaView: 'SafeAreaView',
  Modal: 'Modal',
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
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
}); 