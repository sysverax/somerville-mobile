export type StockTypeName = 'Brand New' | 'Used' | 'Refurbished';

export interface StockVariant {
  id: string;
  stockTypeId: string;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
}

export interface ProductStockType {
  id: string;
  productId: string;
  name: StockTypeName;
  isEnabled: boolean;
  isPublicVisible: boolean;
  price: number;
  variants: StockVariant[];
}
