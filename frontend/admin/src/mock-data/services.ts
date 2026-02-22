import { ServiceRecord, ServiceTemplate, ServiceAssignment, ServiceProduct, ServiceProductOverride } from '@/types';

export const mockServices: ServiceRecord[] = [
  // ── Brand-level services ──
  // Apple: Screen Replacement (parent + variants)
  { id: 'svc1', name: 'Screen Replacement', description: 'Fix cracked or damaged screens', level: 'brand', brandId: 'b1', basePrice: 0, estimatedTime: 0, isActive: true, createdAt: '2024-01-20', parentServiceId: null, isVariant: false },
  { id: 'svc1v1', name: 'Original Screen', description: 'OEM original screen replacement', level: 'brand', brandId: 'b1', basePrice: 200, estimatedTime: 60, isActive: true, createdAt: '2024-01-20', parentServiceId: 'svc1', isVariant: true },
  { id: 'svc1v2', name: 'OEM Screen', description: 'OEM-compatible screen replacement', level: 'brand', brandId: 'b1', basePrice: 150, estimatedTime: 60, isActive: true, createdAt: '2024-01-20', parentServiceId: 'svc1', isVariant: true },
  { id: 'svc1v3', name: 'Copy Screen', description: 'Aftermarket copy screen replacement', level: 'brand', brandId: 'b1', basePrice: 80, estimatedTime: 50, isActive: true, createdAt: '2024-01-20', parentServiceId: 'svc1', isVariant: true },
  { id: 'svc1v4', name: 'Refurbished Screen', description: 'Refurbished screen replacement', level: 'brand', brandId: 'b1', basePrice: 100, estimatedTime: 55, isActive: true, createdAt: '2024-01-20', parentServiceId: 'svc1', isVariant: true },

  // Apple: Battery Replacement (no variants)
  { id: 'svc2', name: 'Battery Replacement', description: 'Replace worn-out battery', level: 'brand', brandId: 'b1', basePrice: 80, estimatedTime: 45, isActive: true, createdAt: '2024-01-21', parentServiceId: null, isVariant: false },

  // Samsung: Full Diagnostic (no variants)
  { id: 'svc3', name: 'Full Diagnostic', description: 'Complete device health check', level: 'brand', brandId: 'b2', basePrice: 50, estimatedTime: 30, isActive: true, createdAt: '2024-01-22', parentServiceId: null, isVariant: false },

  // Google: Software Reset (no variants)
  { id: 'svc4', name: 'Software Reset', description: 'Factory reset and software reinstall', level: 'brand', brandId: 'b3', basePrice: 30, estimatedTime: 20, isActive: true, createdAt: '2024-02-12', parentServiceId: null, isVariant: false },

  // Samsung: Screen Replacement (parent + variants – only Original & Copy)
  { id: 'svc5', name: 'Screen Replacement', description: 'Fix cracked or damaged screens', level: 'brand', brandId: 'b2', basePrice: 0, estimatedTime: 0, isActive: true, createdAt: '2024-01-22', parentServiceId: null, isVariant: false },
  { id: 'svc5v1', name: 'Original Screen', description: 'OEM original screen replacement', level: 'brand', brandId: 'b2', basePrice: 180, estimatedTime: 60, isActive: true, createdAt: '2024-01-22', parentServiceId: 'svc5', isVariant: true },
  { id: 'svc5v2', name: 'Copy Screen', description: 'Aftermarket copy screen', level: 'brand', brandId: 'b2', basePrice: 90, estimatedTime: 50, isActive: true, createdAt: '2024-01-22', parentServiceId: 'svc5', isVariant: true },

  // OnePlus: Battery Replacement (no variants)
  { id: 'svc6', name: 'Battery Replacement', description: 'Replace worn-out battery', level: 'brand', brandId: 'b5', basePrice: 60, estimatedTime: 40, isActive: true, createdAt: '2024-03-02', parentServiceId: null, isVariant: false },

  // Gaming: Console Cleaning (no variants)
  { id: 'svc7', name: 'Console Cleaning', description: 'Deep clean console internals', level: 'brand', brandId: 'b4', basePrice: 45, estimatedTime: 30, isActive: true, createdAt: '2024-02-15', parentServiceId: null, isVariant: false },

  // ── Category-level services ──
  { id: 'svc8', name: 'Charging Port Repair', description: 'Fix charging port issues', level: 'category', brandId: 'b1', categoryId: 'c1', basePrice: 90, estimatedTime: 45, isActive: true, createdAt: '2024-01-23', parentServiceId: null, isVariant: false },
  { id: 'svc9', name: 'Keyboard Replacement', description: 'Replace MacBook keyboard', level: 'category', brandId: 'b1', categoryId: 'c3', basePrice: 250, estimatedTime: 120, isActive: true, createdAt: '2024-01-24', parentServiceId: null, isVariant: false },
  { id: 'svc10', name: 'Band Replacement', description: 'Replace watch band and lugs', level: 'category', brandId: 'b1', categoryId: 'c4', basePrice: 35, estimatedTime: 15, isActive: true, createdAt: '2024-01-25', parentServiceId: null, isVariant: false },
  { id: 'svc11', name: 'Fold Screen Repair', description: 'Fix foldable display crease or crack', level: 'category', brandId: 'b2', categoryId: 'c6', basePrice: 350, estimatedTime: 120, isActive: true, createdAt: '2024-01-26', parentServiceId: null, isVariant: false },
  { id: 'svc12', name: 'Controller Repair', description: 'Fix console controller drift or buttons', level: 'category', brandId: 'b4', categoryId: 'c12', basePrice: 40, estimatedTime: 30, isActive: true, createdAt: '2024-02-16', parentServiceId: null, isVariant: false },
  { id: 'svc13', name: 'DualSense Repair', description: 'Fix PS5 DualSense controller issues', level: 'category', brandId: 'b4', categoryId: 'c13', basePrice: 45, estimatedTime: 35, isActive: true, createdAt: '2024-02-16', parentServiceId: null, isVariant: false },

  // ── Series-level services ──
  { id: 'svc14', name: 'Back Glass Replacement', description: 'Replace cracked back glass panel', level: 'series', brandId: 'b1', categoryId: 'c1', seriesId: 's1', basePrice: 120, estimatedTime: 50, isActive: true, createdAt: '2024-02-01', parentServiceId: null, isVariant: false },
  { id: 'svc15', name: 'S Pen Calibration', description: 'Calibrate and repair S Pen', level: 'series', brandId: 'b2', categoryId: 'c5', seriesId: 's10', basePrice: 25, estimatedTime: 15, isActive: true, createdAt: '2024-02-02', parentServiceId: null, isVariant: false },
  { id: 'svc16', name: 'Hinge Repair', description: 'Fix folding hinge mechanism', level: 'series', brandId: 'b2', categoryId: 'c6', seriesId: 's12', basePrice: 280, estimatedTime: 90, isActive: true, createdAt: '2024-02-03', parentServiceId: null, isVariant: false },

  // ── Product-level services ──
  { id: 'svc17', name: 'Camera Lens Repair', description: 'Fix or replace camera lens', level: 'product', brandId: 'b1', categoryId: 'c1', seriesId: 's1', productId: 'p3', basePrice: 200, estimatedTime: 90, isActive: true, createdAt: '2024-02-05', parentServiceId: null, isVariant: false },
  { id: 'svc18', name: 'Speaker Replacement', description: 'Replace faulty speakers', level: 'product', brandId: 'b2', categoryId: 'c5', seriesId: 's10', productId: 'p24', basePrice: 70, estimatedTime: 40, isActive: true, createdAt: '2024-02-10', parentServiceId: null, isVariant: false },
  { id: 'svc19', name: 'HDMI Port Repair', description: 'Fix HDMI port on console', level: 'product', brandId: 'b4', categoryId: 'c12', seriesId: 's20', productId: 'p42', basePrice: 85, estimatedTime: 60, isActive: true, createdAt: '2024-02-17', parentServiceId: null, isVariant: false },
  { id: 'svc20', name: 'Disc Drive Replacement', description: 'Replace PS5 disc drive', level: 'product', brandId: 'b4', categoryId: 'c13', seriesId: 's21', productId: 'p44', basePrice: 120, estimatedTime: 75, isActive: true, createdAt: '2024-02-18', parentServiceId: null, isVariant: false },
];

