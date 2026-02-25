import { useState, useMemo, useRef } from 'react';
import { useServices } from '@/hooks/useServices';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useSeriesData } from '@/hooks/useSeries';
import { useProducts } from '@/hooks/useProducts';
import { ServiceRecord, AssignmentLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Search, ChevronUp, ChevronDown, Power, RotateCcw, Wrench, Package, Trash2, ChevronRight } from 'lucide-react';
import TablePagination from '@/components/TablePagination';

const LEVELS: AssignmentLevel[] = ['brand', 'category', 'series', 'product'];

interface VariantFormItem {
  name: string;
  description: string;
  basePrice: number;
  estimatedTime: number;
}

const validateName = (value: string): string | undefined => {
  if (!value.trim()) return 'Service name is required';
  return undefined;
};
const validateBrand = (value: string): string | undefined => {
  if (!value) return 'Brand is required';
  return undefined;
};
const validateCategory = (value: string): string | undefined => {
  if (!value) return 'Category is required';
  return undefined;
};
const validateSeries = (value: string): string | undefined => {
  if (!value) return 'Series is required';
  return undefined;
};
const validateProduct = (value: string): string | undefined => {
  if (!value) return 'Product is required';
  return undefined;
};

const validateBasePrice = (value: number): string | undefined => {
  if (value === undefined || value === null || value == 0 || String(value).trim() === '') return 'Base price is required';
  return undefined;
};

const validateEstimatedTime = (value: number): string | undefined => {
  if (value === undefined || value === null || value == 0 || String(value).trim() === '') return 'Estimated time is required';
  return undefined;
};

type FormErrors = { name?: string; brandId?: string; categoryId?: string; seriesId?: string; productId?: string; basePrice?: string; estimatedTime?: string };

