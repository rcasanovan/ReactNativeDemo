import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ApiService } from '../services/api';
import { CartItem, Currency, SaleType } from '../types';
import { CurrencyConverter } from '../utils/currencyConverter';

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { cart, total, currency, saleType } = route.params;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card'>('card');
  const [selectedRow, setSelectedRow] = useState('A');
  const [selectedSeat, setSelectedSeat] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRowDropdown, setShowRowDropdown] = useState(false);
  const [showSeatDropdown, setShowSeatDropdown] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  
  // Card form state
    const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cvv, setCvv] = useState('');
  const [cartItems, setCartItems] = useState(cart);
  const swipeableRefs = useRef<{ [key: number]: any }>({});
  
  const paymentMethods = [
    { id: 'card', label: 'Tarjeta', icon: '💳' },
    { id: 'cash', label: 'Efectivo', icon: '💵' },
  ];

  const saleTypes: { id: SaleType; label: string }[] = [
    { id: 'Retail', label: 'Retail' },
    { id: 'Crew', label: 'Crew' },
    { id: 'Happy hour', label: 'Happy hour' },
    { id: 'Invitación business', label: 'Invitación business' },
    { id: 'Invitación turista', label: 'Invitación turista' },
  ];

  const rowOptions = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatOptions = ['1', '2', '3', '4', '5', '6'];

  const removeItem = (index: number) => {
    // Close the swipeable before removing the item
    if (swipeableRefs.current[index]) {
      swipeableRefs.current[index].close();
    }
    
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const handlePayment = async () => {
    const seatNumber = `${selectedRow}${selectedSeat}`;
    
    if (cartItems.length === 0) {
      Alert.alert('Error', 'No hay productos en el carrito');
      return;
    }
    
    if (selectedPaymentMethod === 'card' && (!cardNumber || !expiryDate || !cardholderName || !cvv)) {
      Alert.alert('Error', 'Por favor complete todos los datos de la tarjeta');
      return;
    }

    setIsProcessing(true);

    try {
      const updatedTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      const paymentRequest = {
        items: cartItems,
        total: updatedTotal,
        currency: currency as Currency,
        saleType: saleType as SaleType,
        seatNumber: seatNumber.trim(),
      };

      const response = await ApiService.processPayment(paymentRequest);

      if (response.success) {
        Alert.alert(
          'Pago Exitoso',
          `Transacción completada\nID: ${response.transactionId}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ProductSelection'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Error al procesar el pago');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar el pago. Intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, curr: string) => {
    if (amount === undefined || amount === null || curr === undefined) {
      return '0.00 €';
    }
    return CurrencyConverter.formatCurrency(amount, curr as Currency);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Ticket</Text>
          <Text style={styles.subtitle}>Productos seleccionados</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            // Pass the updated cart back to ProductSelectionScreen
            navigation.navigate('ProductSelection', { updatedCart: cartItems });
          }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <View style={styles.productList}>
        {cartItems.map((item: CartItem, index: number) => (
          <Swipeable
            key={index}
            ref={(ref) => {
              if (ref) {
                swipeableRefs.current[index] = ref;
              }
            }}
            renderRightActions={(progress, dragX) => (
              <View style={styles.deleteButtonContainer}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(index)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
            rightThreshold={40}
          >
            <View style={styles.productCard}>
              <Image
                source={{ uri: item.product.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.product.price * item.quantity, currency)}</Text>
              </View>
              <View style={styles.productQuantity}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
              </View>
            </View>
          </Swipeable>
        ))}
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Top Row - Seat and Total */}
        <View style={styles.topRow}>
          <View style={styles.seatSection}>
            <Text style={styles.seatLabel}>ASIENTO</Text>
            <TouchableOpacity
              style={styles.seatButton}
              onPress={() => setShowRowDropdown(true)}
            >
              <Text style={styles.seatText}>{selectedRow} {selectedSeat}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), currency)}
            </Text>
          </View>
        </View>

        {/* Bottom Row - Payment Options */}
        <View style={styles.paymentRow}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'cash' && styles.selectedPaymentOption,
              cartItems.length === 0 && styles.paymentOptionDisabled
            ]}
            onPress={() => {
              if (cartItems.length === 0) return;
              setSelectedPaymentMethod('cash');
            }}
            disabled={cartItems.length === 0}
          >
            <Text style={[
              styles.paymentIcon,
              cartItems.length === 0 && styles.paymentIconDisabled
            ]}>💰</Text>
            <Text style={[
              styles.paymentLabel,
              cartItems.length === 0 && styles.paymentLabelDisabled
            ]}>Efectivo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'card' && styles.selectedPaymentOption,
              cartItems.length === 0 && styles.paymentOptionDisabled
            ]}
            onPress={() => {
              if (cartItems.length === 0) return;
              setSelectedPaymentMethod('card');
              setShowCardForm(true);
            }}
            disabled={cartItems.length === 0}
          >
            <Text style={[
              styles.paymentIcon,
              cartItems.length === 0 && styles.paymentIconDisabled
            ]}>💳</Text>
            <Text style={[
              styles.paymentLabel,
              cartItems.length === 0 && styles.paymentLabelDisabled
            ]}>Tarjeta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Row Selection Modal */}
      <Modal
        visible={showRowDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRowDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Row</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRowDropdown(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </SafeAreaView>
            
            <FlatList
              data={rowOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item === selectedRow && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setSelectedRow(item);
                    setShowRowDropdown(false);
                    setShowSeatDropdown(true);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === selectedRow && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Seat Selection Modal */}
      <Modal
        visible={showSeatDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSeatDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Seat</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSeatDropdown(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </SafeAreaView>
            
            <FlatList
              data={seatOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item === selectedSeat && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setSelectedSeat(item);
                    setShowSeatDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === selectedSeat && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Card Form Modal */}
      <Modal
        visible={showCardForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCardForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Card Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCardForm(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </SafeAreaView>
            
            <View style={styles.cardForm}>
              <TextInput
                style={styles.cardInput}
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={16}
              />
              <View style={styles.cardRow}>
                <TextInput
                  style={[styles.cardInput, styles.halfInput]}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.cardInput, styles.halfInput]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <TextInput
                style={styles.cardInput}
                placeholder="Cardholder Name"
                value={cardholderName}
                onChangeText={setCardholderName}
              />
              <TouchableOpacity
                style={styles.saveCardButton}
                onPress={() => setShowCardForm(false)}
              >
                <Text style={styles.saveCardButtonText}>Save Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  productList: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  productQuantity: {
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  seatSection: {
    alignItems: 'flex-start',
  },
  seatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  seatButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  seatText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPaymentOption: {
    backgroundColor: '#007AFF',
  },
  paymentIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#CCC',
    fontWeight: '500',
  },
  paymentOptionDisabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.6,
  },
  paymentIconDisabled: {
    opacity: 0.5,
  },
  paymentLabelDisabled: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  cardForm: {
    padding: 16,
  },
  cardInput: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveCardButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveCardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 20,
  },
}); 