// Legacy data kept for compatibility
export const mockServiceTemplates: ServiceTemplate[] = [
  // { id: 'st1', name: 'Screen Repair', description: 'Fix cracked or damaged screens', estimatedTime: 60, serviceType: 'Repair', isActive: true },
  // { id: 'st2', name: 'Battery Replacement', description: 'Replace worn-out battery', estimatedTime: 45, serviceType: 'Replacement', isActive: true },
  // { id: 'st3', name: 'Full Diagnostic', description: 'Complete device health check', estimatedTime: 30, serviceType: 'Diagnostic', isActive: true },
  // { id: 'st4', name: 'Charging Port Repair', description: 'Fix charging port issues', estimatedTime: 45, serviceType: 'Repair', isActive: true },
];

export const mockServiceAssignments: ServiceAssignment[] = [
  // { id: 'sa1', templateId: 'st1', level: 'brand', levelId: 'b1', price: 150, estimatedTime: 60, descriptionOverride: '', isActive: true },
  // { id: 'sa2', templateId: 'st1', level: 'product', levelId: 'p3', price: 200, estimatedTime: 90, descriptionOverride: 'iPhone 15 Pro screen repair', isActive: true },
  // { id: 'sa3', templateId: 'st2', level: 'brand', levelId: 'b1', price: 80, estimatedTime: 45, descriptionOverride: '', isActive: true },
  // { id: 'sa4', templateId: 'st3', level: 'brand', levelId: 'b2', price: 50, estimatedTime: 30, descriptionOverride: '', isActive: true },
];

