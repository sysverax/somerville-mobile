import { Category } from '@/src/types';

export const categories: Category[] = [
  // Apple
  { id: 'c1', brandId: 'b1', name: 'iPhone', image: '/placeholder.svg', description: 'Apple iPhones', isActive: true, createdAt: '2024-01-16' },
  { id: 'c2', brandId: 'b1', name: 'iPad', image: '/placeholder.svg', description: 'Apple iPads', isActive: true, createdAt: '2024-01-16' },
  { id: 'c3', brandId: 'b1', name: 'MacBook', image: '/placeholder.svg', description: 'Apple MacBooks', isActive: true, createdAt: '2024-01-16' },
  { id: 'c4', brandId: 'b1', name: 'Apple Watch', image: '/placeholder.svg', description: 'Apple Watch wearables', isActive: true, createdAt: '2024-01-16' },
  // Samsung
  { id: 'c5', brandId: 'b2', name: 'Galaxy S', image: '/placeholder.svg', description: 'Samsung Galaxy S flagship phones', isActive: true, createdAt: '2024-01-16' },
  { id: 'c6', brandId: 'b2', name: 'Galaxy Z (Foldables)', image: '/placeholder.svg', description: 'Samsung Galaxy foldable devices', isActive: true, createdAt: '2024-01-16' },
  { id: 'c7', brandId: 'b2', name: 'Galaxy Tab', image: '/placeholder.svg', description: 'Samsung Galaxy tablets', isActive: true, createdAt: '2024-01-16' },
  { id: 'c8', brandId: 'b2', name: 'Galaxy Watch', image: '/placeholder.svg', description: 'Samsung Galaxy smartwatches', isActive: true, createdAt: '2024-01-16' },
  // Google
  { id: 'c9', brandId: 'b3', name: 'Pixel Phone', image: '/placeholder.svg', description: 'Google Pixel smartphones', isActive: true, createdAt: '2024-02-02' },
  { id: 'c10', brandId: 'b3', name: 'Pixel Tablet', image: '/placeholder.svg', description: 'Google Pixel tablets', isActive: true, createdAt: '2024-02-02' },
  { id: 'c11', brandId: 'b3', name: 'Pixel Watch', image: '/placeholder.svg', description: 'Google Pixel smartwatches', isActive: true, createdAt: '2024-02-02' },
  // Gaming Console
  { id: 'c12', brandId: 'b4', name: 'Xbox', image: '/placeholder.svg', description: 'Microsoft Xbox consoles', isActive: true, createdAt: '2024-02-10' },
  { id: 'c13', brandId: 'b4', name: 'PlayStation', image: '/placeholder.svg', description: 'Sony PlayStation consoles', isActive: true, createdAt: '2024-02-10' },
  // OnePlus
  { id: 'c14', brandId: 'b5', name: 'OnePlus Number Series', image: '/placeholder.svg', description: 'OnePlus flagship phones', isActive: true, createdAt: '2024-03-01' },
  { id: 'c15', brandId: 'b5', name: 'OnePlus Nord', image: '/placeholder.svg', description: 'OnePlus Nord mid-range phones', isActive: true, createdAt: '2024-03-01' },
];
