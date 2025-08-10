import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '../src/components/ProductCard';
import { Product } from '../src/types';

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  ImageBackground: 'ImageBackground',
}));

const mockProduct: Product = {
  id: '1',
  name: 'Cocacola',
  price: 5.53,
  stock: 10,
  currency: 'EUR',
  image: 'https://example.com/cocacola.jpg',
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={0}
        onAdd={() => {}}
        onRemove={() => {}}
        selectedCurrency="EUR"
        selectedSaleType="Retail"
      />
    );

    expect(getByText('Cocacola')).toBeTruthy();
    expect(getByText('0 units')).toBeTruthy();
    expect(getByText('5.53 €')).toBeTruthy();
  });

  it('shows quantity badge when quantity > 0', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={2}
        onAdd={() => {}}
        onRemove={() => {}}
        selectedCurrency="EUR"
        selectedSaleType="Retail"
      />
    );

    expect(getByText('2 units')).toBeTruthy();
  });

  it('calls onAdd when add button is pressed', () => {
    const mockOnAdd = jest.fn();
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={0}
        onAdd={mockOnAdd}
        onRemove={() => {}}
        selectedCurrency="EUR"
        selectedSaleType="Retail"
      />
    );

    fireEvent.press(getByText('+'));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onRemove when remove button is pressed', () => {
    const mockOnRemove = jest.fn();
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={1}
        onAdd={() => {}}
        onRemove={mockOnRemove}
        selectedCurrency="EUR"
        selectedSaleType="Retail"
      />
    );

    fireEvent.press(getByText('-'));
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith(mockProduct);
  });

  it('converts currency correctly', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={0}
        onAdd={() => {}}
        onRemove={() => {}}
        selectedCurrency="USD"
        selectedSaleType="Retail"
      />
    );

    // 5.53 EUR * 1.08 = 5.97 USD
    expect(getByText('5.97 $')).toBeTruthy();
  });

  it('shows discount when sale type has discount', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={0}
        onAdd={() => {}}
        onRemove={() => {}}
        selectedCurrency="EUR"
        selectedSaleType="Crew"
      />
    );

    // Should show both original and discounted price
    expect(getByText('5.53 €')).toBeTruthy(); // Original price
    expect(getByText('4.15 €')).toBeTruthy(); // Discounted price (25% off for Crew)
  });

  it('does not show remove button when quantity is 0', () => {
    const { queryByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={0}
        onAdd={() => {}}
        onRemove={() => {}}
        selectedCurrency="EUR"
        selectedSaleType="Retail"
      />
    );

    expect(queryByText('-')).toBeNull();
  });

  it('shows remove button when quantity is greater than 0', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={1}
        onAdd={() => {}}
        onRemove={() => {}}
        selectedCurrency="EUR"
        selectedSaleType="Retail"
      />
    );

    expect(getByText('-')).toBeTruthy();
  });
}); 