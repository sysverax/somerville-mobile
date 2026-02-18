import { ServiceRecord, ServiceTemplate, ServiceAssignment, ServiceProductOverride } from '@/src/types';

export const serviceRecords: ServiceRecord[] = [
  // Brand-level services
  { id: 'svc1', name: 'Screen Repair', description: 'Fix cracked or damaged screens', level: 'brand', brandId: 'b1', basePrice: 150, estimatedTime: 60, isActive: true, createdAt: '2024-01-20' },
  { id: 'svc2', name: 'Battery Replacement', description: 'Replace worn-out battery', level: 'brand', brandId: 'b1', basePrice: 80, estimatedTime: 45, isActive: true, createdAt: '2024-01-21' },
  { id: 'svc3', name: 'Full Diagnostic', description: 'Complete device health check', level: 'brand', brandId: 'b2', basePrice: 50, estimatedTime: 30, isActive: true, createdAt: '2024-01-22' },
  { id: 'svc4', name: 'Software Reset', description: 'Factory reset and software reinstall', level: 'brand', brandId: 'b3', basePrice: 30, estimatedTime: 20, isActive: true, createdAt: '2024-02-12' },
  { id: 'svc5', name: 'Screen Repair', description: 'Fix cracked or damaged screens', level: 'brand', brandId: 'b2', basePrice: 140, estimatedTime: 60, isActive: true, createdAt: '2024-01-22' },
  { id: 'svc6', name: 'Battery Replacement', description: 'Replace worn-out battery', level: 'brand', brandId: 'b5', basePrice: 60, estimatedTime: 40, isActive: true, createdAt: '2024-03-02' },
  { id: 'svc7', name: 'Console Cleaning', description: 'Deep clean console internals', level: 'brand', brandId: 'b4', basePrice: 45, estimatedTime: 30, isActive: true, createdAt: '2024-02-15' },
  // Category-level services
  { id: 'svc8', name: 'Charging Port Repair', description: 'Fix charging port issues', level: 'category', brandId: 'b1', categoryId: 'c1', basePrice: 90, estimatedTime: 45, isActive: true, createdAt: '2024-01-23' },
  { id: 'svc9', name: 'Keyboard Replacement', description: 'Replace MacBook keyboard', level: 'category', brandId: 'b1', categoryId: 'c3', basePrice: 250, estimatedTime: 120, isActive: true, createdAt: '2024-01-24' },
  { id: 'svc10', name: 'Band Replacement', description: 'Replace watch band and lugs', level: 'category', brandId: 'b1', categoryId: 'c4', basePrice: 35, estimatedTime: 15, isActive: true, createdAt: '2024-01-25' },
  { id: 'svc11', name: 'Fold Screen Repair', description: 'Fix foldable display crease or crack', level: 'category', brandId: 'b2', categoryId: 'c6', basePrice: 350, estimatedTime: 120, isActive: true, createdAt: '2024-01-26' },
  { id: 'svc12', name: 'Controller Repair', description: 'Fix console controller drift or buttons', level: 'category', brandId: 'b4', categoryId: 'c12', basePrice: 40, estimatedTime: 30, isActive: true, createdAt: '2024-02-16' },
  { id: 'svc13', name: 'DualSense Repair', description: 'Fix PS5 DualSense controller issues', level: 'category', brandId: 'b4', categoryId: 'c13', basePrice: 45, estimatedTime: 35, isActive: true, createdAt: '2024-02-16' },
  // Series-level services
  { id: 'svc14', name: 'Back Glass Replacement', description: 'Replace cracked back glass panel', level: 'series', brandId: 'b1', categoryId: 'c1', seriesId: 's1', basePrice: 120, estimatedTime: 50, isActive: true, createdAt: '2024-02-01' },
  { id: 'svc15', name: 'S Pen Calibration', description: 'Calibrate and repair S Pen', level: 'series', brandId: 'b2', categoryId: 'c5', seriesId: 's10', basePrice: 25, estimatedTime: 15, isActive: true, createdAt: '2024-02-02' },
  { id: 'svc16', name: 'Hinge Repair', description: 'Fix folding hinge mechanism', level: 'series', brandId: 'b2', categoryId: 'c6', seriesId: 's12', basePrice: 280, estimatedTime: 90, isActive: true, createdAt: '2024-02-03' },
  // Product-level services
  { id: 'svc17', name: 'Camera Lens Repair', description: 'Fix or replace camera lens', level: 'product', brandId: 'b1', categoryId: 'c1', seriesId: 's1', productId: 'p3', basePrice: 200, estimatedTime: 90, isActive: true, createdAt: '2024-02-05' },
  { id: 'svc18', name: 'Speaker Replacement', description: 'Replace faulty speakers', level: 'product', brandId: 'b2', categoryId: 'c5', seriesId: 's10', productId: 'p24', basePrice: 70, estimatedTime: 40, isActive: true, createdAt: '2024-02-10' },
  { id: 'svc19', name: 'HDMI Port Repair', description: 'Fix HDMI port on console', level: 'product', brandId: 'b4', categoryId: 'c12', seriesId: 's20', productId: 'p42', basePrice: 85, estimatedTime: 60, isActive: true, createdAt: '2024-02-17' },
  { id: 'svc20', name: 'Disc Drive Replacement', description: 'Replace PS5 disc drive', level: 'product', brandId: 'b4', categoryId: 'c13', seriesId: 's21', productId: 'p44', basePrice: 120, estimatedTime: 75, isActive: true, createdAt: '2024-02-18' },
];

