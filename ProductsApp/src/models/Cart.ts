import { makeAutoObservable } from 'mobx';
import { CartItem } from './CartItem';
import { Product } from './Product';

export interface CartData {
  items: CartItem[];
}

export class Cart {
  private _items: Map<string, CartItem> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  // Getters
  get items(): CartItem[] {
    return Array.from(this._items.values());
  }

  get itemCount(): number {
    return this._items.size;
  }

  get totalQuantity(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this._items.size === 0;
  }

  // Cart operations
  addItem(product: Product, quantity: number = 1): boolean {
    if (!product.canPurchase(quantity)) {
      return false;
    }

    const existingItem = this._items.get(product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (!product.canPurchase(newQuantity)) {
        return false;
      }
      existingItem.increaseQuantity();
    } else {
      this._items.set(product.id, new CartItem(product, quantity));
    }
    
    return true;
  }

  removeItem(productId: string): boolean {
    return this._items.delete(productId);
  }

  updateItemQuantity(productId: string, quantity: number): boolean {
    const item = this._items.get(productId);
    if (!item) return false;

    if (quantity <= 0) {
      this._items.delete(productId);
      return true;
    }

    if (!item.product.canPurchase(quantity)) {
      return false;
    }

    // Create new item with updated quantity
    this._items.set(productId, new CartItem(item.product, quantity));
    return true;
  }

  getItem(productId: string): CartItem | undefined {
    return this._items.get(productId);
  }

  getItemQuantity(productId: string): number {
    const item = this._items.get(productId);
    return item ? item.quantity : 0;
  }

  clear(): void {
    this._items.clear();
  }

  // Data access
  toJSON(): CartData {
    return {
      items: this.items
    };
  }

  static fromJSON(data: CartData): Cart {
    const cart = new Cart();
    data.items.forEach(item => {
      cart._items.set(item.id, item);
    });
    return cart;
  }
}
