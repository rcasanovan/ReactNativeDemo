import { Currency } from '../types';

export interface ProductData {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  type: string;
  image: string;
  inventory: number;
}

export class Product {
  private _data: ProductData;

  constructor(data: ProductData) {
    this._data = data;
  }

  // Getters
  get id(): string { return this._data.id; }
  get name(): string { return this._data.name; }
  get price(): number { return this._data.price; }
  get currency(): Currency { return this._data.currency; }
  get type(): string { return this._data.type; }
  get image(): string { return this._data.image; }
  get inventory(): number { return this._data.inventory; }

  // Business logic methods
  isAvailable(): boolean {
    return this.inventory > 0;
  }

  canPurchase(quantity: number): boolean {
    return this.inventory >= quantity;
  }

  getFormattedPrice(): string {
    return `${this.price.toFixed(2)} ${this.currency}`;
  }

  // Data access
  toJSON(): ProductData {
    return { ...this._data };
  }

  static fromJSON(data: ProductData): Product {
    return new Product(data);
  }
}
