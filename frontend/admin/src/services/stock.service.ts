import { ProductStockType, StockVariant } from '@/types';
import { mockStock } from '@/mock-data/stock';

let stockTypes: ProductStockType[] = [...mockStock];

export const stockService = {
  getAll: (): ProductStockType[] => JSON.parse(JSON.stringify(stockTypes)),
  getByProduct: (productId: string): ProductStockType[] =>
    JSON.parse(JSON.stringify(stockTypes.filter(s => s.productId === productId))),
  toggleEnabled: (id: string): void => {
    stockTypes = stockTypes.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s);
  },
  toggleVisibility: (id: string): void => {
    stockTypes = stockTypes.map(s => s.id === id ? { ...s, isPublicVisible: !s.isPublicVisible } : s);
  },
  updatePrice: (id: string, price: number): void => {
    stockTypes = stockTypes.map(s => s.id === id ? { ...s, price } : s);
  },
  addVariant: (stockTypeId: string, data: Omit<StockVariant, 'id' | 'stockTypeId' | 'isActive'>): void => {
    const variant: StockVariant = { ...data, id: crypto.randomUUID(), stockTypeId, isActive: true };
    stockTypes = stockTypes.map(s => s.id === stockTypeId ? { ...s, variants: [...s.variants, variant] } : s);
  },
  updateVariant: (stockTypeId: string, variantId: string, data: Partial<StockVariant>): void => {
    stockTypes = stockTypes.map(s => s.id === stockTypeId
      ? { ...s, variants: s.variants.map(v => v.id === variantId ? { ...v, ...data } : v) }
      : s
    );
  },
  deleteVariant: (stockTypeId: string, variantId: string): void => {
    stockTypes = stockTypes.map(s => s.id === stockTypeId
      ? { ...s, variants: s.variants.filter(v => v.id !== variantId) }
      : s
    );
  },
  initializeForProduct: (productId: string): void => {
    const existing = stockTypes.filter(s => s.productId === productId);
    if (existing.length === 0) {
      const names: Array<'Brand New' | 'Used' | 'Refurbished'> = ['Brand New', 'Used', 'Refurbished'];
      names.forEach(name => {
        stockTypes.push({ id: crypto.randomUUID(), productId, name, isEnabled: false, isPublicVisible: false, price: 0, variants: [] });
      });
    }
  },
};
