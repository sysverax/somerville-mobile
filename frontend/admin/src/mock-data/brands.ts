import { BrandDocument } from '@/types';

// export const mockBrands: Brand[] = [
//   { id: 'b1', name: 'Apple', iconImage: '/placeholder.svg', mainImage: '/placeholder.svg', description: 'Apple Inc. – iPhones, iPads, MacBooks & Apple Watch', isActive: true, createdAt: '2024-01-15' },
//   { id: 'b2', name: 'Samsung', iconImage: '/placeholder.svg', mainImage: '/placeholder.svg', description: 'Samsung Electronics – Galaxy phones, tablets & wearables', isActive: true, createdAt: '2024-01-15' },
//   { id: 'b3', name: 'Google', iconImage: '/placeholder.svg', mainImage: '/placeholder.svg', description: 'Google – Pixel phones, tablets & watches', isActive: true, createdAt: '2024-02-01' },
//   { id: 'b4', name: 'Gaming Console', iconImage: '/placeholder.svg', mainImage: '/placeholder.svg', description: 'Gaming consoles – Xbox & PlayStation', isActive: true, createdAt: '2024-02-10' },
//   { id: 'b5', name: 'OnePlus', iconImage: '/placeholder.svg', mainImage: '/placeholder.svg', description: 'OnePlus – Number Series & Nord smartphones', isActive: true, createdAt: '2024-03-01' },
// ];


export const mockBrands: BrandDocument[] = [
  { id: 'b1', name: 'Apple', iconImageUrl: '/mock-images/brands/apple.png', bannerImageUrl: '/mock-images/brands/apple.png', description: 'Apple Inc. – iPhones, iPads, MacBooks & Apple Watch', isActive: true, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: 'b2', name: 'Samsung', iconImageUrl: '/mock-images/brands/samsung.png', bannerImageUrl: '/mock-images/brands/samsung.png', description: 'Samsung Electronics – Galaxy phones, tablets & wearables', isActive: true, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: 'b3', name: 'Google', iconImageUrl: '/mock-images/brands/google.png', bannerImageUrl: '/mock-images/brands/google.png', description: 'Google – Pixel phones, tablets & watches', isActive: true, createdAt: '2024-02-01', updatedAt: '2024-02-01' },
  { id: 'b4', name: 'Gaming Console', iconImageUrl: '/mock-images/brands/gaming-console.png', bannerImageUrl: '/mock-images/brands/gaming-console.png', description: 'Gaming consoles – Xbox & PlayStation', isActive: true, createdAt: '2024-02-10', updatedAt: '2024-02-10' },
  { id: 'b5', name: 'OnePlus', iconImageUrl: '/mock-images/brands/oneplus.png', bannerImageUrl: '/mock-images/brands/oneplus.png', description: 'OnePlus – Number Series & Nord smartphones', isActive: true, createdAt: '2024-03-01', updatedAt: '2024-03-01' },
];