import { makeAutoObservable } from 'mobx';
import { Product } from './Product';

export interface CartItemData {
  product: Product;
  quantity: number;
}

export class CartItem {
  private _product: Product;
  private _quantity: number;

  constructor(product: Product, quantity: number = 1) {
    this._product = product;
    this._quantity = quantity;
    makeAutoObservable(this);
  }

  // Getters
  get product(): Product { return this._product; }
  get quantity(): number { return this._quantity; }
  get id(): string { return this._product.id; }

  // Business logic methods
  getTotalPrice(): number {
    return this._product.price * this._quantity;
  }

  getFormattedTotalPrice(): string {
    return `${this.getTotalPrice().toFixed(2)} ${this._product.currency}`;
  }

  canIncreaseQuantity(): boolean {
    return this._product.canPurchase(this._quantity + 1);
  }

  increaseQuantity(): boolean {
    if (this.canIncreaseQuantity()) {
      this._quantity++;
      return true;
    }
    return false;
  }

  decreaseQuantity(): boolean {
    if (this._quantity > 1) {
      this._quantity--;
      return true;
    }
    return false;
  }

  remove(): boolean {
    this._quantity = 0;
    return true;
  }

  // Data access
  toJSON(): CartItemData {
    return {
      product: this._product,
      quantity: this._quantity
    };
  }

  static fromJSON(data: CartItemData): CartItem {
    return new CartItem(data.product, data.quantity);
  }
}
