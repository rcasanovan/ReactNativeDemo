import { makeAutoObservable, runInAction } from 'mobx';
import { CartItem } from '../models/CartItem';
import { ApiService } from '../services/api';
import { CurrencyConverter } from '../utils/currencyConverter';
import { DiscountCalculator } from '../utils/discountCalculator';

export type Currency = 'USD' | 'EUR' | 'GBP';
export type SaleType = 'Retail' | 'Crew' | 'Happy hour' | 'Business Invitation' | 'Tourist Invitation';
export type PaymentMethod = 'cash' | 'card';

export interface PaymentData {
  cart: CartItem[];
  total: number;
  currency: string;
  saleType: SaleType;
}



export class PaymentViewModel {
  // Observable state
  paymentData: PaymentData | null = null;
  cardNumber: string = '';
  expiryDate: string = '';
  cvv: string = '';
  cardholderName: string = '';
  cashAmount: string = '';
  showCardForm: boolean = false;
  showCashAmountModal: boolean = false;
  showConfirmationModal: boolean = false;
  processing: boolean = false;
  error: string | null = null;
  confirmationData: any = null;
  cashChange: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed values
  get cartItems(): CartItem[] {
    return this.paymentData?.cart || [];
  }

  get total(): number {
    // Calculate total dynamically from current cart items
    if (!this.cartItems || this.cartItems.length === 0) {
      return 0;
    }
    
    return this.cartItems.reduce((sum, item) => {
      const convertedPrice = CurrencyConverter.convert(
        item.product.price,
        item.product.currency,
        this.currency as Currency
      );
      const discountedPrice = DiscountCalculator.calculateDiscountedPrice(
        convertedPrice,
        this.saleType
      );
      return sum + (discountedPrice * item.quantity);
    }, 0);
  }

  get currency(): string {
    return this.paymentData?.currency || 'USD';
  }

  get saleType(): SaleType {
    return this.paymentData?.saleType || 'Retail';
  }

  get formattedTotal(): string {
    return this.formatCurrency(this.total, this.currency);
  }

  get cashAmountNumber(): number {
    return parseFloat(this.cashAmount || '') || 0;
  }

  get cashChangeAmount(): number {
    return this.cashAmountNumber - this.total;
  }

  get canProcessCashPayment(): boolean {
    return this.cashAmountNumber >= this.total && this.cashAmountNumber > 0;
  }

  get formattedExpiryDate(): string {
    if (this.expiryDate.length >= 2) {
      return this.expiryDate.slice(0, 2) + '/' + this.expiryDate.slice(2);
    }
    return this.expiryDate;
  }

  get isFormValid(): boolean {
    const cardNumberValid = this.cardNumber.length === 16;
    const expiryDateValid = this.expiryDate.length === 4;
    const cvvValid = this.cvv.length === 3;
    const cardholderNameValid = this.cardholderName.trim().length > 0;
    
    console.log('Form validation check:', {
      cardNumber: this.cardNumber.length,
      cardNumberValid,
      expiryDate: this.expiryDate.length,
      expiryDateValid,
      cvv: this.cvv.length,
      cvvValid,
      cardholderName: this.cardholderName.trim().length,
      cardholderNameValid,
      cardholderNameRaw: `"${this.cardholderName}"`
    });
    
    const isValid = cardNumberValid && expiryDateValid && cvvValid && cardholderNameValid;
    console.log('Overall validation result:', isValid);
    
    return isValid;
  }

  // Actions
  initializePayment(data: PaymentData): void {
    this.paymentData = data;
    // Don't reset form here to preserve user input
  }

  updateCart(newCart: CartItem[]): void {
    if (this.paymentData) {
      this.paymentData.cart = newCart;
    }
  }

  resetForm(): void {
    this.cardNumber = '';
    this.expiryDate = '';
    this.cvv = '';
    this.cardholderName = '';
    this.cashAmount = '';
    this.error = null;
  }



  // Form setters
  setCardNumber(value: string): void {
    // Only allow numbers and limit to 16 digits
    const numbersOnly = value.replace(/[^0-9]/g, '');
    this.cardNumber = numbersOnly.slice(0, 16);
  }

