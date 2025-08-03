import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
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
  const [seatNumber, setSeatNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePayment = async () => {
    if (!seatNumber.trim()) {
      Alert.alert('Error', 'Por favor ingrese el número de asiento');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentRequest = {
        items: cart,
        total,
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pago</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Ticket Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Ticket</Text>
        <View style={styles.ticketDetails}>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Tipo de Venta:</Text>
            <Text style={styles.ticketValue}>
              {saleTypes.find(st => st.id === saleType)?.label || saleType}
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Total:</Text>
            <Text style={styles.ticketValue}>{formatCurrency(total, currency)}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Productos:</Text>
            <Text style={styles.ticketValue}>{cart.length} items</Text>
          </View>
        </View>
      </View>

      {/* Seat Assignment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asignación de Asiento</Text>
        <View style={styles.seatInput}>
          <Text style={styles.inputLabel}>Número de Asiento:</Text>
          <TextInput
            style={styles.seatTextInput}
            placeholder="Ingrese el número de asiento"
            value={seatNumber}
            onChangeText={setSeatNumber}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de Pago</Text>
        <View style={styles.paymentMethods}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id as 'cash' | 'card')}
            >
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <Text style={styles.paymentLabel}>{method.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Cart Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productos Seleccionados</Text>
        {cart.map((item: CartItem, index: number) => (
          <View key={index} style={styles.cartItem}>
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName}>{item.product.name}</Text>
              <Text style={styles.cartItemQuantity}>x{item.quantity}</Text>
            </View>
            <Text style={styles.cartItemPrice}>
              {formatCurrency(item.product.price * item.quantity, currency)}
            </Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total a Pagar:</Text>
        <Text style={styles.totalAmount}>{formatCurrency(total, currency)}</Text>
      </View>

      {/* Payment Button */}
      <TouchableOpacity
        style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Procesar Pago</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ticketDetails: {
    gap: 8,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 16,
    color: '#666',
  },
  ticketValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  seatInput: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
  },
  seatTextInput: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    gap: 8,
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  paymentIcon: {
    fontSize: 20,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  cartItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
  },
  payButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 