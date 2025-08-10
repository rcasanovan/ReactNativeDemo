import { makeAutoObservable, runInAction } from 'mobx';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { ApiService } from '../services/api';
import { CurrencyConverter } from '../utils/currencyConverter';
import { DiscountCalculator } from '../utils/discountCalculator';

export type Currency = 'USD' | 'EUR' | 'GBP';
export type SaleType = 'Retail' | 'Crew' | 'Happy hour' | 'Invitación business' | 'Invitación turista';

export class ProductSelectionViewModel {
  // Observable state
  products: Product[] = [];
  cart: Cart = new Cart();
  selectedCurrency: Currency = 'USD';
  selectedSaleType: SaleType = 'Retail';
  selectedFilter: string = 'all';
  loading: boolean = false;
  error: string | null = null;
  showCurrencyDropdown: boolean = false;
  showSaleTypeDropdown: boolean = false;
  showFilterDropdown: boolean = false;

  // Computed values
  get filteredProducts(): Product[] {
    if (this.selectedFilter === 'all') {
      return this.products;
    }
    return this.products.filter(product => product.type === this.selectedFilter);
  }

  get productTypes(): string[] {
    const types = new Set(this.products.map(product => product.type));
    return ['all', ...Array.from(types)];
  }

  get total(): number {
    return this.cart.items.reduce((total, item) => {
      const convertedPrice = CurrencyConverter.convert(
        item.product.price,
        item.product.currency,
        this.selectedCurrency
      );
      const discountedPrice = DiscountCalculator.calculateDiscountedPrice(convertedPrice, this.selectedSaleType);
      return total + (discountedPrice * item.quantity);
    }, 0);
  }

  get alternativeCurrencies(): Record<string, string> {
    return this.total > 0 
      ? CurrencyConverter.getAlternativeCurrencies(this.total, this.selectedCurrency) 
      : {};
  }

  get canProceedToPayment(): boolean {
    return !this.cart.isEmpty();
  }

  get isInitialized(): boolean {
    return !this.loading && this.products.length > 0;
  }

  constructor() {
    makeAutoObservable(this);
  }

  // Actions
  async loadProducts(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const productsData = await ApiService.getProducts();
      runInAction(() => {
        this.products = productsData.map(data => Product.fromJSON(data));
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to load products';
        this.loading = false;
      });
    }
  }

  addToCart(product: Product): void {
    const success = this.cart.addItem(product);
    if (!success) {
      this.error = 'Cannot add more items than available in inventory';
    }
  }

  removeFromCart(product: Product): void {
    const item = this.cart.getItem(product.id);
    if (item) {
      if (item.quantity > 1) {
        this.cart.updateItemQuantity(product.id, item.quantity - 1);
      } else {
        this.cart.removeItem(product.id);
      }
    }
  }

  getCartQuantity(productId: string): number {
    return this.cart.getItemQuantity(productId);
  }

  setSelectedCurrency(currency: Currency): void {
    this.selectedCurrency = currency;
  }

  setSelectedSaleType(saleType: SaleType): void {
    this.selectedSaleType = saleType;
  }

  setSelectedFilter(filter: string): void {
    this.selectedFilter = filter;
  }

  setShowCurrencyDropdown(show: boolean): void {
    this.showCurrencyDropdown = show;
  }

  setShowSaleTypeDropdown(show: boolean): void {
    this.showSaleTypeDropdown = show;
  }

  setShowFilterDropdown(show: boolean): void {
    this.showFilterDropdown = show;
  }

  clearError(): void {
    this.error = null;
  }

  // Navigation data
  getPaymentData() {
    return {
      cart: this.cart.items,
      total: this.total,
      currency: this.selectedCurrency,
      saleType: this.selectedSaleType,
    };
  }

  // Update cart from payment screen (when returning)
  updateCartFromPayment(cartItems: any[]): void {
    this.cart.clear();
    cartItems.forEach(item => {
      const product = Product.fromJSON(item.product);
      this.cart.addItem(product, item.quantity);
    });
  }
}
