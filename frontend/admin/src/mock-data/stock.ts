import { ProductStockType } from '@/types';

export const mockStock: ProductStockType[] = [
  // iPhone 15 Pro
  { id: 'sk1', productId: 'p3', name: 'Brand New', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v1', stockTypeId: 'sk1', name: '128GB', price: 999, description: '', isActive: true },
    { id: 'v2', stockTypeId: 'sk1', name: '256GB', price: 1099, description: '', isActive: true },
    { id: 'v3', stockTypeId: 'sk1', name: '512GB', price: 1299, description: '', isActive: true },
    { id: 'v4', stockTypeId: 'sk1', name: '1TB', price: 1499, description: '', isActive: true },
  ]},
  { id: 'sk2', productId: 'p3', name: 'Used', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v5', stockTypeId: 'sk2', name: 'Grade A+', price: 799, description: 'Like new condition', isActive: true },
    { id: 'v6', stockTypeId: 'sk2', name: 'Grade A', price: 699, description: 'Minor wear', isActive: true },
    { id: 'v7', stockTypeId: 'sk2', name: 'Grade B', price: 599, description: 'Visible wear', isActive: true },
  ]},
  { id: 'sk3', productId: 'p3', name: 'Refurbished', isEnabled: true, isPublicVisible: true, price: 749, variants: [] },
  // Galaxy S24 Ultra
  { id: 'sk4', productId: 'p24', name: 'Brand New', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v8', stockTypeId: 'sk4', name: '256GB', price: 1199, description: '', isActive: true },
    { id: 'v9', stockTypeId: 'sk4', name: '512GB', price: 1419, description: '', isActive: true },
    { id: 'v10', stockTypeId: 'sk4', name: '1TB', price: 1659, description: '', isActive: true },
  ]},
  { id: 'sk5', productId: 'p24', name: 'Used', isEnabled: false, isPublicVisible: false, price: 0, variants: [] },
  { id: 'sk6', productId: 'p24', name: 'Refurbished', isEnabled: true, isPublicVisible: true, price: 899, variants: [] },
  // Pixel 8 Pro
  { id: 'sk7', productId: 'p37', name: 'Brand New', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v11', stockTypeId: 'sk7', name: '128GB', price: 899, description: '', isActive: true },
    { id: 'v12', stockTypeId: 'sk7', name: '256GB', price: 999, description: '', isActive: true },
  ]},
  { id: 'sk8', productId: 'p37', name: 'Used', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v13', stockTypeId: 'sk8', name: 'Grade A', price: 649, description: 'Excellent condition', isActive: true },
  ]},
  { id: 'sk9', productId: 'p37', name: 'Refurbished', isEnabled: false, isPublicVisible: false, price: 0, variants: [] },
  // MacBook Pro 14-inch M3
  { id: 'sk10', productId: 'p17', name: 'Brand New', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v14', stockTypeId: 'sk10', name: '18GB/512GB', price: 1999, description: 'M3 Pro base', isActive: true },
    { id: 'v15', stockTypeId: 'sk10', name: '36GB/1TB', price: 2799, description: 'M3 Max', isActive: true },
  ]},
  { id: 'sk11', productId: 'p17', name: 'Used', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v16', stockTypeId: 'sk11', name: 'Grade A+', price: 1599, description: 'Like new', isActive: true },
  ]},
  { id: 'sk12', productId: 'p17', name: 'Refurbished', isEnabled: true, isPublicVisible: true, price: 1699, variants: [] },
  // Xbox Series X
  { id: 'sk13', productId: 'p42', name: 'Brand New', isEnabled: true, isPublicVisible: true, price: 499, variants: [] },
  { id: 'sk14', productId: 'p42', name: 'Used', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v17', stockTypeId: 'sk14', name: 'Good', price: 349, description: 'Working condition', isActive: true },
  ]},
  { id: 'sk15', productId: 'p42', name: 'Refurbished', isEnabled: true, isPublicVisible: true, price: 399, variants: [] },
  // PlayStation 5 Standard
  { id: 'sk16', productId: 'p44', name: 'Brand New', isEnabled: true, isPublicVisible: true, price: 499, variants: [] },
  { id: 'sk17', productId: 'p44', name: 'Used', isEnabled: true, isPublicVisible: true, price: 0, variants: [
    { id: 'v18', stockTypeId: 'sk17', name: 'Good', price: 369, description: 'Working condition', isActive: true },
  ]},
  { id: 'sk18', productId: 'p44', name: 'Refurbished', isEnabled: false, isPublicVisible: false, price: 0, variants: [] },
];
