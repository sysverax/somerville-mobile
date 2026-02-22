import { ServiceRecord, ServiceTemplate, ServiceAssignment, ServiceProductOverride } from '@/src/types';

export const serviceRecords: ServiceRecord[] = [
    { id: 'svc1', name: 'Screen Repair', description: 'Fix cracked or damaged screens', level: 'brand', brandId: 'b1', basePrice: 0, estimatedTime: 0, isActive: true, createdAt: '2024-01-20', parentServiceId: null, isVariant: false },
    { id: 'svc1v1', name: 'Original Screen', description: 'OEM quality screen replacement with full warranty coverage', level: 'brand', brandId: 'b1', basePrice: 200, estimatedTime: 60, isActive: true, createdAt: '2024-01-20', parentServiceId: 'svc1', isVariant: true },
    { id: 'svc1v2', name: 'Premium Aftermarket', description: 'High-quality third-party screen with excellent color accuracy', level: 'brand', brandId: 'b1', basePrice: 150, estimatedTime: 60, isActive: true, createdAt: '2024-01-20', parentServiceId: 'svc1', isVariant: true },
    { id: 'svc1v3', name: 'Budget Screen', description: 'Affordable replacement screen for basic functionality', level: 'brand', brandId: 'b1', basePrice: 80, estimatedTime: 50, isActive: true, createdAt: '2024-01-20', parentServiceId: 'svc1', isVariant: true },

    { id: 'svc2', name: 'Battery Replacement', description: 'Replace worn-out battery', level: 'brand', brandId: 'b1', basePrice: 80, estimatedTime: 45, isActive: true, createdAt: '2024-01-21', parentServiceId: null, isVariant: false },
    { id: 'svc3', name: 'Full Diagnostic', description: 'Complete device health check', level: 'brand', brandId: 'b2', basePrice: 50, estimatedTime: 30, isActive: true, createdAt: '2024-01-22', parentServiceId: null, isVariant: false },
    { id: 'svc4', name: 'Software Reset', description: 'Factory reset and software reinstall', level: 'brand', brandId: 'b3', basePrice: 30, estimatedTime: 20, isActive: true, createdAt: '2024-02-12', parentServiceId: null, isVariant: false },

    { id: 'svc5', name: 'Screen Repair', description: 'Fix cracked or damaged screens', level: 'brand', brandId: 'b2', basePrice: 0, estimatedTime: 0, isActive: true, createdAt: '2024-01-22', parentServiceId: null, isVariant: false },
    { id: 'svc5v1', name: 'Original Screen', description: 'OEM original screen replacement', level: 'brand', brandId: 'b2', basePrice: 180, estimatedTime: 60, isActive: true, createdAt: '2024-01-22', parentServiceId: 'svc5', isVariant: true },
    { id: 'svc5v2', name: 'Copy Screen', description: 'Aftermarket copy screen replacement', level: 'brand', brandId: 'b2', basePrice: 90, estimatedTime: 50, isActive: true, createdAt: '2024-01-22', parentServiceId: 'svc5', isVariant: true },

    { id: 'svc8', name: 'Charging Port Repair', description: 'Fix charging port issues', level: 'category', brandId: 'b1', categoryId: 'c1', basePrice: 90, estimatedTime: 45, isActive: true, createdAt: '2024-01-23', parentServiceId: null, isVariant: false },

    { id: 'svc14', name: 'Back Glass Replacement', description: 'Replace cracked back glass panel', level: 'series', brandId: 'b1', categoryId: 'c1', seriesId: 's1', basePrice: 0, estimatedTime: 0, isActive: true, createdAt: '2024-02-01', parentServiceId: null, isVariant: false },
    { id: 'svc14v1', name: 'Original Back Glass', description: 'OEM back glass panel with precise color matching', level: 'series', brandId: 'b1', categoryId: 'c1', seriesId: 's1', basePrice: 170, estimatedTime: 60, isActive: true, createdAt: '2024-02-01', parentServiceId: 'svc14', isVariant: true },
    { id: 'svc14v2', name: 'Aftermarket Glass', description: 'Quality third-party back glass replacement', level: 'series', brandId: 'b1', categoryId: 'c1', seriesId: 's1', basePrice: 100, estimatedTime: 50, isActive: true, createdAt: '2024-02-01', parentServiceId: 'svc14', isVariant: true },

    { id: 'svc17', name: 'Camera Repair', description: 'Fix camera lens or module issues', level: 'product', brandId: 'b1', categoryId: 'c1', seriesId: 's1', productId: 'p3', basePrice: 0, estimatedTime: 0, isActive: true, createdAt: '2024-02-05', parentServiceId: null, isVariant: false },
    { id: 'svc17v1', name: 'Front Camera', description: 'Replace front-facing camera module', level: 'product', brandId: 'b1', categoryId: 'c1', seriesId: 's1', productId: 'p3', basePrice: 130, estimatedTime: 45, isActive: true, createdAt: '2024-02-05', parentServiceId: 'svc17', isVariant: true },
    { id: 'svc17v2', name: 'Rear Camera', description: 'Replace rear camera system with full calibration', level: 'product', brandId: 'b1', categoryId: 'c1', seriesId: 's1', productId: 'p3', basePrice: 250, estimatedTime: 75, isActive: true, createdAt: '2024-02-05', parentServiceId: 'svc17', isVariant: true },

    { id: 'svc18', name: 'Speaker Repair', description: 'Fix or replace faulty speakers', level: 'product', brandId: 'b1', categoryId: 'c1', seriesId: 's1', productId: 'p3', basePrice: 70, estimatedTime: 40, isActive: true, createdAt: '2024-02-06', parentServiceId: null, isVariant: false },
];

