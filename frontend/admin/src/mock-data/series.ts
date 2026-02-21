import { Series } from '@/types';

// export const mockSeries: Series[] = [
//   // Apple > iPhone
//   { id: 's1', categoryId: 'c1', brandId: 'b1', name: 'iPhone 15 Series', image: '/placeholder.svg', description: 'Latest iPhone 15 lineup', isActive: true, createdAt: '2024-01-17' },
//   { id: 's2', categoryId: 'c1', brandId: 'b1', name: 'iPhone 14 Series', image: '/placeholder.svg', description: 'iPhone 14 lineup', isActive: true, createdAt: '2024-01-17' },
//   // Apple > iPad
//   { id: 's3', categoryId: 'c2', brandId: 'b1', name: 'iPad Pro', image: '/placeholder.svg', description: 'iPad Pro with M2 chip', isActive: true, createdAt: '2024-01-17' },
//   { id: 's4', categoryId: 'c2', brandId: 'b1', name: 'iPad Air', image: '/placeholder.svg', description: 'iPad Air series', isActive: true, createdAt: '2024-01-17' },
//   { id: 's5', categoryId: 'c2', brandId: 'b1', name: 'iPad Mini', image: '/placeholder.svg', description: 'iPad Mini compact tablet', isActive: true, createdAt: '2024-01-17' },
//   // Apple > MacBook
//   { id: 's6', categoryId: 'c3', brandId: 'b1', name: 'MacBook Air', image: '/placeholder.svg', description: 'MacBook Air lineup', isActive: true, createdAt: '2024-01-17' },
//   { id: 's7', categoryId: 'c3', brandId: 'b1', name: 'MacBook Pro', image: '/placeholder.svg', description: 'MacBook Pro lineup', isActive: true, createdAt: '2024-01-17' },
//   // Apple > Apple Watch
//   { id: 's8', categoryId: 'c4', brandId: 'b1', name: 'Apple Watch Series 9', image: '/placeholder.svg', description: 'Apple Watch Series 9', isActive: true, createdAt: '2024-01-17' },
//   { id: 's9', categoryId: 'c4', brandId: 'b1', name: 'Apple Watch Ultra', image: '/placeholder.svg', description: 'Apple Watch Ultra premium', isActive: true, createdAt: '2024-01-17' },
//   // Samsung > Galaxy S
//   { id: 's10', categoryId: 'c5', brandId: 'b2', name: 'Galaxy S24 Series', image: '/placeholder.svg', description: 'Samsung Galaxy S24 flagship 2024', isActive: true, createdAt: '2024-01-17' },
//   { id: 's11', categoryId: 'c5', brandId: 'b2', name: 'Galaxy S23 Series', image: '/placeholder.svg', description: 'Samsung Galaxy S23 lineup', isActive: true, createdAt: '2024-01-17' },
//   // Samsung > Galaxy Z
//   { id: 's12', categoryId: 'c6', brandId: 'b2', name: 'Galaxy Z Fold', image: '/placeholder.svg', description: 'Galaxy Z Fold foldable', isActive: true, createdAt: '2024-01-17' },
//   { id: 's13', categoryId: 'c6', brandId: 'b2', name: 'Galaxy Z Flip', image: '/placeholder.svg', description: 'Galaxy Z Flip foldable', isActive: true, createdAt: '2024-01-17' },
//   // Samsung > Galaxy Tab
//   { id: 's14', categoryId: 'c7', brandId: 'b2', name: 'Galaxy Tab S9', image: '/placeholder.svg', description: 'Galaxy Tab S9 series', isActive: true, createdAt: '2024-01-17' },
//   // Samsung > Galaxy Watch
//   { id: 's15', categoryId: 'c8', brandId: 'b2', name: 'Galaxy Watch 6', image: '/placeholder.svg', description: 'Galaxy Watch 6 series', isActive: true, createdAt: '2024-01-17' },
//   // Google > Pixel Phone
//   { id: 's16', categoryId: 'c9', brandId: 'b3', name: 'Pixel 8 Series', image: '/placeholder.svg', description: 'Google Pixel 8 lineup', isActive: true, createdAt: '2024-02-03' },
//   { id: 's17', categoryId: 'c9', brandId: 'b3', name: 'Pixel 7 Series', image: '/placeholder.svg', description: 'Google Pixel 7 lineup', isActive: true, createdAt: '2024-02-03' },
//   // Google > Pixel Tablet
//   { id: 's18', categoryId: 'c10', brandId: 'b3', name: 'Pixel Tablet', image: '/placeholder.svg', description: 'Google Pixel Tablet', isActive: true, createdAt: '2024-02-03' },
//   // Google > Pixel Watch
//   { id: 's19', categoryId: 'c11', brandId: 'b3', name: 'Pixel Watch 2', image: '/placeholder.svg', description: 'Google Pixel Watch 2', isActive: true, createdAt: '2024-02-03' },
//   // Gaming > Xbox
//   { id: 's20', categoryId: 'c12', brandId: 'b4', name: 'Xbox Series X/S', image: '/placeholder.svg', description: 'Xbox Series X and S consoles', isActive: true, createdAt: '2024-02-10' },
//   // Gaming > PlayStation
//   { id: 's21', categoryId: 'c13', brandId: 'b4', name: 'PlayStation 5', image: '/placeholder.svg', description: 'PlayStation 5 consoles', isActive: true, createdAt: '2024-02-10' },
//   // OnePlus > Number Series
//   { id: 's22', categoryId: 'c14', brandId: 'b5', name: 'OnePlus 12 Series', image: '/placeholder.svg', description: 'OnePlus 12 flagship', isActive: true, createdAt: '2024-03-01' },
//   { id: 's23', categoryId: 'c14', brandId: 'b5', name: 'OnePlus 11 Series', image: '/placeholder.svg', description: 'OnePlus 11 flagship', isActive: true, createdAt: '2024-03-01' },
//   // OnePlus > Nord
//   { id: 's24', categoryId: 'c15', brandId: 'b5', name: 'Nord 3 Series', image: '/placeholder.svg', description: 'OnePlus Nord 3 mid-range', isActive: true, createdAt: '2024-03-01' },
// ];