  setExpiryDate(value: string): void {
    // Only allow numbers
    const numbersOnly = value.replace(/[^0-9]/g, '');
    
    // Limit to 4 digits
    const limited = numbersOnly.slice(0, 4);
    
    // If we have at least 2 digits, validate the month
    if (limited.length >= 2) {
      const month = parseInt(limited.slice(0, 2), 10);
      
      // Validate month range (01-12)
      if (month < 1 || month > 12) {
        // If invalid month, only keep the first digit if it could be valid
        if (month >= 10 && month <= 19) {
          this.expiryDate = limited.slice(0, 1);
          return;
        }
        this.expiryDate = '';
        return;
      }
    }
    
    // If we have 4 digits, validate the year
    if (limited.length === 4) {
      const month = parseInt(limited.slice(0, 2), 10);
      const year = parseInt(limited.slice(2, 4), 10);
      const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
      
      // Year should be >= current year
      if (year < currentYear) {
        this.expiryDate = limited.slice(0, 3); // Keep only first 3 digits
        return;
      }
    }
    
    this.expiryDate = limited;
  }

  setCVV(value: string): void {
    // Only allow numbers and limit to 3 digits
    const numbersOnly = value.replace(/[^0-9]/g, '');
    this.cvv = numbersOnly.slice(0, 3);
  }

  setCardholderName(value: string): void {
    // Only allow letters, spaces, and common name characters
    this.cardholderName = value.replace(/[^a-zA-Z\s\-'\.]/g, '');
  }

  setCashAmount(value: string): void {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      this.cashAmount = parts[0] + '.' + parts.slice(1).join('');
      return;
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      this.cashAmount = parts[0] + '.' + parts[1].slice(0, 2);
      return;
    }
    
    this.cashAmount = cleaned;
  }

  // Modal controls
  showCardPaymentModal(): void {
    this.showCardForm = true;
    this.showCashAmountModal = false;
  }

  showCashPaymentModal(): void {
    this.showCashAmountModal = true;
    this.showCardForm = false;
  }

  hideCardPaymentModal(): void {
    this.showCardForm = false;
    this.resetForm();
  }

  hideCashPaymentModal(): void {
    this.showCashAmountModal = false;
    this.setCashAmount('');
  }

  // Payment processing
  async processPayment(paymentMethod?: PaymentMethod): Promise<void> {
    if (paymentMethod === 'cash') {
      await this.processCashPayment();
    } else {
      await this.processCardPayment();
    }
  }

  private async processCardPayment(): Promise<void> {
    // Validation is now handled in the View component
    // No need to check isFormValid here

    this.processing = true;
    this.error = null;

    try {
      const paymentRequest = {
        amount: this.total,
        currency: this.currency,
        paymentMethod: 'card',
        cardDetails: {
          cardNumber: this.cardNumber,
          expiryDate: this.expiryDate,
          cvv: this.cvv,
          cardholderName: this.cardholderName,
        },
        items: this.cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const response = await ApiService.processPayment(paymentRequest);
      
      runInAction(() => {
        this.confirmationData = {
          message: 'Payment processed successfully',
          transactionId: response.transactionId,
          isCashPayment: false,
        };
        this.showConfirmationModal = true;
        this.hideCardPaymentModal();
        this.processing = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Payment failed. Please try again.';
        this.processing = false;
      });
    }
  }

  private async processCashPayment(): Promise<void> {
    if (!this.canProcessCashPayment) {
      this.error = 'Cash amount must be greater than or equal to total';
      return;
    }

    this.processing = true;
    this.error = null;

    try {
      const paymentRequest = {
        amount: this.total,
        currency: this.currency,
        paymentMethod: 'cash',
        cashAmount: this.cashAmountNumber,
        items: this.cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const response = await ApiService.processPayment(paymentRequest);
      
      runInAction(() => {
        this.cashChange = this.cashChangeAmount;
        this.confirmationData = {
          message: 'Cash payment processed successfully',
          isCashPayment: true,
        };
        this.showConfirmationModal = true;
        this.hideCashPaymentModal();
        this.processing = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Payment failed. Please try again.';
        this.processing = false;
      });
    }
  }

  // Utility methods
  formatCurrency(amount: number, curr: string): string {
    return `${amount.toFixed(2)} ${curr}`;
  }

  formatProductPrice(product: any, quantity: number, targetCurrency: string): string {
    const convertedPrice = CurrencyConverter.convert(
      product.price,
      product.currency,
      targetCurrency
    );
    const discountedPrice = DiscountCalculator.calculateDiscountedPrice(convertedPrice, this.saleType);
    const total = discountedPrice * quantity;
    return this.formatCurrency(total, targetCurrency);
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.confirmationData = null;
  }

  clearError(): void {
    this.error = null;
  }
}
