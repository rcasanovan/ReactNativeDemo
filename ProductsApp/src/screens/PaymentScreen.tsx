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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ApiService } from '../services/api';
import { CartItem, Currency, SaleType } from '../types';
import { CurrencyConverter } from '../utils/currencyConverter';
import { DiscountCalculator } from '../utils/discountCalculator';

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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{ message: string; transactionId: string; isCashPayment?: boolean } | null>(null);
  const [showCashAmountModal, setShowCashAmountModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [cashChange, setCashChange] = useState(0);
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

  // Validation functions
  const validateCardNumber = (text: string) => {
    // Only allow numbers and limit to 16 digits
    const numbersOnly = text.replace(/[^0-9]/g, '');
    return numbersOnly.slice(0, 16);
  };

  const validateExpiryDate = (text: string) => {
    // Only allow numbers and forward slash
    const cleaned = text.replace(/[^0-9/]/g, '');
    
    // Auto-insert slash after 2 digits
    if (cleaned.length >= 2 && !cleaned.includes('/')) {
      const month = cleaned.slice(0, 2);
      const year = cleaned.slice(2);
      
      // Validate month range (01-12)
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        // If invalid month, only return the first digit if it could be valid
        if (monthNum >= 10 && monthNum <= 19) {
          return month.slice(0, 1);
        }
        return '';
      }
      
      return month + (year ? '/' + year : '');
    }
    
    // If we have a slash, validate the month part
    if (cleaned.includes('/')) {
      const parts = cleaned.split('/');
      const month = parts[0];
      const year = parts[1] || '';
      
      if (month.length === 2) {
        const monthNum = parseInt(month, 10);
        if (monthNum < 1 || monthNum > 12) {
          // Return only the first digit if invalid
          return month.slice(0, 1) + '/' + year;
        }
      }
    }
    
    return cleaned;
  };

  const validateCVV = (text: string) => {
    // Only allow numbers and limit to 4 digits
    const numbersOnly = text.replace(/[^0-9]/g, '');
    return numbersOnly.slice(0, 4);
  };

  const validateCardholderName = (text: string) => {
    // Only allow letters, spaces, and common name characters
    return text.replace(/[^a-zA-Z\s\-'\.]/g, '');
  };

  const validateCashAmount = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return cleaned;
  };

  // Check if all card fields are completed and valid
  const isCardFormComplete = cardNumber.trim() !== '' && 
                            cardNumber.length === 16 &&
                            expiryDate.trim() !== '' && 
                            expiryDate.length === 5 &&
                            cardholderName.trim() !== '' && 
                            cvv.trim() !== '' &&
                            cvv.length >= 3;

  const removeItem = (index: number) => {
    // Close the swipeable before removing the item
    if (swipeableRefs.current[index]) {
      swipeableRefs.current[index].close();
    }
    
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const handlePayment = async (paymentMethod?: 'cash' | 'card') => {
    const method = paymentMethod || selectedPaymentMethod;
    console.log('handlePayment called with method:', method, 'selectedPaymentMethod:', selectedPaymentMethod);
    console.log('Card details - cardNumber:', cardNumber, 'expiryDate:', expiryDate, 'cardholderName:', cardholderName, 'cvv:', cvv);
    const seatNumber = `${selectedRow}${selectedSeat}`;
    
    if (cartItems.length === 0) {
      Alert.alert('Error', 'No hay productos en el carrito');
      return;
    }

    if (method === 'cash') {
      console.log('Showing cash amount modal');
      // Show cash amount input modal
      setShowCashAmountModal(true);
      return;
    }
    
    if (method === 'card' && (!cardNumber || !expiryDate || !cardholderName || !cvv)) {
      console.log('Card validation failed - showing error');
      Alert.alert('Error', 'Por favor complete todos los datos de la tarjeta');
      return;
    }

    console.log('Proceeding to processPayment');
    await processPayment();
  };

  const processPayment = async () => {
    const seatNumber = `${selectedRow}${selectedSeat}`;
    setIsProcessing(true);

    try {
      const paymentRequest = {
        items: cartItems,
        total: total, // Use the discounted total passed from ProductSelectionScreen
        currency: currency as Currency,
        saleType: saleType as SaleType,
        seatNumber: seatNumber.trim(),
      };

      const response = await ApiService.processPayment(paymentRequest);

      if (response.success) {
        // Call the payment response endpoint
        try {
          const paymentResponse = await ApiService.getPaymentResponse(response.transactionId!);
          
          if (paymentResponse.success) {
            // Show confirmation modal with the response data
            setConfirmationData({
              message: paymentResponse.message,
              transactionId: paymentResponse.transactionId || response.transactionId!,
              isCashPayment: selectedPaymentMethod === 'cash'
            });
            setShowConfirmationModal(true);
          } else {
            Alert.alert('Error', paymentResponse.message || 'Error al obtener la confirmación del pago');
          }
        } catch (error) {
          console.error('Error fetching payment response:', error);
          // Fallback to showing basic success message
          setConfirmationData({
            message: 'Payment processed successfully',
            transactionId: response.transactionId!,
            isCashPayment: selectedPaymentMethod === 'cash'
          });
          setShowConfirmationModal(true);
        }
      } else {
        Alert.alert('Error', response.message || 'Error al procesar el pago');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar el pago. Intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = () => {
    console.log('handleCashPayment called with cashAmount:', cashAmount);
    const cashAmountNum = parseFloat(cashAmount);
    
    if (isNaN(cashAmountNum) || cashAmountNum <= 0) {
      Alert.alert('Error', 'Por favor ingrese un monto válido');
      return;
    }
    
    if (cashAmountNum < total) {
      Alert.alert('Error', `El monto debe ser al menos ${formatCurrency(total, currency)}`);
      return;
    }
    
    // Calculate change
    const change = cashAmountNum - total;
    setCashChange(change);
    
    // Close cash amount modal and process payment
    setShowCashAmountModal(false);
    setCashAmount(''); // Reset cash amount
    processPayment();
  };

  const formatCurrency = (amount: number, curr: string) => {
    if (amount === undefined || amount === null || curr === undefined) {
      return '0.00 $';
    }
    return CurrencyConverter.formatCurrency(amount, curr as Currency);
  };

  const formatProductPrice = (product: any, quantity: number, targetCurrency: string) => {
    const convertedPrice = CurrencyConverter.convert(
      product.price,
      product.currency,
      targetCurrency as Currency
    );
    const discountedPrice = DiscountCalculator.calculateDiscountedPrice(convertedPrice, saleType as SaleType);
    const totalDiscountedPrice = discountedPrice * quantity;
    
    return {
      originalPrice: CurrencyConverter.formatCurrency(convertedPrice * quantity, targetCurrency as Currency),
      discountedPrice: CurrencyConverter.formatCurrency(totalDiscountedPrice, targetCurrency as Currency),
      hasDiscount: DiscountCalculator.hasDiscount(saleType as SaleType)
    };
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
            // Pass the updated cart and sale type back to ProductSelectionScreen
            navigation.navigate('ProductSelection', { 
              updatedCart: cartItems,
              selectedSaleType: saleType as SaleType
            });
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
                {(() => {
                  const priceInfo = formatProductPrice(item.product, item.quantity, currency);
                  return priceInfo.hasDiscount ? (
                    <View style={styles.priceContainer}>
                      <Text style={styles.originalPriceText}>{priceInfo.originalPrice}</Text>
                      <Text style={styles.productPrice}>{priceInfo.discountedPrice}</Text>
                    </View>
                  ) : (
                    <Text style={styles.productPrice}>{priceInfo.discountedPrice}</Text>
                  );
                })()}
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
              {formatCurrency(total, currency)}
            </Text>
            {DiscountCalculator.hasDiscount(saleType as SaleType) && (
              <Text style={styles.discountInfo}>
                {DiscountCalculator.getDiscountText(saleType as SaleType)} applied
              </Text>
            )}
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
              console.log('Cash button pressed');
              if (cartItems.length === 0) return;
              console.log('Setting payment method to cash');
              setSelectedPaymentMethod('cash');
              // Trigger payment immediately for cash with explicit cash parameter
              console.log('Calling handlePayment from cash button');
              handlePayment('cash');
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
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
            
            <ScrollView style={styles.cardForm} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.cardInput}
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(validateCardNumber(text))}
                keyboardType="numeric"
                maxLength={16}
                autoFocus
              />
              <View style={styles.cardRow}>
                <TextInput
                  style={[styles.cardInput, styles.halfInput]}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(validateExpiryDate(text))}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.cardInput, styles.halfInput]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={(text) => setCvv(validateCVV(text))}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <TextInput
                style={styles.cardInput}
                placeholder="Cardholder Name"
                value={cardholderName}
                onChangeText={(text) => setCardholderName(validateCardholderName(text))}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[
                  styles.saveCardButton,
                  !isCardFormComplete && styles.saveCardButtonDisabled
                ]}
                onPress={() => {
                  if (isCardFormComplete) {
                    setShowCardForm(false);
                    handlePayment();
                  }
                }}
                disabled={!isCardFormComplete}
              >
                <Text style={[
                  styles.saveCardButtonText,
                  !isCardFormComplete && styles.saveCardButtonTextDisabled
                ]}>Pay</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Cash Amount Modal */}
      <Modal
        visible={showCashAmountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCashAmountModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cash Payment</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowCashAmountModal(false);
                  setCashAmount(''); // Reset cash amount when modal is closed
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </SafeAreaView>
            
            <ScrollView style={styles.cashForm} showsVerticalScrollIndicator={false}>
              <View style={styles.cashAmountSection}>
                <Text style={styles.cashAmountLabel}>Total to Pay:</Text>
                <Text style={styles.cashAmountTotal}>{formatCurrency(total, currency)}</Text>
              </View>
              
              <View style={styles.cashInputSection}>
                <Text style={styles.cashInputLabel}>Amount Received:</Text>
                <TextInput
                  style={styles.cashInput}
                  placeholder="0.00"
                  value={cashAmount}
                  onChangeText={(text) => setCashAmount(validateCashAmount(text))}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
              
              {cashAmount && parseFloat(cashAmount) > 0 && (
                <View style={styles.changeSection}>
                  <Text style={styles.changeLabel}>Change:</Text>
                  <Text style={[
                    styles.changeAmount,
                    parseFloat(cashAmount) < total ? styles.changeAmountNegative : styles.changeAmountPositive
                  ]}>
                    {formatCurrency(parseFloat(cashAmount) - total, currency)}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.processCashButton,
                  (!cashAmount || parseFloat(cashAmount) < total) && styles.processCashButtonDisabled
                ]}
                onPress={handleCashPayment}
                disabled={!cashAmount || parseFloat(cashAmount) < total}
              >
                <Text style={[
                  styles.processCashButtonText,
                  (!cashAmount || parseFloat(cashAmount) < total) && styles.processCashButtonTextDisabled
                ]}>Process Payment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalContent}>
            <View style={styles.confirmationHeader}>
              <Text style={styles.confirmationTitle}>✅ Payment Successful</Text>
            </View>
            
            <View style={styles.confirmationBody}>
              <Text style={styles.confirmationMessage}>
                {confirmationData?.message || 'Payment processed successfully'}
              </Text>
              
              {confirmationData?.isCashPayment && cashChange > 0 && (
                <View style={styles.changeContainer}>
                  <Text style={styles.changeLabel}>Change:</Text>
                  <Text style={styles.changeAmount}>{formatCurrency(cashChange, currency)}</Text>
                </View>
              )}
              
              {!confirmationData?.isCashPayment && (
                <View style={styles.transactionIdContainer}>
                  <Text style={styles.transactionIdLabel}>Transaction ID:</Text>
                  <Text style={styles.transactionIdText}>
                    {confirmationData?.transactionId || 'N/A'}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.confirmationButton}
              onPress={() => {
                setShowConfirmationModal(false);
                // Reset cart and return to ProductSelectionScreen
                navigation.navigate('ProductSelection', { 
                  updatedCart: [], // Empty cart
                  selectedSaleType: saleType as SaleType
                });
              }}
            >
              <Text style={styles.confirmationButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
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
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    paddingTop: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: 'white',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 26 : 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#666',
    marginTop: Platform.OS === 'ios' ? 4 : 2,
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
  priceContainer: {
    alignItems: 'flex-start',
  },
  originalPriceText: {
    fontSize: 12,
    color: '#FF6B6B',
    textDecorationLine: 'line-through',
    textDecorationColor: '#FF6B6B',
    marginBottom: 2,
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
    padding: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
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
  discountInfo: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 2,
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
    paddingHorizontal: Platform.OS === 'ios' ? 32 : 16,
    paddingVertical: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: Platform.OS === 'ios' ? 8 : 0,
  },
  option: {
    paddingHorizontal: Platform.OS === 'ios' ? 32 : 16,
    paddingVertical: Platform.OS === 'ios' ? 20 : 16,
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
    padding: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
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
  saveCardButtonDisabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.6,
  },
  saveCardButtonTextDisabled: {
    color: '#999',
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
  confirmationModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 32,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationHeader: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  confirmationBody: {
    padding: 24,
    alignItems: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  transactionIdContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  transactionIdLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  confirmationButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cashForm: {
    padding: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
  },
  cashAmountSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cashAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cashAmountTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  cashInputSection: {
    marginBottom: 20,
  },
  cashInputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  cashInput: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    fontSize: 24,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  changeSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  changeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  changeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  changeAmountPositive: {
    color: '#4CAF50',
  },
  changeAmountNegative: {
    color: '#F44336',
  },
  processCashButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  processCashButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  processCashButtonDisabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.6,
  },
  processCashButtonTextDisabled: {
    color: '#999',
  },
  changeContainer: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
}); 