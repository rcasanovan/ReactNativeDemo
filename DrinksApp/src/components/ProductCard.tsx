import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
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
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/100x100' }}
          style={styles.image}
          resizeMode="cover"
        />
        {quantity > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{quantity}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.quantity}>{quantity} unidades</Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formattedPrice}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        {quantity > 0 && (
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
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
    minHeight: 200,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    position: 'absolute',
    bottom: 40,
    right: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  price: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 