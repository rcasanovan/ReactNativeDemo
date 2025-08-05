import { SaleType } from '../types';

// Discount configuration for each sale type
export const DISCOUNT_CONFIG: Record<SaleType, number> = {
  'Retail': 0, // 0% discount - full price
  'Crew': 25, // 25% discount for crew members
  'Happy hour': 30, // 30% discount during happy hour
  'Invitación business': 50, // 50% discount for business invitations
  'Invitación turista': 40, // 40% discount for tourist invitations
};

export class DiscountCalculator {
  /**
   * Calculate the discounted price based on sale type
   * @param originalPrice - The original price
   * @param saleType - The selected sale type
   * @returns The discounted price
   */
  static calculateDiscountedPrice(originalPrice: number, saleType: SaleType): number {
    const discountPercentage = DISCOUNT_CONFIG[saleType];
    const discountAmount = (originalPrice * discountPercentage) / 100;
    return originalPrice - discountAmount;
  }

  /**
   * Get the discount percentage for a sale type
   * @param saleType - The selected sale type
   * @returns The discount percentage
   */
  static getDiscountPercentage(saleType: SaleType): number {
    return DISCOUNT_CONFIG[saleType];
  }

  /**
   * Check if a sale type has any discount
   * @param saleType - The selected sale type
   * @returns True if there's a discount, false otherwise
   */
  static hasDiscount(saleType: SaleType): boolean {
    return DISCOUNT_CONFIG[saleType] > 0;
  }

  /**
   * Format discount information for display
   * @param saleType - The selected sale type
   * @returns Formatted discount text
   */
  static getDiscountText(saleType: SaleType): string {
    const discount = DISCOUNT_CONFIG[saleType];
    if (discount === 0) {
      return 'No discount';
    }
    return `${discount}% OFF`;
  }
} 