export const serviceTemplates: ServiceTemplate[] = [];
export const serviceAssignments: ServiceAssignment[] = [];

export const serviceProductOverrides: ServiceProductOverride[] = [
    { id: 'sp1', serviceId: 'svc1v1', productId: 'p1', price: 200, estimatedTime: 60 },
    { id: 'sp2', serviceId: 'svc1v2', productId: 'p1', price: 150, estimatedTime: 60 },
    { id: 'sp3', serviceId: 'svc1v3', productId: 'p1', price: 80, estimatedTime: 50 },

    { id: 'sp4', serviceId: 'svc1v1', productId: 'p3', price: 220, estimatedTime: 75 },
    { id: 'sp5', serviceId: 'svc1v2', productId: 'p3', price: 140, estimatedTime: 60 },
    { id: 'sp6', serviceId: 'svc1v3', productId: 'p3', price: 80, estimatedTime: 50 },

    { id: 'sp7', serviceId: 'svc2', productId: 'p3', price: 80, estimatedTime: 45 },
    { id: 'sp8', serviceId: 'svc8', productId: 'p3', price: 90, estimatedTime: 45 },

    { id: 'sp9', serviceId: 'svc14v1', productId: 'p3', price: 170, estimatedTime: 60 },
    { id: 'sp10', serviceId: 'svc14v2', productId: 'p3', price: 100, estimatedTime: 50 },

    { id: 'sp11', serviceId: 'svc17v1', productId: 'p3', price: 130, estimatedTime: 45 },
    { id: 'sp12', serviceId: 'svc17v2', productId: 'p3', price: 250, estimatedTime: 75 },
    { id: 'sp13', serviceId: 'svc18', productId: 'p3', price: 70, estimatedTime: 40 },

    { id: 'sp14', serviceId: 'svc5v1', productId: 'p24', price: 220, estimatedTime: 80 },
    { id: 'sp15', serviceId: 'svc5v2', productId: 'p24', price: 110, estimatedTime: 55 },
    { id: 'sp16', serviceId: 'svc3', productId: 'p24', price: 50, estimatedTime: 30, isDisabled: true },

    { id: 'sp17', serviceId: 'svc4', productId: 'p36', price: 30, estimatedTime: 20 },
    { id: 'sp18', serviceId: 'svc2', productId: 'p1', price: 80, estimatedTime: 45 },
    { id: 'sp19', serviceId: 'svc8', productId: 'p1', price: 90, estimatedTime: 45 },
    { id: 'sp20', serviceId: 'svc14v1', productId: 'p1', price: 150, estimatedTime: 55 },
    { id: 'sp21', serviceId: 'svc14v2', productId: 'p1', price: 95, estimatedTime: 45 },
];
