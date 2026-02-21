import { useState, useCallback } from 'react';
import { ProductStockType, StockVariant } from '@/types';
import { stockService } from '@/services/stock.service';

export const useStock = () => {
  const [stockTypes, setStockTypes] = useState<ProductStockType[]>(stockService.getAll());
  const refresh = useCallback(() => setStockTypes(stockService.getAll()), []);

  const getByProduct = useCallback((productId: string): ProductStockType[] => {
    stockService.initializeForProduct(productId);
    return stockService.getByProduct(productId);
  }, []);

  const toggleEnabled = useCallback((id: string) => { stockService.toggleEnabled(id); refresh(); }, [refresh]);
  const toggleVisibility = useCallback((id: string) => { stockService.toggleVisibility(id); refresh(); }, [refresh]);
  const updatePrice = useCallback((id: string, price: number) => { stockService.updatePrice(id, price); refresh(); }, [refresh]);

  const addVariant = useCallback((stockTypeId: string, data: Omit<StockVariant, 'id' | 'stockTypeId' | 'isActive'>) => {
    stockService.addVariant(stockTypeId, data);
    refresh();
  }, [refresh]);

  const updateVariant = useCallback((stockTypeId: string, variantId: string, data: Partial<StockVariant>) => {
    stockService.updateVariant(stockTypeId, variantId, data);
    refresh();
  }, [refresh]);

  const deleteVariant = useCallback((stockTypeId: string, variantId: string) => {
    stockService.deleteVariant(stockTypeId, variantId);
    refresh();
  }, [refresh]);

  return { stockTypes, getByProduct, toggleEnabled, toggleVisibility, updatePrice, addVariant, updateVariant, deleteVariant, refresh };
};
