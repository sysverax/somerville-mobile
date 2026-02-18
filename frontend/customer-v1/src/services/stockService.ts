import { stock } from '@/src/mock-data/stock';
import type { ProductStockType } from '@/src/types';

export const getAllStock = (): ProductStockType[] => {
  return stock;
};

export const getStockByProduct = (productId: string): ProductStockType[] => {
  return stock.filter(s => s.productId === productId && s.isEnabled && s.isPublicVisible);
};

export const getAllStockByProduct = (productId: string): ProductStockType[] => {
  return stock.filter(s => s.productId === productId);
};

/**
 * Get the lowest available price for a product across all stock types and variants.
 */
export const getLowestPrice = (productId: string): number | null => {
  const productStock = getStockByProduct(productId);
  if (productStock.length === 0) return null;

  const prices: number[] = [];
  for (const st of productStock) {
    if (st.variants.length > 0) {
      for (const v of st.variants) {
        if (v.isActive) prices.push(v.price);
      }
    } else if (st.price > 0) {
      prices.push(st.price);
    }
  }

  return prices.length > 0 ? Math.min(...prices) : null;
};

/**
 * Check if a product has any stock available.
 */
export const hasStock = (productId: string): boolean => {
  const productStock = getStockByProduct(productId);
  return productStock.length > 0;
};
