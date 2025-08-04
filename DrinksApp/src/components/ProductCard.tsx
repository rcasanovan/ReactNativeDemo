import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Product } from '../types';
import { CurrencyConverter } from '../utils/currencyConverter';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  selectedCurrency: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAdd,
  onRemove,
  selectedCurrency,
}) => {
  const convertedPrice = CurrencyConverter.convert(
    product.price,
    product.currency,
    selectedCurrency as any
  );
  const formattedPrice = CurrencyConverter.formatCurrency(
    convertedPrice,
    selectedCurrency as any
  );

  return (
    <View style={styles.container}>
      {/* Product Name - Bottom Left */}
      <Text style={styles.productName}>{product.name}</Text>
      
      {/* Quantity - Below Name */}
      <Text style={styles.quantity}>{quantity} unidades</Text>
      
      {/* Remove Button - Only show when quantity > 0 */}
      {quantity > 0 && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>-</Text>
        </TouchableOpacity>
      )}
      
      {/* Add Button - Bottom Left */}
      <TouchableOpacity 
        style={[
          styles.addButton, 
          quantity === 0 && styles.addButtonLeft
        ]} 
        onPress={onAdd}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      
      {/* Price Button - Bottom Right */}
      <TouchableOpacity style={styles.priceButton}>
        <Text style={styles.priceButtonText}>{formattedPrice}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    aspectRatio: 0.8, // Make it more rectangular (taller)
    position: 'relative',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    position: 'absolute',
    top: 16,
    left: 16,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    position: 'absolute',
    top: 40,
    left: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    left: 50, // Move to middle position
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLeft: {
    left: 12, // Move to left position when quantity is 0
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60, // Ensure minimum width to prevent overlap
  },
  priceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeButton: {
    position: 'absolute',
    bottom: 12,
    left: 12, // Move to left position
    backgroundColor: '#FF3B30', // A different color for remove
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 