import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '../src/components/ProductCard';
import { Product } from '../src/types';

const mockProduct: Product = {
  id: '1',
  name: 'Cocacola',
  price: 5.53,
  stock: 10,
  currency: 'EUR',
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
      />
    );

    expect(getByText('Cocacola')).toBeTruthy();
    expect(getByText('0 unidades')).toBeTruthy();
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
      />
    );

    expect(getByText('2')).toBeTruthy();
    expect(getByText('2 unidades')).toBeTruthy();
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
      />
    );

    fireEvent.press(getByText('+'));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
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
      />
    );

    fireEvent.press(getByText('-'));
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('converts currency correctly', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        quantity={0}
        onAdd={() => {}}
        onRemove={() => {}}
        selectedCurrency="USD"
      />
    );

    // 5.53 EUR * 1.08 = 5.97 USD
    expect(getByText('5.97 $')).toBeTruthy();
  });
}); 