const ServicesPage = () => {
  const { services, createService, updateService, deleteService, getVariants, hasVariants, getOverridesByService, getOverridesByProduct, upsertOverride, deleteOverride, overrides, toggleServiceForProduct } = useServices();
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { seriesList } = useSeriesData();
  const { products } = useProducts();

  // Top-level tab
  const [mainTab, setMainTab] = useState('services');

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [stagedFilters, setStagedFilters] = useState({
    level: "all", status: "all", brand: "all", category: "all", series: "all", product: "all",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    level: "all", status: "all", brand: "all", category: "all", series: "all", product: "all",
  });

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [detailView, setDetailView] = useState<ServiceRecord | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ServiceRecord | null>(null);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ name?: boolean; brandId?: boolean; categoryId?: boolean; seriesId?: boolean; productId?: boolean; basePrice?: boolean; estimatedTime?: boolean }>({});
  const [basePriceInput, setBasePriceInput] = useState('');
  const [estimatedTimeInput, setEstimatedTimeInput] = useState('');

  const formRef = useRef<HTMLDivElement>(null);
  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = formRef.current?.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  // Form state
  const [form, setForm] = useState({
    name: '', description: '', level: 'brand' as AssignmentLevel,
    brandId: '', categoryId: '', seriesId: '', productId: '',
    basePrice: 0, estimatedTime: 30, isActive: true,
    hasVariants: false,
  });
  const [variantItems, setVariantItems] = useState<VariantFormItem[]>([]);

  // Override editing state
  const [overrideEdits, setOverrideEdits] = useState<Record<string, { price: number; time: number }>>({});

  // By Product tab state
  const [byProductSelected, setByProductSelected] = useState<string>('');
  const [byProductBrand, setByProductBrand] = useState<string>('all');
  const [byProductCategory, setByProductCategory] = useState<string>('all');
  const [byProductSeries, setByProductSeries] = useState<string>('all');
  const [byProductSearch, setByProductSearch] = useState('');
  const [byProductCollapsedParents, setByProductCollapsedParents] = useState<Set<string>>(new Set());

  // By Service tab state
  const [byServiceSelected, setByServiceSelected] = useState<string>('');
  const [byServiceSearch, setByServiceSearch] = useState('');
  const [byServiceCollapsedVariants, setByServiceCollapsedVariants] = useState<Set<string>>(new Set());

  // Helpers
  const brandName = (id: string) => brands.find(b => b.id === id)?.name || id;
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const seriesName = (id: string) => seriesList.find(s => s.id === id)?.name || id;
  const productName = (id: string) => products.find(p => p.id === id)?.name || id;

  const getAssignedTo = (s: ServiceRecord) => {
    switch (s.level) {
      case 'brand': return brandName(s.brandId);
      case 'category': return categoryName(s.categoryId || '');
      case 'series': return seriesName(s.seriesId || '');
      case 'product': return productName(s.productId || '');
    }
  };

  const getLinkedProducts = (s: ServiceRecord) => {
    switch (s.level) {
      case 'brand': return products.filter(p => p.brandId === s.brandId);
      case 'category': return products.filter(p => p.categoryId === s.categoryId);
      case 'series': return products.filter(p => p.seriesId === s.seriesId);
      case 'product': return s.productId ? products.filter(p => p.id === s.productId) : [];
    }
  };

  const getLinkedProductCount = (s: ServiceRecord): number => getLinkedProducts(s).length;

  const getServicesForProduct = (productId: string, includeDisabled = false) => {
    const p = products.find(pr => pr.id === productId);
    if (!p) return [];
    // Only return variants and non-parent services (parents with variants shouldn't show directly)
    return services.filter(s => {
      if (!s.isActive) return false;
      // Skip parent services that have variants – only variants should appear
      if (!s.isVariant && hasVariants(s.id)) return false;
      let matches = false;
      switch (s.level) {
        case 'brand': matches = s.brandId === p.brandId; break;
        case 'category': matches = s.categoryId === p.categoryId; break;
        case 'series': matches = s.seriesId === p.seriesId; break;
        case 'product': matches = s.productId === p.id; break;
        default: matches = false;
      }
      if (!matches) return false;
      if (!includeDisabled) {
        const override = overrides.find(o => o.serviceId === s.id && o.productId === productId);
        if (override?.isDisabled) return false;
      }
      return true;
    });
  };

  const isServiceDisabledForProduct = (serviceId: string, productId: string): boolean => {
    const override = overrides.find(o => o.serviceId === serviceId && o.productId === productId);
    return override?.isDisabled === true;
  };

  // Group services for "By Product" display: group variants under parent
  const groupServicesForProduct = (productId: string) => {
    const allSvcs = getServicesForProduct(productId, true);
    const groups: { parent: ServiceRecord | null; items: ServiceRecord[] }[] = [];
    const variantsByParent = new Map<string, ServiceRecord[]>();
    const standalone: ServiceRecord[] = [];

    allSvcs.forEach(s => {
      if (s.isVariant && s.parentServiceId) {
        const existing = variantsByParent.get(s.parentServiceId) || [];
        existing.push(s);
        variantsByParent.set(s.parentServiceId, existing);
      } else {
        standalone.push(s);
      }
    });

    // Add grouped variants
    variantsByParent.forEach((variants, parentId) => {
      const parent = services.find(s => s.id === parentId) || null;
      groups.push({ parent, items: variants });
    });

    // Add standalone services
    standalone.forEach(s => {
      groups.push({ parent: null, items: [s] });
    });

    return groups;
  };

  // Dynamic filter options
  const stagedCategories = stagedFilters.brand !== "all" ? categories.filter(c => c.brandId === stagedFilters.brand) : categories;
  const stagedSeries = stagedFilters.category !== "all" ? seriesList.filter(s => s.categoryId === stagedFilters.category) : [];
  const stagedProducts = stagedFilters.series !== "all" ? products.filter(p => p.seriesId === stagedFilters.series) : [];

  const hasChanges = JSON.stringify(stagedFilters) !== JSON.stringify(appliedFilters) || searchInput !== search;
  const hasApplied = Object.values(appliedFilters).some(v => v !== "all") || search !== "";

  // Form hierarchy options
  const formCategories = form.brandId ? categories.filter(c => c.brandId === form.brandId) : [];
  const formSeries = form.categoryId ? seriesList.filter(s => s.categoryId === form.categoryId) : [];
  const formProducts = form.seriesId ? products.filter(p => p.seriesId === form.seriesId) : [];

  // Filter & sort for services list – only show parent/standalone services (not variants)
  const filtered = useMemo(() => {
    let result = services.filter(s => !s.isVariant);
    if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    if (appliedFilters.level !== "all") result = result.filter(s => s.level === appliedFilters.level);
    if (appliedFilters.status !== "all") result = result.filter(s => appliedFilters.status === "active" ? s.isActive : !s.isActive);
    if (appliedFilters.product !== "all") {
      const prod = products.find(p => p.id === appliedFilters.product);
      result = result.filter(s => s.productId === prod?.id || s.seriesId === prod?.seriesId || s.categoryId === prod?.categoryId || (s.level === "brand" && s.brandId === prod?.brandId));
    } else if (appliedFilters.series !== "all") {
      const ser = seriesList.find(s => s.id === appliedFilters.series);
      const cat = ser ? categories.find(c => c.id === ser.categoryId) : null;
      result = result.filter(s => s.seriesId === ser?.id || s.categoryId === ser?.categoryId || (s.level === "brand" && s.brandId === cat?.brandId));
    } else if (appliedFilters.category !== "all") {
      const cat = categories.find(c => c.id === appliedFilters.category);
      result = result.filter(s => s.categoryId === appliedFilters.category || (s.level === "brand" && s.brandId === cat?.brandId));
    } else if (appliedFilters.brand !== "all") {
      result = result.filter(s => s.brandId === appliedFilters.brand);
    }
    return result;
  }, [services, search, appliedFilters, products, seriesList, categories]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleExpanded = (parentId: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

  const toggleByProductExpanded = (parentId: string) => {
    setByProductCollapsedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

  const toggleByServiceVariantExpanded = (variantId: string) => {
    setByServiceCollapsedVariants(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  // Open form
  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', level: 'brand', brandId: '', categoryId: '', seriesId: '', productId: '', basePrice: 0, estimatedTime: 30, isActive: true, hasVariants: false });
    setVariantItems([]);
    setFormErrors({});
    setTouched({});
    setIsFormOpen(true);
    setBasePriceInput('0');
    setEstimatedTimeInput('30');
  };

  const openEdit = (s: ServiceRecord) => {
    setEditing(s);
    const variants = getVariants(s.id);
    setForm({
      name: s.name, description: s.description, level: s.level,
      brandId: s.brandId, categoryId: s.categoryId || '', seriesId: s.seriesId || '', productId: s.productId || '',
      basePrice: s.basePrice, estimatedTime: s.estimatedTime, isActive: s.isActive,
      hasVariants: variants.length > 0,
    });
    setVariantItems(variants.map(v => ({ name: v.name, description: v.description, basePrice: v.basePrice, estimatedTime: v.estimatedTime })));
    setFormErrors({});
    setTouched({});
    setIsFormOpen(true);
    setBasePriceInput(s.basePrice > 0 ? String(s.basePrice) : '');
    setEstimatedTimeInput(String(s.estimatedTime));
  };

  const handleClose = () => { setIsFormOpen(false); setFormErrors({}); setTouched({}); };


  const addVariantItem = () => {
    setVariantItems(prev => [...prev, { name: '', description: '', basePrice: 0, estimatedTime: 30 }]);
  };

  const removeVariantItem = (index: number) => {
    setVariantItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariantItem = (index: number, field: keyof VariantFormItem, value: string | number) => {
    setVariantItems(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const save = () => {
    const nameErr = validateName(form.name);
    const brandErr = validateBrand(form.brandId);
    const categoryErr = ['category', 'series', 'product'].includes(form.level) ? validateCategory(form.categoryId) : undefined;
    const seriesErr = ['series', 'product'].includes(form.level) ? validateSeries(form.seriesId) : undefined;
    const productErr = form.level === 'product' ? validateProduct(form.productId) : undefined;
    const basePriceErr = !form.hasVariants ? validateBasePrice(form.basePrice) : undefined;
    const estimatedTimeErr = !form.hasVariants ? validateEstimatedTime(form.estimatedTime) : undefined;

    if (nameErr || brandErr || categoryErr || seriesErr || productErr || basePriceErr || estimatedTimeErr) {
      setFormErrors({ name: nameErr, brandId: brandErr, categoryId: categoryErr, seriesId: seriesErr, productId: productErr, basePrice: basePriceErr, estimatedTime: estimatedTimeErr });
      setTouched({ name: true, brandId: true, categoryId: true, seriesId: true, productId: true, basePrice: true, estimatedTime: true });
      scrollToFirstError();
      return;
    }

    const basePayload = {
      name: form.name.trim(), description: form.description.trim(), level: form.level,
      brandId: form.brandId,
      categoryId: ['category', 'series', 'product'].includes(form.level) ? form.categoryId : undefined,
      seriesId: ['series', 'product'].includes(form.level) ? form.seriesId : undefined,
      productId: form.level === 'product' ? form.productId : undefined,
      isActive: form.isActive,
    };

    if (editing) {
      updateService(editing.id, { ...basePayload, basePrice: form.hasVariants ? 0 : form.basePrice, estimatedTime: form.hasVariants ? 0 : form.estimatedTime, isVariant: false, parentServiceId: null });
      const oldVariants = getVariants(editing.id);
      oldVariants.forEach(v => deleteService(v.id));
      if (form.hasVariants) {
        variantItems.forEach(vi => { if (vi.name.trim()) createService({ ...basePayload, name: vi.name.trim(), description: vi.description.trim(), basePrice: vi.basePrice, estimatedTime: vi.estimatedTime, isVariant: true, parentServiceId: editing.id }); });
      }
    } else {
      const parent = createService({ ...basePayload, basePrice: form.hasVariants ? 0 : form.basePrice, estimatedTime: form.hasVariants ? 0 : form.estimatedTime, isVariant: false, parentServiceId: null });
      if (form.hasVariants && parent) {
        variantItems.forEach(vi => { if (vi.name.trim()) createService({ ...basePayload, name: vi.name.trim(), description: vi.description.trim(), basePrice: vi.basePrice, estimatedTime: vi.estimatedTime, isVariant: true, parentServiceId: parent.id }); });
      }
    }
    setIsFormOpen(false);
  };

  const handleDeactivate = () => {
    if (deactivateTarget) {
      updateService(deactivateTarget.id, { isActive: !deactivateTarget.isActive });
      // Also toggle variants
      const variants = getVariants(deactivateTarget.id);
      variants.forEach(v => updateService(v.id, { isActive: !deactivateTarget.isActive }));
      setDeactivateTarget(null);
    }
  };

  // Open detail with overrides preloaded
  const openDetail = (s: ServiceRecord) => {
    setDetailView(s);
    const existingOverrides = getOverridesByService(s.id);
    const edits: Record<string, { price: number; time: number }> = {};
    existingOverrides.forEach(o => {
      edits[o.productId] = { price: o.price, time: o.estimatedTime };
    });
    setOverrideEdits(edits);
  };

  const saveOverride = (serviceId: string, productId: string, keyField: 'serviceId' | 'productId' = 'productId') => {
    const key = keyField === 'productId' ? productId : serviceId;
    const edit = overrideEdits[key];
    if (edit) {
      upsertOverride({ serviceId, productId, price: edit.price, estimatedTime: edit.time });
    }
  };

  const removeOverride = (serviceId: string, productId: string, keyField: 'serviceId' | 'productId' = 'productId') => {
    const key = keyField === 'productId' ? productId : serviceId;
    const allOverrides = keyField === 'productId' ? getOverridesByService(serviceId) : getOverridesByProduct(productId);
    const existing = allOverrides.find(o => keyField === 'productId' ? o.productId === productId : o.serviceId === serviceId);
    if (existing) {
      deleteOverride(existing.id);
      setOverrideEdits(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // By Product: filtered products list
  const byProductFilteredCategories = byProductBrand !== 'all' ? categories.filter(c => c.brandId === byProductBrand) : categories;
  const byProductFilteredSeries = byProductCategory !== 'all' ? seriesList.filter(s => s.categoryId === byProductCategory) : (byProductBrand !== 'all' ? seriesList.filter(s => s.brandId === byProductBrand) : seriesList);

  const byProductFilteredProducts = useMemo(() => {
    let result = products;
    if (byProductSearch) result = result.filter(p => p.name.toLowerCase().includes(byProductSearch.toLowerCase()));
    if (byProductBrand !== 'all') result = result.filter(p => p.brandId === byProductBrand);
    if (byProductCategory !== 'all') result = result.filter(p => p.categoryId === byProductCategory);
    if (byProductSeries !== 'all') result = result.filter(p => p.seriesId === byProductSeries);
    return result;
  }, [products, byProductSearch, byProductBrand, byProductCategory, byProductSeries]);

  // By Service: filtered services list (only non-variant)
  const byServiceFilteredServices = useMemo(() => {
    let result = services.filter(s => s.level !== 'product' && !s.isVariant);
    if (byServiceSearch) result = result.filter(s => s.name.toLowerCase().includes(byServiceSearch.toLowerCase()));
    return result;
  }, [services, byServiceSearch]);

  // Load overrides when selecting in By Product / By Service tabs
  const selectByProduct = (productId: string) => {
    setByProductSelected(productId);
    setByProductCollapsedParents(new Set()); // Reset to show all parents expanded
    const existing = getOverridesByProduct(productId);
    const edits: Record<string, { price: number; time: number }> = {};
    existing.forEach(o => {
      edits[o.serviceId] = { price: o.price, time: o.estimatedTime };
    });
    setOverrideEdits(edits);
  };

  const selectByService = (serviceId: string) => {
    setByServiceSelected(serviceId);
    setByServiceCollapsedVariants(new Set()); // Reset to show all variants expanded
    const existing = getOverridesByService(serviceId);
    const edits: Record<string, { price: number; time: number }> = {};
    existing.forEach(o => {
      edits[o.productId] = { price: o.price, time: o.estimatedTime };
    });
    setOverrideEdits(edits);
  };

  // Override row renderer (shared)
  const OverrideRow = ({ svc, productId, defaultPrice, defaultTime, keyField = 'productId', label, sublabel, disabled: isDisabledProp }: {
    svc: ServiceRecord; productId: string; defaultPrice: number; defaultTime: number;
    keyField?: 'serviceId' | 'productId'; label: string; sublabel: string; disabled: boolean;
  }) => {
    const key = keyField === 'productId' ? productId : svc.id;
    const edit = overrideEdits[key];
    return (
      <div className={`rounded-lg border border-border p-3 space-y-2 ${isDisabledProp ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          </div>
          <Switch checked={!isDisabledProp} onCheckedChange={(checked) => toggleServiceForProduct(svc.id, productId, !checked)} />
        </div>
        {!isDisabledProp && (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Price ($)</Label>
              <Input type="number" min={0} step={0.01} placeholder={String(defaultPrice)}
                value={edit?.price ?? ''}
                onChange={e => setOverrideEdits(prev => ({ ...prev, [key]: { price: Number(e.target.value), time: prev[key]?.time ?? defaultTime } }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Time (min)</Label>
              <Input type="number" min={1} placeholder={String(defaultTime)}
                value={edit?.time ?? ''}
                onChange={e => setOverrideEdits(prev => ({ ...prev, [key]: { price: prev[key]?.price ?? defaultPrice, time: Number(e.target.value) } }))} />
            </div>
            <Button size="sm" variant="secondary" disabled={!edit} onClick={() => saveOverride(svc.id, productId, keyField)}>Save</Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and configure services across Brand, Category, Series, and Product levels.</p>
        </div>
        <Button onClick={openAdd} className="gap-2 shrink-0"><Plus className="h-4 w-4" /> Add Service</Button>
      </div>

      {/* Main 3-tab Navigation */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="services" className="gap-2"><Wrench className="h-4 w-4" /> Services List</TabsTrigger>
          <TabsTrigger value="by-product" className="gap-2"><Package className="h-4 w-4" /> By Product</TabsTrigger>
          <TabsTrigger value="by-service" className="gap-2"><Wrench className="h-4 w-4" /> By Service</TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Services List ===== */}
        <TabsContent value="services" className="space-y-6 mt-6">
          {/* Filters */}
          <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search services..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
              </div>
              <Select value={stagedFilters.level} onValueChange={v => {
                const cleared = { category: "all", series: "all", product: "all" };
                if (v === "brand") setStagedFilters(f => ({ ...f, level: v, ...cleared }));
                else if (v === "category") setStagedFilters(f => ({ ...f, level: v, series: "all", product: "all" }));
                else if (v === "series") setStagedFilters(f => ({ ...f, level: v, product: "all" }));
                else setStagedFilters(f => ({ ...f, level: v }));
              }}>
                <SelectTrigger><SelectValue placeholder="All Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {LEVELS.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stagedFilters.status} onValueChange={v => setStagedFilters(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select value={stagedFilters.brand} onValueChange={v => setStagedFilters(f => ({ ...f, brand: v, category: "all", series: "all", product: "all" }))}>
                <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stagedFilters.category} onValueChange={v => setStagedFilters(f => ({ ...f, category: v, series: "all", product: "all" }))} disabled={stagedFilters.brand === "all" || stagedFilters.level === "brand"}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {stagedCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stagedFilters.series} onValueChange={v => setStagedFilters(f => ({ ...f, series: v, product: "all" }))} disabled={stagedFilters.category === "all" || ['brand', 'category'].includes(stagedFilters.level)}>
                <SelectTrigger><SelectValue placeholder="Series" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {stagedSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stagedFilters.product} onValueChange={v => setStagedFilters(f => ({ ...f, product: v }))} disabled={stagedFilters.series === "all" || ['brand', 'category', 'series'].includes(stagedFilters.level)}>
                <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {stagedProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(hasChanges || hasApplied) && (
              <div className="flex justify-end gap-2">
                {hasChanges && (
                  <Button size="sm" onClick={() => { setAppliedFilters({ ...stagedFilters }); setSearch(searchInput); setPage(1); }}>Apply</Button>
                )}
                {hasApplied && (
                  <Button size="sm" variant="outline" onClick={() => {
                    const cleared = { level: "all", status: "all", brand: "all", category: "all", series: "all", product: "all" };
                    setStagedFilters(cleared); setAppliedFilters(cleared); setSearchInput(""); setSearch(""); setPage(1);
                  }}>Clear</Button>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {paginated.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services found. {filtered.length === 0 && services.length > 0 ? 'Try adjusting your filters.' : 'Click "Add Service" to create one.'}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Level</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigned To</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Base Price</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Est. Time</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden xl:table-cell">Variants</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden xl:table-cell">Linked Products</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 && (
                        <tr><td colSpan={10} className="py-12 text-center text-muted-foreground">No services found.</td></tr>
                      )}
                      {paginated.map(s => {
                        const variants = getVariants(s.id);
                        const isExpanded = expandedParents.has(s.id);
                        const variantCount = variants.length;
                        return (
                          <>
                            <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => variantCount > 0 ? toggleExpanded(s.id) : openDetail(s)}>
                              <td className="py-3 px-4 font-medium text-foreground">
                                <div className="flex items-center gap-2">
                                  {variantCount > 0 && (
                                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  )}
                                  {s.name}
                                  {variantCount > 0 && <Badge variant="secondary" className="text-xs whitespace-nowrap">{variantCount} variants</Badge>}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{s.description}</td>
                              <td className="py-3 px-4"><Badge variant="outline" className="capitalize">{s.level}</Badge></td>
                              <td className="py-3 px-4">{getAssignedTo(s)}</td>
                              <td className="py-3 px-4">{variantCount > 0 ? '—' : `$${s.basePrice}`}</td>
                              <td className="py-3 px-4 hidden md:table-cell">{variantCount > 0 ? '—' : `${s.estimatedTime} min`}</td>
                              <td className="py-3 px-4">
                                <Badge variant={s.isActive ? 'default' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                              </td>
                              <td className="py-3 px-4 hidden xl:table-cell">{variantCount || '—'}</td>
                              <td className="py-3 px-4 hidden xl:table-cell">{getLinkedProductCount(s)}</td>
                              <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeactivateTarget(s)}>
                                    <Power className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            {/* Variant rows */}
                            {isExpanded && variants.map(v => (
                              <tr key={v.id} className="border-b border-border/50 bg-muted/10 hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => openDetail(v)}>
                                <td className="py-2 px-4 pl-12 font-medium text-foreground text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">└</span>
                                    {v.name}
                                    <Badge variant="outline" className="text-xs">Variant</Badge>
                                  </div>
                                </td>
                                <td className="py-2 px-4 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate text-sm">{v.description}</td>
                                <td className="py-2 px-4"><Badge variant="outline" className="capitalize text-xs">{v.level}</Badge></td>
                                <td className="py-2 px-4 text-sm">{getAssignedTo(v)}</td>
                                <td className="py-2 px-4 text-sm">${v.basePrice}</td>
                                <td className="py-2 px-4 hidden md:table-cell text-sm">{v.estimatedTime} min</td>
                                <td className="py-2 px-4">
                                  <Badge variant={v.isActive ? 'default' : 'secondary'} className="text-xs">{v.isActive ? 'Active' : 'Inactive'}</Badge>
                                </td>
                                <td className="py-2 px-4 hidden xl:table-cell text-sm">—</td>
                                <td className="py-2 px-4 hidden xl:table-cell text-sm">{getLinkedProductCount(v)}</td>
                                <td className="py-2 px-4 text-right" onClick={e => e.stopPropagation()}>
                                  <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDetail(v)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <TablePagination totalItems={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
              </>
            )}
          </div>
        </TabsContent>

        {/* ===== TAB 2: By Product ===== */}
        <TabsContent value="by-product" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <div className={`space-y-4 ${byProductSelected ? 'hidden lg:block' : 'block'}`}>
              <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Select a Product</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search products..." value={byProductSearch} onChange={e => setByProductSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={byProductBrand} onValueChange={v => { setByProductBrand(v); setByProductCategory('all'); setByProductSeries('all'); }}>
                  <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={byProductCategory} onValueChange={v => { setByProductCategory(v); setByProductSeries('all'); }}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {byProductFilteredCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {byProductCategory !== 'all' && (
                  <Select value={byProductSeries} onValueChange={v => setByProductSeries(v)}>
                    <SelectTrigger><SelectValue placeholder="Series" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Series</SelectItem>
                      {byProductFilteredSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="rounded-lg border border-border bg-card overflow-hidden max-h-[500px] overflow-y-auto scrollbar-hide">
                {byProductFilteredProducts.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No products found.</p>}
                {byProductFilteredProducts.map(p => {
                  const svcCount = getServicesForProduct(p.id).length;
                  const totalSvcCount = getServicesForProduct(p.id, true).length;
                  const disabledCount = totalSvcCount - svcCount;
                  return (
                    <div key={p.id} className={`flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${byProductSelected === p.id ? 'bg-primary/10' : 'hover:bg-muted/30'}`} onClick={() => selectByProduct(p.id)}>
                      <img src={p.iconImage} alt={p.name} className="h-8 w-8 rounded object-cover bg-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{svcCount} active{disabledCount > 0 && `, ${disabledCount} disabled`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Override editor for selected product */}
            <div className={`rounded-lg border border-border bg-card p-5 ${!byProductSelected ? 'hidden lg:flex lg:flex-col lg:items-center lg:justify-center' : ''}`}>
              {!byProductSelected ? (
                <>
                  <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-center text-muted-foreground">Select a product to view and customize its service overrides.</p>
                </>
              ) : (() => {
                const p = products.find(pr => pr.id === byProductSelected);
                if (!p) return null;
                const groups = groupServicesForProduct(p.id);
                return (
                  <div className="space-y-4">
                    <button className="lg:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={() => setByProductSelected('')}>← Back to products</button>
                    <div className="flex items-center gap-3">
                      <img src={p.iconImage} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-muted" />
                      <div>
                        <h3 className="font-semibold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{brandName(p.brandId)} · {categoryName(p.categoryId)} · {seriesName(p.seriesId)}</p>
                      </div>
                    </div>
                    {groups.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No services are assigned to this product.</p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">Override price and estimated time for services inherited by this product.</p>
                        <div className="space-y-4">
                          {groups.map((group, gi) => {
                            const isExpanded = group.parent ? !byProductCollapsedParents.has(group.parent.id) : true;
                            return (
                              <div key={gi}>
                                {group.parent && (
                                  <div className="mb-2 cursor-pointer" onClick={() => toggleByProductExpanded(group.parent!.id)}>
                                    <div className="flex items-center gap-2">
                                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {group.parent.name}
                                        <Badge variant="secondary" className="text-xs">{group.items.length} variants</Badge>
                                      </h4>
                                    </div>
                                    {isExpanded && <p className="text-xs text-muted-foreground ml-6 mt-1">{group.parent.description}</p>}
                                  </div>
                                )}
                                {isExpanded && (
                                  <div className={`space-y-2 ${group.parent ? 'ml-4 border-l-2 border-border pl-3' : ''}`}>
                                    {group.items.map(svc => (
                                      <OverrideRow
                                        key={svc.id}
                                        svc={svc}
                                        productId={p.id}
                                        defaultPrice={svc.basePrice}
                                        defaultTime={svc.estimatedTime}
                                        keyField="serviceId"
                                        label={svc.name}
                                        sublabel={`${svc.isVariant ? 'Variant' : ''} ${svc.level} · Default: $${svc.basePrice} · ${svc.estimatedTime} min`}
                                        disabled={isServiceDisabledForProduct(svc.id, p.id)}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </TabsContent>

        {/* ===== TAB 3: By Service ===== */}
        <TabsContent value="by-service" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <div className={`space-y-4 ${byServiceSelected ? 'hidden lg:block' : 'block'}`}>
              <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Select a Service</h3>
                <p className="text-xs text-muted-foreground">Only Brand, Category, and Series level services are shown (product-level services don't need overrides).</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search services..." value={byServiceSearch} onChange={e => setByServiceSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card overflow-hidden max-h-[500px] overflow-y-auto scrollbar-hide">
                {byServiceFilteredServices.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No services found.</p>}
                {byServiceFilteredServices.map(s => {
                  const linkedCount = getLinkedProductCount(s);
                  const variants = getVariants(s.id);
                  const overrideCount = variants.length > 0
                    ? variants.reduce((sum, v) => sum + getOverridesByService(v.id).length, 0)
                    : getOverridesByService(s.id).length;
                  return (
                    <div key={s.id} className={`p-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${byServiceSelected === s.id ? 'bg-primary/10' : 'hover:bg-muted/30'}`} onClick={() => selectByService(s.id)}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{s.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-[6px]">
                            <Badge variant="outline" className="capitalize text-xs mr-1">{s.level}</Badge>
                            {getAssignedTo(s)}
                          </p>
                        </div>
                        {variants.length > 0 && <Badge variant="secondary" className="text-xs">{variants.length} variants</Badge>}
                        {/* {overrideCount > 0 && <Badge variant="outline" className="text-xs shrink-0">{overrideCount} override(s)</Badge>} */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`rounded-lg border border-border bg-card p-5 ${!byServiceSelected ? 'hidden lg:flex lg:flex-col lg:items-center lg:justify-center' : ''}`}>
              {!byServiceSelected ? (
                <>
                  <Wrench className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-center text-muted-foreground">Select a service to view and customize its product overrides.</p>
                </>
              ) : (() => {
                const svc = services.find(s => s.id === byServiceSelected);
                if (!svc) return null;
                const variants = getVariants(svc.id);
                const linkedProducts = getLinkedProducts(svc);
                const hasVars = variants.length > 0;
                return (
                  <div className="space-y-4">
                    <button className="lg:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={() => setByServiceSelected('')}>← Back to services</button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{svc.name}</h3>
                        {hasVars && <Badge variant="secondary" className="text-xs">{variants.length} variants</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="capitalize text-xs mr-1">{svc.level}</Badge>
                        {getAssignedTo(svc)} {!hasVars && `· Default: $${svc.basePrice} · ${svc.estimatedTime} min`}
                      </p>
                      {svc.description && <p className="text-sm text-muted-foreground mt-2">{svc.description}</p>}
                    </div>

                    {hasVars ? (
                      <>
                        <p className="text-sm text-muted-foreground">This service has {variants.length} variant(s). Overrides apply at the variant level for each product.</p>
                        {variants.map(variant => {
                          const isVariantExpanded = !byServiceCollapsedVariants.has(variant.id);
                          return (
                            <div key={variant.id} className="space-y-3">
                              <div className="cursor-pointer" onClick={() => toggleByServiceVariantExpanded(variant.id)}>
                                <div className="flex items-center gap-2 border-b border-border pb-2">
                                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isVariantExpanded ? 'rotate-90' : ''}`} />
                                  <h4 className="text-sm font-semibold text-foreground">{variant.name} — ${variant.basePrice} · {variant.estimatedTime} min</h4>
                                  <Badge variant="outline" className="text-xs">{linkedProducts.length} products</Badge>
                                </div>
                              </div>
                              {isVariantExpanded && (
                                <div className="space-y-2 ml-6">
                                  {linkedProducts.map(p => (
                                    <OverrideRow
                                      key={`${variant.id}-${p.id}`}
                                      svc={variant}
                                      productId={p.id}
                                      defaultPrice={variant.basePrice}
                                      defaultTime={variant.estimatedTime}
                                      label={p.name}
                                      sublabel={`${seriesName(p.seriesId)} · ${categoryName(p.categoryId)}`}
                                      disabled={isServiceDisabledForProduct(variant.id, p.id)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">Customize price and time for individual products. Products without overrides use defaults (${svc.basePrice}, {svc.estimatedTime} min).</p>
                        {linkedProducts.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4">No products linked to this service.</p>
                        ) : (
                          <div className="space-y-2">
                            {linkedProducts.map(p => (
                              <OverrideRow
                                key={p.id}
                                svc={svc}
                                productId={p.id}
                                defaultPrice={svc.basePrice}
                                defaultTime={svc.estimatedTime}
                                label={p.name}
                                sublabel={`${seriesName(p.seriesId)} · ${categoryName(p.categoryId)}`}
                                disabled={isServiceDisabledForProduct(svc.id, p.id)}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail View Dialog */}
      <Dialog open={!!detailView} onOpenChange={() => setDetailView(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Service Detail</DialogTitle></DialogHeader>
          {detailView && (() => {
            const variants = getVariants(detailView.id);
            const hasVars = variants.length > 0;
            return (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  {hasVars && <TabsTrigger value="variants" className="flex-1">Variants ({variants.length})</TabsTrigger>}
                  {!detailView.isVariant && (
                    <TabsTrigger value="overrides" className="flex-1">
                      Product Overrides ({getLinkedProducts(detailView).length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-muted-foreground text-xs">Name</Label><p className="font-medium">{detailView.name}</p></div>
                    <div><Label className="text-muted-foreground text-xs">Status</Label><div><Badge variant={detailView.isActive ? 'default' : 'secondary'}>{detailView.isActive ? 'Active' : 'Inactive'}</Badge></div></div>
                  </div>
                  <div><Label className="text-muted-foreground text-xs">Description</Label><p className="text-sm">{detailView.description || '—'}</p></div>
                  {detailView.isVariant && detailView.parentServiceId && (
                    <div><Label className="text-muted-foreground text-xs">Parent Service</Label><p className="text-sm">{services.find(s => s.id === detailView.parentServiceId)?.name || '—'}</p></div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label className="text-muted-foreground text-xs">Level</Label><p className="capitalize">{detailView.level}</p></div>
                    <div><Label className="text-muted-foreground text-xs">Assigned To</Label><p>{getAssignedTo(detailView)}</p></div>
                    <div><Label className="text-muted-foreground text-xs">Linked Products</Label><p>{getLinkedProductCount(detailView)}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label className="text-muted-foreground text-xs">Base Price</Label><p>{hasVars ? '—' : `$${detailView.basePrice}`}</p></div>
                    <div><Label className="text-muted-foreground text-xs">Est. Time</Label><p>{hasVars ? '—' : `${detailView.estimatedTime} min`}</p></div>
                    <div><Label className="text-muted-foreground text-xs">Created</Label><p>{detailView.createdAt}</p></div>
                  </div>
                  {detailView.level !== 'brand' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-muted-foreground text-xs">Brand</Label><p>{brandName(detailView.brandId)}</p></div>
                      {detailView.categoryId && <div><Label className="text-muted-foreground text-xs">Category</Label><p>{categoryName(detailView.categoryId)}</p></div>}
                      {detailView.seriesId && <div><Label className="text-muted-foreground text-xs">Series</Label><p>{seriesName(detailView.seriesId)}</p></div>}
                      {detailView.productId && <div><Label className="text-muted-foreground text-xs">Product</Label><p>{productName(detailView.productId)}</p></div>}
                    </div>
                  )}
                </TabsContent>

                {hasVars && (
                  <TabsContent value="variants" className="mt-4">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Variants of this service:</p>
                      {variants.map(v => (
                        <div key={v.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{v.name}</p>
                              <p className="text-xs text-muted-foreground">{v.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">${v.basePrice}</p>
                              <p className="text-xs text-muted-foreground">{v.estimatedTime} min</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {!detailView.isVariant && (
                  <TabsContent value="overrides" className="mt-4">
                    {detailView.level === 'product' ? (
                      <p className="text-sm text-muted-foreground py-4">This service is already assigned at the product level. No overrides needed.</p>
                    ) : hasVars ? (
                      <p className="text-sm text-muted-foreground py-4">This service has variants. Overrides are managed at the variant level. Use the "By Product" or "By Service" tabs.</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Customize price and estimated time for individual products.</p>
                        <div className="space-y-2">
                          {getLinkedProducts(detailView).map(p => {
                            const edit = overrideEdits[p.id];
                            return (
                              <div key={p.id} className="rounded-lg border border-border p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{seriesName(p.seriesId)} · {categoryName(p.categoryId)}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Price ($)</Label>
                                    <Input type="number" min={0} step={0.01} placeholder={String(detailView.basePrice)} value={edit?.price ?? ''}
                                      onChange={e => setOverrideEdits(prev => ({ ...prev, [p.id]: { price: Number(e.target.value), time: prev[p.id]?.time ?? detailView.estimatedTime } }))} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Time (min)</Label>
                                    <Input type="number" min={1} placeholder={String(detailView.estimatedTime)} value={edit?.time ?? ''}
                                      onChange={e => setOverrideEdits(prev => ({ ...prev, [p.id]: { price: prev[p.id]?.price ?? detailView.basePrice, time: Number(e.target.value) } }))} />
                                  </div>
                                  <Button size="sm" variant="secondary" disabled={!edit} onClick={() => saveOverride(detailView.id, p.id)}>Save</Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            );
          })()}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailView(null)}>Close</Button>
            {detailView && !detailView.isVariant && (
              <Button onClick={() => { if (detailView) { openEdit(detailView); setDetailView(null); } }}>Edit</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent className="flex flex-col max-w-xl max-h-[90vh]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle></DialogHeader>
          <div ref={formRef} className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
            <div className="space-y-4 mx-1">
              <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
              <div className="space-y-2" data-error={!!formErrors.name}>
                <Label>Service Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => {
                    const val = e.target.value;
                    setForm(f => ({ ...f, name: val }));
                    if (touched.name) setFormErrors(prev => ({ ...prev, name: validateName(val) }));
                  }}
                  onBlur={() => {
                    setTouched(prev => ({ ...prev, name: true }));
                    setFormErrors(prev => ({ ...prev, name: validateName(form.name) }));
                  }}
                  placeholder="e.g. Screen Replacement"
                />
                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
              </div>

              {/* Variant Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label className="text-sm font-medium">This service has variants</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">e.g. Original, OEM, Copy, Refurbished</p>
                </div>
                <Switch checked={form.hasVariants} onCheckedChange={v => {
                  setForm(f => ({ ...f, hasVariants: v }));
                  if (v && variantItems.length === 0) addVariantItem();
                }} />
              </div>

              {!form.hasVariants && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Base Price ($) *</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={basePriceInput}
                      onChange={e => {
                        const raw = e.target.value.replace(/^0+(?=\d)/, '');
                        setBasePriceInput(raw);
                        const val = Number(raw);
                        setForm(f => ({ ...f, basePrice: val }));
                        if (touched.basePrice) setFormErrors(prev => ({ ...prev, basePrice: validateBasePrice(val) }));
                      }}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, basePrice: true }));
                        setFormErrors(prev => ({ ...prev, basePrice: validateBasePrice(form.basePrice) }));
                      }}
                    />
                    {formErrors.basePrice && <p className="text-xs text-destructive">{formErrors.basePrice}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Est. Time (min) *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={estimatedTimeInput}
                      onChange={e => {
                        const raw = e.target.value.replace(/^0+(?=\d)/, '');
                        setEstimatedTimeInput(raw);
                        const val = Number(raw);
                        setForm(f => ({ ...f, estimatedTime: val }));
                        if (touched.estimatedTime) setFormErrors(prev => ({ ...prev, estimatedTime: validateEstimatedTime(val) }));
                      }}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, estimatedTime: true }));
                        setFormErrors(prev => ({ ...prev, estimatedTime: validateEstimatedTime(form.estimatedTime) }));
                      }}
                    />
                    {formErrors.estimatedTime && <p className="text-xs text-destructive">{formErrors.estimatedTime}</p>}
                  </div>
                </div>
              )}

              {/* Variant Items */}
              {form.hasVariants && (
                <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Variants</h4>
                    <Button type="button" size="sm" variant="outline" onClick={addVariantItem} className="gap-1">
                      <Plus className="h-3 w-3" /> Add Variant
                    </Button>
                  </div>
                  {variantItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No variants added. Click "Add Variant" to begin.</p>
                  )}
                  {variantItems.map((vi, index) => (
                    <div key={index} className="rounded-lg border border-border bg-card p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Variant {index + 1}</span>
                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeVariantItem(index)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input placeholder="Variant name (e.g. Original Screen)" value={vi.name} onChange={e => updateVariantItem(index, 'name', e.target.value)} />
                        <Input placeholder="Description (optional)" value={vi.description} onChange={e => updateVariantItem(index, 'description', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1" data-error={!!formErrors.basePrice}>
                          <Label className="text-xs">Base Price ($)</Label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            value={vi.basePrice === 0 ? '' : vi.basePrice}
                            onChange={e => {
                              const raw = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                              updateVariantItem(index, 'basePrice', raw === '' ? 0 : Number(raw));
                            }}
                          />
                        </div>
                        <div className="space-y-1" data-error={!!formErrors.estimatedTime}>
                          <Label className="text-xs">Est. Time (min)</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="30"
                            value={vi.estimatedTime === 0 ? '' : vi.estimatedTime}
                            onChange={e => {
                              const raw = e.target.value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
                              updateVariantItem(index, 'estimatedTime', raw === '' ? 0 : Math.max(1, Number(raw)));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{form.isActive ? 'Active' : 'Inactive'}</span>
                  <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-5 mx-1">
              <h3 className="text-sm font-semibold text-foreground">Service Assignment</h3>
              <div className="space-y-2">
                <Label>Level *</Label>
                <Select value={form.level} onValueChange={v => {
                  setForm(f => ({ ...f, level: v as AssignmentLevel, categoryId: '', seriesId: '', productId: '' }));
                  setFormErrors(prev => ({ ...prev, categoryId: undefined, seriesId: undefined, productId: undefined }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2" data-error={!!formErrors.brandId}>
                <Label>Brand *</Label>
                <Select value={form.brandId} onValueChange={v => {
                  setForm(f => ({ ...f, brandId: v, categoryId: '', seriesId: '', productId: '' }));
                  setTouched(prev => ({ ...prev, brandId: true }));
                  setFormErrors(prev => ({ ...prev, brandId: validateBrand(v), categoryId: undefined, seriesId: undefined, productId: undefined }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
                {formErrors.brandId && <p className="text-xs text-destructive">{formErrors.brandId}</p>}
              </div>
              {['category', 'series', 'product'].includes(form.level) && (
                <div className="space-y-2" data-error={!!formErrors.categoryId}>
                  <Label>Category *</Label>
                  <Select value={form.categoryId} onValueChange={v => {
                    setForm(f => ({ ...f, categoryId: v, seriesId: '', productId: '' }));
                    setTouched(prev => ({ ...prev, categoryId: true }));
                    setFormErrors(prev => ({ ...prev, categoryId: validateCategory(v), seriesId: undefined, productId: undefined }));
                  }} disabled={!form.brandId}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{formCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {formErrors.categoryId && <p className="text-xs text-destructive">{formErrors.categoryId}</p>}
                </div>
              )}
              {['series', 'product'].includes(form.level) && (
                <div className="space-y-2" data-error={!!formErrors.seriesId}>
                  <Label>Series *</Label>
                  <Select value={form.seriesId} onValueChange={v => {
                    setForm(f => ({ ...f, seriesId: v, productId: '' }));
                    setTouched(prev => ({ ...prev, seriesId: true }));
                    setFormErrors(prev => ({ ...prev, seriesId: validateSeries(v), productId: undefined }));
                  }} disabled={!form.categoryId}>
                    <SelectTrigger><SelectValue placeholder="Select series" /></SelectTrigger>
                    <SelectContent>{formSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {formErrors.seriesId && <p className="text-xs text-destructive">{formErrors.seriesId}</p>}
                </div>
              )}
              {form.level === 'product' && (
                <div className="space-y-2" data-error={!!formErrors.productId}>
                  <Label>Product *</Label>
                  <Select value={form.productId} onValueChange={v => {
                    setForm(f => ({ ...f, productId: v }));
                    setTouched(prev => ({ ...prev, productId: true }));
                    setFormErrors(prev => ({ ...prev, productId: validateProduct(v) }));
                  }} disabled={!form.seriesId}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{formProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {formErrors.productId && <p className="text-xs text-destructive">{formErrors.productId}</p>}
                </div>
              )}
              {form.brandId && (
                <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  This service will apply to <strong className="text-foreground">
                    {form.level === 'product' && form.productId ? 1 :
                      form.level === 'series' && form.seriesId ? products.filter(p => p.seriesId === form.seriesId).length :
                        form.level === 'category' && form.categoryId ? products.filter(p => p.categoryId === form.categoryId).length :
                          products.filter(p => p.brandId === form.brandId).length}
                  </strong> product(s).
                  {form.hasVariants && variantItems.filter(v => v.name.trim()).length > 0 && (
                    <> Each product will get <strong className="text-foreground">{variantItems.filter(v => v.name.trim()).length}</strong> variant(s).</>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate/Activate confirm */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={() => setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deactivateTarget?.isActive ? 'Deactivate' : 'Activate'} Service</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.isActive
                ? `Deactivate "${deactivateTarget?.name}"? It will no longer appear as available.${hasVariants(deactivateTarget?.id || '') ? ' All variants will also be deactivated.' : ''}`
                : `Activate "${deactivateTarget?.name}"?${hasVariants(deactivateTarget?.id || '') ? ' All variants will also be activated.' : ''}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              {deactivateTarget?.isActive ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServicesPage;