export const mockServiceProductOverrides: ServiceProductOverride[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // BRAND-LEVEL SERVICES - Apple (b1) - Products: p1-p21
  // ═══════════════════════════════════════════════════════════════════════════════

  // Screen Replacement Variants (svc1v1-svc1v4) for Apple products
  // iPhone 15 Series (p1-p4)
  { id: 'sp1', serviceId: 'svc1v1', productId: 'p1', price: 200, estimatedTime: 60 },
  { id: 'sp2', serviceId: 'svc1v1', productId: 'p2', price: 210, estimatedTime: 60 },
  { id: 'sp3', serviceId: 'svc1v1', productId: 'p3', price: 220, estimatedTime: 75 }, // iPhone 15 Pro - premium
  { id: 'sp4', serviceId: 'svc1v1', productId: 'p4', price: 230, estimatedTime: 75 },
  { id: 'sp5', serviceId: 'svc1v2', productId: 'p1', price: 150, estimatedTime: 60 },
  { id: 'sp6', serviceId: 'svc1v2', productId: 'p2', price: 150, estimatedTime: 60 },
  { id: 'sp7', serviceId: 'svc1v2', productId: 'p3', price: 160, estimatedTime: 65 },
  { id: 'sp8', serviceId: 'svc1v2', productId: 'p4', price: 170, estimatedTime: 65 },
  { id: 'sp9', serviceId: 'svc1v3', productId: 'p1', price: 80, estimatedTime: 50 },
  { id: 'sp10', serviceId: 'svc1v3', productId: 'p2', price: 80, estimatedTime: 50 },
  { id: 'sp11', serviceId: 'svc1v3', productId: 'p3', price: 90, estimatedTime: 50 },
  { id: 'sp12', serviceId: 'svc1v3', productId: 'p4', price: 90, estimatedTime: 50 },

  // iPhone 14 Series (p5-p8)
  { id: 'sp13', serviceId: 'svc1v1', productId: 'p5', price: 190, estimatedTime: 60 },
  { id: 'sp14', serviceId: 'svc1v1', productId: 'p6', price: 200, estimatedTime: 60 },
  { id: 'sp15', serviceId: 'svc1v1', productId: 'p7', price: 210, estimatedTime: 60 },
  { id: 'sp16', serviceId: 'svc1v1', productId: 'p8', price: 220, estimatedTime: 75 },
  { id: 'sp17', serviceId: 'svc1v2', productId: 'p5', price: 140, estimatedTime: 60 },
  { id: 'sp18', serviceId: 'svc1v2', productId: 'p6', price: 150, estimatedTime: 60 },

  // iPad series (p9-p13)
  { id: 'sp19', serviceId: 'svc1v1', productId: 'p9', price: 250, estimatedTime: 70 },
  { id: 'sp20', serviceId: 'svc1v1', productId: 'p10', price: 280, estimatedTime: 75 },
  { id: 'sp21', serviceId: 'svc1v1', productId: 'p11', price: 220, estimatedTime: 65 },
  { id: 'sp22', serviceId: 'svc1v2', productId: 'p9', price: 180, estimatedTime: 65 },

  // MacBook series (p14-p18)
  { id: 'sp23', serviceId: 'svc1v1', productId: 'p14', price: 300, estimatedTime: 90 },
  { id: 'sp24', serviceId: 'svc1v1', productId: 'p15', price: 320, estimatedTime: 90 },
  { id: 'sp25', serviceId: 'svc1v1', productId: 'p17', price: 400, estimatedTime: 120 },

  // Apple Watch series (p19-p21)
  { id: 'sp26', serviceId: 'svc1v1', productId: 'p19', price: 150, estimatedTime: 45 },
  { id: 'sp27', serviceId: 'svc1v1', productId: 'p20', price: 160, estimatedTime: 45 },
  { id: 'sp28', serviceId: 'svc1v1', productId: 'p21', price: 200, estimatedTime: 50 }, // Ultra premium

  // Battery Replacement (svc2) for Apple products
  { id: 'sp29', serviceId: 'svc2', productId: 'p1', price: 80, estimatedTime: 45 },
  { id: 'sp30', serviceId: 'svc2', productId: 'p2', price: 80, estimatedTime: 45 },
  { id: 'sp31', serviceId: 'svc2', productId: 'p3', price: 90, estimatedTime: 50 },
  { id: 'sp32', serviceId: 'svc2', productId: 'p4', price: 90, estimatedTime: 50 },
  { id: 'sp33', serviceId: 'svc2', productId: 'p5', price: 75, estimatedTime: 45 },
  { id: 'sp34', serviceId: 'svc2', productId: 'p9', price: 120, estimatedTime: 60 }, // iPad Pro
  { id: 'sp35', serviceId: 'svc2', productId: 'p10', price: 130, estimatedTime: 60 },
  { id: 'sp36', serviceId: 'svc2', productId: 'p14', price: 150, estimatedTime: 75 }, // MacBook
  { id: 'sp37', serviceId: 'svc2', productId: 'p19', price: 70, estimatedTime: 35 }, // Watch
  { id: 'sp38', serviceId: 'svc2', productId: 'p21', price: 100, estimatedTime: 40 }, // Watch Ultra

  // ═══════════════════════════════════════════════════════════════════════════════
  // BRAND-LEVEL SERVICES - Samsung (b2) - Products: p22-p35
  // ═══════════════════════════════════════════════════════════════════════════════

  // Full Diagnostic (svc3) for Samsung products
  { id: 'sp39', serviceId: 'svc3', productId: 'p22', price: 50, estimatedTime: 30 },
  { id: 'sp40', serviceId: 'svc3', productId: 'p23', price: 50, estimatedTime: 30 },
  { id: 'sp41', serviceId: 'svc3', productId: 'p24', price: 50, estimatedTime: 30, isDisabled: true }, // Disabled example
  { id: 'sp42', serviceId: 'svc3', productId: 'p25', price: 45, estimatedTime: 30 },
  { id: 'sp43', serviceId: 'svc3', productId: 'p28', price: 70, estimatedTime: 45 }, // Fold - more complex
  { id: 'sp44', serviceId: 'svc3', productId: 'p30', price: 55, estimatedTime: 35 }, // Tab
  { id: 'sp45', serviceId: 'svc3', productId: 'p33', price: 40, estimatedTime: 25 }, // Watch

  // Screen Replacement Variants (svc5v1-svc5v2) for Samsung products
  // Galaxy S Series (p22-p27)
  { id: 'sp46', serviceId: 'svc5v1', productId: 'p22', price: 180, estimatedTime: 60 },
  { id: 'sp47', serviceId: 'svc5v1', productId: 'p23', price: 190, estimatedTime: 60 },
  { id: 'sp48', serviceId: 'svc5v1', productId: 'p24', price: 220, estimatedTime: 80 }, // Ultra - premium
  { id: 'sp49', serviceId: 'svc5v1', productId: 'p25', price: 170, estimatedTime: 60 },
  { id: 'sp50', serviceId: 'svc5v1', productId: 'p26', price: 180, estimatedTime: 60 },
  { id: 'sp51', serviceId: 'svc5v1', productId: 'p27', price: 210, estimatedTime: 75 },
  { id: 'sp52', serviceId: 'svc5v2', productId: 'p22', price: 90, estimatedTime: 50 },
  { id: 'sp53', serviceId: 'svc5v2', productId: 'p24', price: 110, estimatedTime: 55 },

  // Galaxy Z Foldables (p28-p29)
  { id: 'sp54', serviceId: 'svc5v1', productId: 'p28', price: 300, estimatedTime: 100 }, // Fold - most expensive
  { id: 'sp55', serviceId: 'svc5v1', productId: 'p29', price: 200, estimatedTime: 70 }, // Flip
  { id: 'sp56', serviceId: 'svc5v2', productId: 'p28', price: 150, estimatedTime: 80 },

  // Galaxy Tab (p30-p32)
  { id: 'sp57', serviceId: 'svc5v1', productId: 'p30', price: 220, estimatedTime: 70 },
  { id: 'sp58', serviceId: 'svc5v1', productId: 'p31', price: 250, estimatedTime: 75 },
  { id: 'sp59', serviceId: 'svc5v1', productId: 'p32', price: 280, estimatedTime: 80 }, // Ultra

  // Galaxy Watch (p33-p35)
  { id: 'sp60', serviceId: 'svc5v1', productId: 'p33', price: 120, estimatedTime: 45 },
  { id: 'sp61', serviceId: 'svc5v1', productId: 'p34', price: 130, estimatedTime: 45 },
  { id: 'sp62', serviceId: 'svc5v1', productId: 'p35', price: 140, estimatedTime: 50 }, // Classic

  // ═══════════════════════════════════════════════════════════════════════════════
  // BRAND-LEVEL SERVICES - Google (b3) - Products: p36-p41
  // ═══════════════════════════════════════════════════════════════════════════════

  // Software Reset (svc4) for Google products
  { id: 'sp63', serviceId: 'svc4', productId: 'p36', price: 30, estimatedTime: 20 },
  { id: 'sp64', serviceId: 'svc4', productId: 'p37', price: 35, estimatedTime: 25 },
  { id: 'sp65', serviceId: 'svc4', productId: 'p38', price: 30, estimatedTime: 20 },
  { id: 'sp66', serviceId: 'svc4', productId: 'p39', price: 30, estimatedTime: 20 },
  { id: 'sp67', serviceId: 'svc4', productId: 'p40', price: 40, estimatedTime: 30 }, // Tablet
  { id: 'sp68', serviceId: 'svc4', productId: 'p41', price: 25, estimatedTime: 15 }, // Watch

  // ═══════════════════════════════════════════════════════════════════════════════
  // BRAND-LEVEL SERVICES - Gaming (b4) - Products: p42-p46
  // ═══════════════════════════════════════════════════════════════════════════════

  // Console Cleaning (svc7) for Gaming products
  { id: 'sp69', serviceId: 'svc7', productId: 'p42', price: 45, estimatedTime: 30 }, // Xbox Series X
  { id: 'sp70', serviceId: 'svc7', productId: 'p43', price: 40, estimatedTime: 25 }, // Xbox Series S
  { id: 'sp71', serviceId: 'svc7', productId: 'p44', price: 50, estimatedTime: 35 }, // PS5 Standard
  { id: 'sp72', serviceId: 'svc7', productId: 'p45', price: 45, estimatedTime: 30 }, // PS5 Digital
  { id: 'sp73', serviceId: 'svc7', productId: 'p46', price: 45, estimatedTime: 30 }, // PS5 Slim

  // ═══════════════════════════════════════════════════════════════════════════════
  // BRAND-LEVEL SERVICES - OnePlus (b5) - Products: p47-p51
  // ═══════════════════════════════════════════════════════════════════════════════

  // Battery Replacement (svc6) for OnePlus products
  { id: 'sp74', serviceId: 'svc6', productId: 'p47', price: 70, estimatedTime: 45 }, // OnePlus 12
  { id: 'sp75', serviceId: 'svc6', productId: 'p48', price: 65, estimatedTime: 40 }, // OnePlus 12R
  { id: 'sp76', serviceId: 'svc6', productId: 'p49', price: 60, estimatedTime: 40 }, // OnePlus 11
  { id: 'sp77', serviceId: 'svc6', productId: 'p50', price: 55, estimatedTime: 35 }, // Nord 3
  { id: 'sp78', serviceId: 'svc6', productId: 'p51', price: 50, estimatedTime: 35 }, // Nord CE 3

  // ═══════════════════════════════════════════════════════════════════════════════
  // CATEGORY-LEVEL SERVICES
  // ═══════════════════════════════════════════════════════════════════════════════

  // Charging Port Repair (svc8) - Apple iPhone category (c1) - Products: p1-p8
  { id: 'sp79', serviceId: 'svc8', productId: 'p1', price: 90, estimatedTime: 45 },
  { id: 'sp80', serviceId: 'svc8', productId: 'p2', price: 90, estimatedTime: 45 },
  { id: 'sp81', serviceId: 'svc8', productId: 'p3', price: 100, estimatedTime: 50 }, // Pro model
  { id: 'sp82', serviceId: 'svc8', productId: 'p4', price: 100, estimatedTime: 50 },
  { id: 'sp83', serviceId: 'svc8', productId: 'p5', price: 85, estimatedTime: 45 },
  { id: 'sp84', serviceId: 'svc8', productId: 'p6', price: 85, estimatedTime: 45 },
  { id: 'sp85', serviceId: 'svc8', productId: 'p7', price: 95, estimatedTime: 50 },
  { id: 'sp86', serviceId: 'svc8', productId: 'p8', price: 95, estimatedTime: 50 },

  // Keyboard Replacement (svc9) - Apple MacBook category (c3) - Products: p14-p18
  { id: 'sp87', serviceId: 'svc9', productId: 'p14', price: 250, estimatedTime: 120 },
  { id: 'sp88', serviceId: 'svc9', productId: 'p15', price: 270, estimatedTime: 120 },
  { id: 'sp89', serviceId: 'svc9', productId: 'p16', price: 280, estimatedTime: 120 },
  { id: 'sp90', serviceId: 'svc9', productId: 'p17', price: 300, estimatedTime: 150 }, // Pro model
  { id: 'sp91', serviceId: 'svc9', productId: 'p18', price: 320, estimatedTime: 150 },

  // Band Replacement (svc10) - Apple Watch category (c4) - Products: p19-p21
  { id: 'sp92', serviceId: 'svc10', productId: 'p19', price: 35, estimatedTime: 15 },
  { id: 'sp93', serviceId: 'svc10', productId: 'p20', price: 35, estimatedTime: 15 },
  { id: 'sp94', serviceId: 'svc10', productId: 'p21', price: 45, estimatedTime: 20 }, // Ultra

  // Fold Screen Repair (svc11) - Samsung Galaxy Z category (c6) - Products: p28-p29
  { id: 'sp95', serviceId: 'svc11', productId: 'p28', price: 400, estimatedTime: 150 }, // Fold - most expensive
  { id: 'sp96', serviceId: 'svc11', productId: 'p29', price: 300, estimatedTime: 100 }, // Flip

  // Controller Repair (svc12) - Xbox category (c12) - Products: p42-p43
  { id: 'sp97', serviceId: 'svc12', productId: 'p42', price: 40, estimatedTime: 30 },
  { id: 'sp98', serviceId: 'svc12', productId: 'p43', price: 40, estimatedTime: 30 },

  // DualSense Repair (svc13) - PlayStation category (c13) - Products: p44-p46
  { id: 'sp99', serviceId: 'svc13', productId: 'p44', price: 45, estimatedTime: 35 },
  { id: 'sp100', serviceId: 'svc13', productId: 'p45', price: 45, estimatedTime: 35 },
  { id: 'sp101', serviceId: 'svc13', productId: 'p46', price: 45, estimatedTime: 35 },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIES-LEVEL SERVICES
  // ═══════════════════════════════════════════════════════════════════════════════

  // Back Glass Replacement (svc14) - iPhone 15 Series (s1) - Products: p1-p4
  { id: 'sp102', serviceId: 'svc14', productId: 'p1', price: 120, estimatedTime: 50 },
  { id: 'sp103', serviceId: 'svc14', productId: 'p2', price: 130, estimatedTime: 50 },
  { id: 'sp104', serviceId: 'svc14', productId: 'p3', price: 140, estimatedTime: 60 }, // Pro
  { id: 'sp105', serviceId: 'svc14', productId: 'p4', price: 150, estimatedTime: 60 }, // Pro Max

  // S Pen Calibration (svc15) - Galaxy S24 Series (s10) - Products: p22-p24
  { id: 'sp106', serviceId: 'svc15', productId: 'p22', price: 25, estimatedTime: 15 },
  { id: 'sp107', serviceId: 'svc15', productId: 'p23', price: 25, estimatedTime: 15 },
  { id: 'sp108', serviceId: 'svc15', productId: 'p24', price: 30, estimatedTime: 20 }, // Ultra with S Pen

  // Hinge Repair (svc16) - Galaxy Z Fold Series (s12) - Product: p28
  { id: 'sp109', serviceId: 'svc16', productId: 'p28', price: 280, estimatedTime: 90 },

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRODUCT-LEVEL SERVICES (1-to-1 mapping)
  // ═══════════════════════════════════════════════════════════════════════════════

  // Camera Lens Repair (svc17) - iPhone 15 Pro (p3)
  { id: 'sp110', serviceId: 'svc17', productId: 'p3', price: 200, estimatedTime: 90 },

  // Speaker Replacement (svc18) - Galaxy S24 Ultra (p24)
  { id: 'sp111', serviceId: 'svc18', productId: 'p24', price: 70, estimatedTime: 40 },

  // HDMI Port Repair (svc19) - Xbox Series X (p42)
  { id: 'sp112', serviceId: 'svc19', productId: 'p42', price: 85, estimatedTime: 60 },

  // Disc Drive Replacement (svc20) - PlayStation 5 Standard (p44)
  { id: 'sp113', serviceId: 'svc20', productId: 'p44', price: 120, estimatedTime: 75 },
];
