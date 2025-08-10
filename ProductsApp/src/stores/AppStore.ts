import { ProductSelectionViewModel } from '../viewmodels/ProductSelectionViewModel';
import { PaymentViewModel } from '../viewmodels/PaymentViewModel';

export class AppStore {
  productSelectionViewModel: ProductSelectionViewModel;
  paymentViewModel: PaymentViewModel;

  constructor() {
    this.productSelectionViewModel = new ProductSelectionViewModel();
    this.paymentViewModel = new PaymentViewModel();
  }

  // Initialize the app
  async initialize(): Promise<void> {
    await this.productSelectionViewModel.loadProducts();
  }

  // Reset all stores (useful for testing or logout)
  reset(): void {
    this.productSelectionViewModel = new ProductSelectionViewModel();
    this.paymentViewModel = new PaymentViewModel();
  }
}

// Create a singleton instance
export const appStore = new AppStore();