const P = '/mock-images/default/placeholder.png';

export const mockSeries: Series[] = [
  // Apple > iPhone
  { id: 's1', categoryId: 'c1', brandId: 'b1', name: 'iPhone 15 Series', image: '/mock-images/series/iphone15.jpg', description: 'Latest iPhone 15 lineup', isActive: true, createdAt: '2024-01-17' },
  { id: 's2', categoryId: 'c1', brandId: 'b1', name: 'iPhone 14 Series', image: '/mock-images/series/iphone14.jpeg', description: 'iPhone 14 lineup', isActive: true, createdAt: '2024-01-17' },
  // Apple > iPad
  { id: 's3', categoryId: 'c2', brandId: 'b1', name: 'iPad Pro', image: '/mock-images/categories/ipad.png', description: 'iPad Pro with M2 chip', isActive: true, createdAt: '2024-01-17' },
  { id: 's4', categoryId: 'c2', brandId: 'b1', name: 'iPad Air', image: '/mock-images/categories/ipad.png', description: 'iPad Air series', isActive: true, createdAt: '2024-01-17' },
  { id: 's5', categoryId: 'c2', brandId: 'b1', name: 'iPad Mini', image: '/mock-images/categories/ipad.png', description: 'iPad Mini compact tablet', isActive: true, createdAt: '2024-01-17' },
  // Apple > MacBook
  { id: 's6', categoryId: 'c3', brandId: 'b1', name: 'MacBook Air', image: '/mock-images/categories/macbook.png', description: 'MacBook Air lineup', isActive: true, createdAt: '2024-01-17' },
  { id: 's7', categoryId: 'c3', brandId: 'b1', name: 'MacBook Pro', image: '/mock-images/categories/macbook.png', description: 'MacBook Pro lineup', isActive: true, createdAt: '2024-01-17' },
  // Apple > Apple Watch
  { id: 's8', categoryId: 'c4', brandId: 'b1', name: 'Apple Watch Series 9', image: '/mock-images/categories/apple-watch.png', description: 'Apple Watch Series 9', isActive: true, createdAt: '2024-01-17' },
  { id: 's9', categoryId: 'c4', brandId: 'b1', name: 'Apple Watch Ultra', image: '/mock-images/categories/apple-watch.png', description: 'Apple Watch Ultra premium', isActive: true, createdAt: '2024-01-17' },
  // Samsung > Galaxy S
  { id: 's10', categoryId: 'c5', brandId: 'b2', name: 'Galaxy S24 Series', image: '/mock-images/categories/galaxy-s.png', description: 'Samsung Galaxy S24 flagship 2024', isActive: true, createdAt: '2024-01-17' },
  { id: 's11', categoryId: 'c5', brandId: 'b2', name: 'Galaxy S23 Series', image: '/mock-images/categories/galaxy-s.png', description: 'Samsung Galaxy S23 lineup', isActive: true, createdAt: '2024-01-17' },
  // Samsung > Galaxy Z
  { id: 's12', categoryId: 'c6', brandId: 'b2', name: 'Galaxy Z Fold', image: '/mock-images/categories/galaxy-z.png', description: 'Galaxy Z Fold foldable', isActive: true, createdAt: '2024-01-17' },
  { id: 's13', categoryId: 'c6', brandId: 'b2', name: 'Galaxy Z Flip', image: '/mock-images/categories/galaxy-z.png', description: 'Galaxy Z Flip foldable', isActive: true, createdAt: '2024-01-17' },
  // Samsung > Galaxy Tab
  { id: 's14', categoryId: 'c7', brandId: 'b2', name: 'Galaxy Tab S9', image: P, description: 'Galaxy Tab S9 series', isActive: true, createdAt: '2024-01-17' },
  // Samsung > Galaxy Watch
  { id: 's15', categoryId: 'c8', brandId: 'b2', name: 'Galaxy Watch 6', image: '/mock-images/categories/galaxy-watch.png', description: 'Galaxy Watch 6 series', isActive: true, createdAt: '2024-01-17' },
  // Google > Pixel Phone
  { id: 's16', categoryId: 'c9', brandId: 'b3', name: 'Pixel 8 Series', image: '/mock-images/categories/pixel-phone.png', description: 'Google Pixel 8 lineup', isActive: true, createdAt: '2024-02-03' },
  { id: 's17', categoryId: 'c9', brandId: 'b3', name: 'Pixel 7 Series', image: '/mock-images/categories/pixel-phone.png', description: 'Google Pixel 7 lineup', isActive: true, createdAt: '2024-02-03' },
  // Google > Pixel Tablet
  { id: 's18', categoryId: 'c10', brandId: 'b3', name: 'Pixel Tablet', image: P, description: 'Google Pixel Tablet', isActive: true, createdAt: '2024-02-03' },
  // Google > Pixel Watch
  { id: 's19', categoryId: 'c11', brandId: 'b3', name: 'Pixel Watch 2', image: '/mock-images/categories/pixel-watch.png', description: 'Google Pixel Watch 2', isActive: true, createdAt: '2024-02-03' },
  // Gaming > Xbox
  { id: 's20', categoryId: 'c12', brandId: 'b4', name: 'Xbox Series X/S', image: '/mock-images/categories/xbox.png', description: 'Xbox Series X and S consoles', isActive: true, createdAt: '2024-02-10' },
  // Gaming > PlayStation
  { id: 's21', categoryId: 'c13', brandId: 'b4', name: 'PlayStation 5', image: '/mock-images/categories/playstation.png', description: 'PlayStation 5 consoles', isActive: true, createdAt: '2024-02-10' },
  // OnePlus > Number Series
  { id: 's22', categoryId: 'c14', brandId: 'b5', name: 'OnePlus 12 Series', image: '/mock-images/categories/oneplus-number.png', description: 'OnePlus 12 flagship', isActive: true, createdAt: '2024-03-01' },
  { id: 's23', categoryId: 'c14', brandId: 'b5', name: 'OnePlus 11 Series', image: '/mock-images/categories/oneplus-number.png', description: 'OnePlus 11 flagship', isActive: true, createdAt: '2024-03-01' },
  // OnePlus > Nord
  { id: 's24', categoryId: 'c15', brandId: 'b5', name: 'Nord 3 Series', image: '/mock-images/categories/oneplus-nord.png', description: 'OnePlus Nord 3 mid-range', isActive: true, createdAt: '2024-03-01' },
];
