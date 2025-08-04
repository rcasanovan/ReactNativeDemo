import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { Dropdown } from '../components/Dropdown';
import { ApiService } from '../services/api';
import { CurrencyConverter } from '../utils/currencyConverter';
import { Product, CartItem, Currency, SaleType } from '../types';

interface ProductSelectionScreenProps {
  navigation: any;
}

export const ProductSelectionScreen: React.FC<ProductSelectionScreenProps> = ({
  navigation,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const [selectedSaleType, setSelectedSaleType] = useState<SaleType>('Retail');
  const [loading, setLoading] = useState(true);

  const currencyOptions = ['EUR', 'USD', 'GBP'];
  const saleTypeOptions = ['Retail', 'Crew', 'Happy hour', 'Invitación business', 'Invitación turista'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await ApiService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.product.id !== product.id);
      }
    });
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const convertedPrice = CurrencyConverter.convert(
        item.product.price,
        item.product.currency,
        selectedCurrency
      );
      return total + (convertedPrice * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add some products to your cart');
      return;
    }
    
    navigation.navigate('Payment', {
      cart,
      total: calculateTotal(),
      currency: selectedCurrency,
      saleType: selectedSaleType,
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      quantity={getCartQuantity(item.id)}
      onAdd={() => addToCart(item)}
      onRemove={() => removeFromCart(item)}
      selectedCurrency={selectedCurrency}
    />
  );

  const total = calculateTotal();
  const alternativeCurrencies = total > 0 ? CurrencyConverter.getAlternativeCurrencies(total, selectedCurrency) : {};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Refrescos</Text>
        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productGrid}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {/* Main Payment Button */}
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[styles.paymentButton, cart.length === 0 && styles.paymentButtonDisabled]}
            onPress={handleProceedToPayment}
            disabled={cart.length === 0}
          >
            {/* Left Segment - Payment */}
            <View style={styles.paymentSegment}>
              <Text style={styles.paymentText}>
                PAGAR <Text style={styles.paymentAmount}>
                  {CurrencyConverter.formatCurrency(total, selectedCurrency).split(' ')[1]}
                </Text> {selectedCurrency}
              </Text>
            </View>
            
            {/* Right Segment - Business Type */}
            <View style={styles.businessSegment}>
              <View style={styles.businessContent}>
                <Text style={styles.businessText}>Business</Text>
                <Text style={styles.chevronIcon}>▼</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Alternative Currencies */}
        {Object.keys(alternativeCurrencies).length > 0 && (
          <View style={styles.currencyDisplay}>
            <Text style={styles.currencyText}>
              {Object.values(alternativeCurrencies).join(' | ')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#333',
  },
  productGrid: {
    padding: 8,
  },
  bottomBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    padding: 16,
  },
  paymentButtonContainer: {
    marginBottom: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentSegment: {
    flex: 2,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  paymentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentAmount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  businessSegment: {
    flex: 1,
    backgroundColor: '#4A5568',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  businessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  businessText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  chevronIcon: {
    color: 'white',
    fontSize: 12,
  },
  currencyDisplay: {
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
}); 