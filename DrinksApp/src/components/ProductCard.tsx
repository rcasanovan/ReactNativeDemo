import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
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
    <ImageBackground
      source={{ uri: product.image }}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Overlay for better text readability */}
      <View style={styles.overlay}>
        {/* Top Section - Product Info */}
        <View style={styles.topSection}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.quantity}>{quantity} unidades</Text>
        </View>
        
        {/* Bottom Section - Buttons */}
        <View style={styles.bottomSection}>
          {/* Remove Button - Only show when quantity > 0 */}
          {quantity > 0 && (
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <Text style={styles.removeButtonText}>-</Text>
            </TouchableOpacity>
          )}
          
          {/* Add Button */}
          <TouchableOpacity 
            style={[
              styles.addButton, 
              quantity === 0 && styles.addButtonLeft
            ]} 
            onPress={onAdd}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          
          {/* Price Button */}
          <TouchableOpacity style={styles.priceButton}>
            <Text style={styles.priceButtonText}>{formattedPrice}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 0.8, // Make it more rectangular (taller)
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden', // Ensure image doesn't overflow rounded corners
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backgroundImage: {
    borderRadius: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent overlay for better readability
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between', // Distribute content at the top and bottom
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 20,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  quantity: {
    fontSize: 14,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonLeft: {
    marginLeft: 0, // When quantity is 0, move to left
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent black
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  priceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 