import React, { useState, useRef, useEffect } from 'react';
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
import { observer } from 'mobx-react-lite';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppStore } from '../contexts/AppContext';
import { CartItem, Currency, SaleType } from '../types';
import { CurrencyConverter } from '../utils/currencyConverter';
import { DiscountCalculator } from '../utils/discountCalculator';

type PaymentViewRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentViewNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

export const PaymentView: React.FC = observer(() => {
  const navigation = useNavigation<PaymentViewNavigationProp>();
  const route = useRoute<PaymentViewRouteProp>();
  const { store } = useAppStore();
  const viewModel = store.paymentViewModel;

  useEffect(() => {
    viewModel.initializePayment(route.params);
  }, [route.params]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card'>('card');
  const [selectedRow, setSelectedRow] = useState('A');
  const [selectedSeat, setSelectedSeat] = useState('1');
  const [showRowDropdown, setShowRowDropdown] = useState(false);
  const [showSeatDropdown, setShowSeatDropdown] = useState(false);
  const [cartWasEmptied, setCartWasEmptied] = useState(false);
  const swipeableRefs = useRef<{ [key: number]: any }>({});

  // Local state for input fields
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [expiryDateInput, setExpiryDateInput] = useState('');
  const [cvvInput, setCvvInput] = useState('');
  const [cardholderNameInput, setCardholderNameInput] = useState('');
  const [cashAmountInput, setCashAmountInput] = useState('');

  const rowOptions = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatOptions = ['1', '2', '3', '4', '5', '6'];

  const removeItem = (index: number) => {
    // Close the swipeable before removing the item
    if (swipeableRefs.current[index]) {
      swipeableRefs.current[index].close();
    }
    
    const newCart = [...viewModel.cartItems];
    newCart.splice(index, 1);
    // Update the cart in the viewModel
    viewModel.updateCart(newCart);
    
    // If cart becomes empty, set flag to reset currency when returning to main screen
    if (newCart.length === 0) {
      setCartWasEmptied(true);
    }
  };

  const handlePayment = async (paymentMethod?: 'cash' | 'card') => {
    const method = paymentMethod || selectedPaymentMethod;
    console.log('handlePayment called with method:', method, 'selectedPaymentMethod:', selectedPaymentMethod);
    console.log('Card details - cardNumber:', viewModel.cardNumber, 'expiryDate:', viewModel.expiryDate, 'cardholderName:', viewModel.cardholderName, 'cvv:', viewModel.cvv);
    const seatNumber = `${selectedRow}${selectedSeat}`;
    
    if (viewModel.cartItems.length === 0) {
      Alert.alert('Error', 'No products in cart');
      return;
    }

    if (method === 'cash') {
      console.log('Showing cash amount modal');
      // Show cash amount input modal
      viewModel.showCashPaymentModal();
      return;
    }
    
    if (method === 'card') {
      // Direct validation using local state
      const cardNumberValid = cardNumberInput.length === 16;
      const expiryDateValid = expiryDateInput.replace(/[^0-9]/g, '').length === 4;
      const cvvValid = cvvInput.length === 3;
      const cardholderNameValid = cardholderNameInput.trim().length > 0;
      
      const isFormValid = cardNumberValid && expiryDateValid && cvvValid && cardholderNameValid;
      
      if (!isFormValid) {
        const validationDetails = `
Card Number: ${cardNumberInput.length}/16 (${cardNumberInput})
Expiry Date: ${expiryDateInput.replace(/[^0-9]/g, '').length}/4 (${expiryDateInput})
CVV: ${cvvInput.length}/3 (${cvvInput})
Cardholder Name: ${cardholderNameInput.trim().length} chars ("${cardholderNameInput}")

Form Valid: ${isFormValid ? 'YES' : 'NO'}
        `;
        
        Alert.alert(
          'Validation Failed', 
          `Please complete all card details\n\n${validationDetails}`
        );
        return;
      }
    }

    console.log('Proceeding to processPayment');
    
    // Update ViewModel with local state values before processing
    viewModel.setCardNumber(cardNumberInput);
    viewModel.setExpiryDate(expiryDateInput.replace(/[^0-9]/g, ''));
    viewModel.setCVV(cvvInput);
    viewModel.setCardholderName(cardholderNameInput);
    
    await viewModel.processPayment(method);
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
    const discountedPrice = DiscountCalculator.calculateDiscountedPrice(convertedPrice, viewModel.saleType as SaleType);
    const totalDiscountedPrice = discountedPrice * quantity;
    
    return {
      originalPrice: CurrencyConverter.formatCurrency(convertedPrice * quantity, targetCurrency as Currency),
      discountedPrice: CurrencyConverter.formatCurrency(totalDiscountedPrice, targetCurrency as Currency),
      hasDiscount: DiscountCalculator.hasDiscount(viewModel.saleType as SaleType)
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Receipt</Text>
          <Text style={styles.subtitle}>Selected Products</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            // Pass the updated cart, sale type, and currency reset flag back to ProductSelectionScreen
            navigation.navigate('ProductSelection', { 
              updatedCart: viewModel.cartItems,
              selectedSaleType: viewModel.saleType as SaleType,
              resetCurrency: cartWasEmptied
            });
          }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <View style={styles.productList}>
        {viewModel.cartItems.map((item: CartItem, index: number) => (
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
                  const priceInfo = formatProductPrice(item.product, item.quantity, viewModel.currency);
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
            <Text style={styles.seatLabel}>SEAT</Text>
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
              {formatCurrency(viewModel.total, viewModel.currency)}
            </Text>
            {DiscountCalculator.hasDiscount(viewModel.saleType as SaleType) && (
              <Text style={styles.discountInfo}>
                {DiscountCalculator.getDiscountText(viewModel.saleType as SaleType)} applied
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
              viewModel.cartItems.length === 0 && styles.paymentOptionDisabled
            ]}
            onPress={() => {
              console.log('Cash button pressed');
              if (viewModel.cartItems.length === 0) return;
              console.log('Setting payment method to cash');
              setSelectedPaymentMethod('cash');
              // Trigger payment immediately for cash with explicit cash parameter
              console.log('Calling handlePayment from cash button');
              handlePayment('cash');
            }}
            disabled={viewModel.cartItems.length === 0}
          >
            <Text style={[
              styles.paymentIcon,
              viewModel.cartItems.length === 0 && styles.paymentIconDisabled
            ]}>💰</Text>
            <Text style={[
              styles.paymentLabel,
              viewModel.cartItems.length === 0 && styles.paymentLabelDisabled
            ]}>Cash</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'card' && styles.selectedPaymentOption,
              viewModel.cartItems.length === 0 && styles.paymentOptionDisabled
            ]}
            onPress={() => {
              if (viewModel.cartItems.length === 0) return;
              setSelectedPaymentMethod('card');
              viewModel.showCardPaymentModal();
            }}
            disabled={viewModel.cartItems.length === 0}
          >
            <Text style={[
              styles.paymentIcon,
              viewModel.cartItems.length === 0 && styles.paymentIconDisabled
            ]}>💳</Text>
            <Text style={[
              styles.paymentLabel,
              viewModel.cartItems.length === 0 && styles.paymentLabelDisabled
            ]}>Card</Text>
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
        visible={viewModel.showCardForm}
        transparent
        animationType="slide"
        onRequestClose={() => viewModel.hideCardPaymentModal()}
        key={`card-modal-${viewModel.showCardForm}`}
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
                onPress={() => viewModel.hideCardPaymentModal()}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </SafeAreaView>
            
            <ScrollView style={styles.cardForm} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.cardInput}
                placeholder="Card Number"
                value={cardNumberInput}
                onChangeText={(text) => {
                  setCardNumberInput(text);
                  viewModel.setCardNumber(text);
                }}
                keyboardType="numeric"
                maxLength={16}
                autoFocus
              />
              <View style={styles.cardRow}>
                <TextInput
                  style={[styles.cardInput, styles.halfInput]}
                  placeholder="MM/YY"
                  value={expiryDateInput}
                  onChangeText={(text) => {
                    setExpiryDateInput(text);
                    // Remove any non-numeric characters for storage
                    const numbersOnly = text.replace(/[^0-9]/g, '');
                    viewModel.setExpiryDate(numbersOnly);
                  }}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.cardInput, styles.halfInput]}
                  placeholder="CVV"
                  value={cvvInput}
                  onChangeText={(text) => {
                    setCvvInput(text);
                    viewModel.setCVV(text);
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <TextInput
                style={styles.cardInput}
                placeholder="Cardholder Name"
                value={cardholderNameInput}
                onChangeText={(text) => {
                  setCardholderNameInput(text);
                  viewModel.setCardholderName(text);
                }}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[
                  styles.saveCardButton,
                  !viewModel.isFormValid && styles.saveCardButtonDisabled
                ]}
                onPress={() => {
                  if (viewModel.isFormValid) {
                    viewModel.hideCardPaymentModal();
                    handlePayment();
                  }
                }}
                disabled={!viewModel.isFormValid}
              >
                <Text style={[
                  styles.saveCardButtonText,
                  !viewModel.isFormValid && styles.saveCardButtonTextDisabled
                ]}>Pay</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

            {/* Cash Amount Modal */}
      <Modal
        visible={viewModel.showCashAmountModal}
        transparent
        animationType="slide"
        onRequestClose={() => viewModel.hideCashPaymentModal()}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -40 : -20}
        >
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cash Payment</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  viewModel.hideCashPaymentModal();
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </SafeAreaView>
            
            <ScrollView style={styles.cashForm} showsVerticalScrollIndicator={false}>
              <View style={styles.cashAmountSection}>
                <Text style={styles.cashAmountLabel}>Total to Pay:</Text>
                <Text style={styles.cashAmountTotal}>{formatCurrency(viewModel.total, viewModel.currency)}</Text>
              </View>
              
              <View style={styles.cashInputSection}>
                <Text style={styles.cashInputLabel}>Amount Received:</Text>
                <TextInput
                  style={styles.cashInput}
                  placeholder="0.00"
                  value={cashAmountInput}
                  onChangeText={(text) => {
                    console.log('Cash amount input:', text);
                    setCashAmountInput(text);
                    viewModel.setCashAmount(text);
                  }}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
              
              {viewModel.cashAmount && parseFloat(viewModel.cashAmount) > 0 && (
                <View style={styles.changeSection}>
                  <Text style={styles.changeLabel}>Change:</Text>
                  <Text style={[
                    styles.changeAmount,
                    parseFloat(viewModel.cashAmount) < viewModel.total ? styles.changeAmountNegative : styles.changeAmountPositive
                  ]}>
                    {formatCurrency(parseFloat(viewModel.cashAmount) - viewModel.total, viewModel.currency)}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.processCashButton,
                  (!viewModel.cashAmount || parseFloat(viewModel.cashAmount) < viewModel.total) && styles.processCashButtonDisabled
                ]}
                onPress={() => viewModel.processPayment('cash')}
                disabled={!viewModel.cashAmount || parseFloat(viewModel.cashAmount) < viewModel.total}
              >
                <Text style={[
                  styles.processCashButtonText,
                  (!viewModel.cashAmount || parseFloat(viewModel.cashAmount) < viewModel.total) && styles.processCashButtonTextDisabled
                ]}>Process Payment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={viewModel.showConfirmationModal}
        transparent
        animationType="fade"
        onRequestClose={() => viewModel.closeConfirmationModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalContent}>
            <View style={styles.confirmationHeader}>
              <Text style={styles.confirmationTitle}>✅ Payment Successful</Text>
            </View>
            
            <View style={styles.confirmationBody}>
              <Text style={styles.confirmationMessage}>
                {viewModel.confirmationData?.message || 'Payment processed successfully'}
              </Text>
              
              {viewModel.confirmationData?.isCashPayment && viewModel.cashChange > 0 && (
                <View style={styles.changeContainer}>
                  <Text style={styles.changeLabel}>Change:</Text>
                  <Text style={styles.changeAmount}>{formatCurrency(viewModel.cashChange, viewModel.currency)}</Text>
                </View>
              )}
              
              {!viewModel.confirmationData?.isCashPayment && (
                <View style={styles.transactionIdContainer}>
                  <Text style={styles.transactionIdLabel}>Transaction ID:</Text>
                  <Text style={styles.transactionIdText}>
                    {viewModel.confirmationData?.transactionId || 'N/A'}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.confirmationButton}
              onPress={() => {
                viewModel.closeConfirmationModal();
                // Reset cart and return to ProductSelectionScreen
                navigation.navigate('ProductSelection', { 
                  updatedCart: [], // Empty cart
                  selectedSaleType: viewModel.saleType as SaleType
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
});

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
    maxHeight: '80%',
    minHeight: '60%',
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
    flex: 1,
    padding: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: Platform.OS === 'ios' ? 300 : 280,
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