export const serviceTemplates: ServiceTemplate[] = [
  { id: 'st1', name: 'Screen Repair', description: 'Fix cracked or damaged screens', estimatedTime: 60, serviceType: 'Repair', isActive: true },
  { id: 'st2', name: 'Battery Replacement', description: 'Replace worn-out battery', estimatedTime: 45, serviceType: 'Replacement', isActive: true },
  { id: 'st3', name: 'Full Diagnostic', description: 'Complete device health check', estimatedTime: 30, serviceType: 'Diagnostic', isActive: true },
  { id: 'st4', name: 'Charging Port Repair', description: 'Fix charging port issues', estimatedTime: 45, serviceType: 'Repair', isActive: true },
];

export const serviceAssignments: ServiceAssignment[] = [
  { id: 'sa1', templateId: 'st1', level: 'brand', levelId: 'b1', price: 150, estimatedTime: 60, descriptionOverride: '', isActive: true },
  { id: 'sa2', templateId: 'st1', level: 'product', levelId: 'p3', price: 200, estimatedTime: 90, descriptionOverride: 'iPhone 15 Pro screen repair', isActive: true },
  { id: 'sa3', templateId: 'st2', level: 'brand', levelId: 'b1', price: 80, estimatedTime: 45, descriptionOverride: '', isActive: true },
  { id: 'sa4', templateId: 'st3', level: 'brand', levelId: 'b2', price: 50, estimatedTime: 30, descriptionOverride: '', isActive: true },
];

export const serviceProductOverrides: ServiceProductOverride[] = [
  { id: 'spo1', serviceId: 'svc1', productId: 'p3', priceOverride: 180, estimatedTimeOverride: 75 },
  { id: 'spo2', serviceId: 'svc1', productId: 'p4', priceOverride: 200, estimatedTimeOverride: 90 },
  { id: 'spo3', serviceId: 'svc8', productId: 'p3', priceOverride: 100, estimatedTimeOverride: 50 },
  { id: 'spo4', serviceId: 'svc2', productId: 'p9', priceOverride: 120, estimatedTimeOverride: 60 },
  { id: 'spo5', serviceId: 'svc5', productId: 'p24', priceOverride: 220, estimatedTimeOverride: 80 },
  { id: 'spo6', serviceId: 'svc5', productId: 'p28', priceOverride: 300, estimatedTimeOverride: 100 },
];
