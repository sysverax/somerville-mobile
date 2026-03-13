import { useState, useMemo, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useServices } from '@/hooks/useServices';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { productServiceService } from '@/services/productService.service';
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
import { Plus, Pencil, Search, ChevronUp, ChevronDown, Power, RotateCcw, Wrench, Package, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import TablePagination from '@/components/TablePagination';
import EmptyState from '@/components/EmptyState';

const LEVELS: AssignmentLevel[] = ['brand', 'category', 'series', 'product'];

interface VariantFormItem {
  id?: string;
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

type FormErrors = { name?: string; brandId?: string; categoryId?: string; seriesId?: string; productId?: string; basePrice?: string; estimatedTime?: string; variants?: string };

const ServicesPage = () => {
  const { toast } = useToast();
  const { services, total, createService, updateService, updateServiceStatus, getVariants, hasVariants, isLoading: servicesLoading, error: servicesError, refresh } = useServices();
  const { brands, categories, series: seriesList, products, isLoading: optionsLoading } = useFilterOptions();
  const initialLoading = servicesLoading || optionsLoading;

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
  const [deactivateTarget, setDeactivateTarget] = useState<ServiceRecord | null>(null);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ name?: boolean; brandId?: boolean; categoryId?: boolean; seriesId?: boolean; productId?: boolean; basePrice?: boolean; estimatedTime?: boolean }>({});
  const [basePriceInput, setBasePriceInput] = useState('');
  const [estimatedTimeInput, setEstimatedTimeInput] = useState('');

  const [variantErrors, setVariantErrors] = useState<Record<number, { name?: string; basePrice?: string; estimatedTime?: string }>>({});

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
    basePrice: 0, estimatedTime: 0, isActive: true,
    hasVariants: false,
  });
  const [variantItems, setVariantItems] = useState<VariantFormItem[]>([]);
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);

    // Override editing state
  const [overrideEdits, setOverrideEdits] = useState<Record<string, { price: string; time: string }>>({});
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // By Product tab state
  const [byProductSelected, setByProductSelected] = useState<string>('');
  const [byProductBrand, setByProductBrand] = useState<string>('all');
  const [byProductCategory, setByProductCategory] = useState<string>('all');
  const [byProductSeries, setByProductSeries] = useState<string>('all');
  const [byProductSearch, setByProductSearch] = useState('');
  const [byProductCollapsedParents, setByProductCollapsedParents] = useState<Set<string>>(new Set());
  const [productServices, setProductServices] = useState<any>(null);
  const [isLoadingProductServices, setIsLoadingProductServices] = useState(false);

  // By Service tab state
  const [byServiceSelected, setByServiceSelected] = useState<string>('');
  const [byServiceSearch, setByServiceSearch] = useState('');
  const [byServiceCollapsedVariants, setByServiceCollapsedVariants] = useState<Set<string>>(new Set());
  const [serviceProducts, setServiceProducts] = useState<any>(null);
  const [isLoadingServiceProducts, setIsLoadingServiceProducts] = useState(false);

  // Helpers
  // Helpers
  const brandName = (id: string) => brands.find(b => b.id === id)?.name || id;
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const seriesName = (id: string) => seriesList.find(s => s.id === id)?.name || id;
  const productName = (id: string) => products.find(p => p.id === id)?.name || id;



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

  const paginated = filtered;

  useEffect(() => {
    refresh({
      page,
      limit: pageSize,
      level: appliedFilters.level !== "all" ? appliedFilters.level : undefined,
      brandId: appliedFilters.brand !== "all" ? appliedFilters.brand : undefined,
      categoryId: appliedFilters.category !== "all" ? appliedFilters.category : undefined,
      seriesId: appliedFilters.series !== "all" ? appliedFilters.series : undefined,
      productId: appliedFilters.product !== "all" ? appliedFilters.product : undefined,
      search: search !== "" ? search : undefined,
      isActive: appliedFilters.status !== "all" ? appliedFilters.status === "active" : undefined,
    });
  }, [appliedFilters, search, page, pageSize, refresh]);

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
    setForm({ name: '', description: '', level: 'brand', brandId: '', categoryId: '', seriesId: '', productId: '', basePrice: 0, estimatedTime: 0, isActive: true, hasVariants: false });
    setVariantItems([]);
    setRemovedVariantIds([]);
    setFormErrors({});
    setTouched({});
    setIsFormOpen(true);
    setBasePriceInput('0');
    setEstimatedTimeInput('0');
    setVariantErrors({});
  };

  const openEdit = (s: ServiceRecord) => {
    setEditing(s);
    const variants = getVariants(s.id);

    // Resolve hierarchy
    let bId = '';
    let cId = '';
    let serId = '';
    let pId = '';

    if (s.level === 'brand') {
      bId = s.levelId;
    } else if (s.level === 'category') {
      cId = s.levelId;
      const cat = categories.find(c => c.id === cId);
      if (cat) bId = cat.brandId;
    } else if (s.level === 'series') {
      serId = s.levelId;
      const ser = seriesList.find(ser => ser.id === serId);
      if (ser) {
        cId = ser.categoryId;
        const cat = categories.find(c => c.id === cId);
        if (cat) bId = cat.brandId;
      }
    } else if (s.level === 'product') {
      pId = s.levelId;
      const prod = products.find(p => p.id === pId);
      if (prod) {
        serId = prod.seriesId;
        const ser = seriesList.find(ser => ser.id === serId);
        if (ser) {
          cId = ser.categoryId;
          const cat = categories.find(c => c.id === cId);
          if (cat) bId = cat.brandId;
        }
      }
    }

    setForm({
      name: s.name, description: s.description, level: s.level,
      brandId: bId, categoryId: cId, seriesId: serId, productId: pId,
      basePrice: s.basePrice, estimatedTime: s.estimatedTime, isActive: s.isActive,
      hasVariants: variants.length > 0,
    });
    setVariantItems(variants.map(v => ({ id: v.id, name: v.name, description: v.description, basePrice: v.basePrice, estimatedTime: v.estimatedTime })));
    setRemovedVariantIds([]);
    setFormErrors({});
    setTouched({});
    setIsFormOpen(true);
    setBasePriceInput(s.basePrice > 0 ? String(s.basePrice) : '');
    setEstimatedTimeInput(String(s.estimatedTime));
    setVariantErrors({});
  };

  const handleClose = () => { setIsFormOpen(false); setFormErrors({}); setTouched({}); };


  const addVariantItem = () => {
    setVariantItems(prev => [...prev, { name: '', description: '', basePrice: 0, estimatedTime: 0 }]);
  };

  const removeVariantItem = (index: number) => {
    const item = variantItems[index];
    if (item.id) {
      setRemovedVariantIds(prev => [...prev, item.id!]);
    }
    setVariantItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariantItem = (index: number, field: keyof VariantFormItem, value: string | number) => {
    setVariantItems(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const save = async () => {
    const nameErr = validateName(form.name);
    const brandErr = validateBrand(form.brandId);
    const categoryErr = ['category', 'series', 'product'].includes(form.level) ? validateCategory(form.categoryId) : undefined;
    const seriesErr = ['series', 'product'].includes(form.level) ? validateSeries(form.seriesId) : undefined;
    const productErr = form.level === 'product' ? validateProduct(form.productId) : undefined;
    const basePriceErr = !form.hasVariants ? validateBasePrice(form.basePrice) : undefined;
    const estimatedTimeErr = !form.hasVariants ? validateEstimatedTime(form.estimatedTime) : undefined;

    // Validate variants
    const variantErrs: Record<number, { name?: string; basePrice?: string; estimatedTime?: string }> = {};
    if (form.hasVariants) {
      if (variantItems.length === 0) {
        // We'll surface this as a general form signal — handled below
      } else {
        variantItems.forEach((vi, i) => {
          const errs: { name?: string; basePrice?: string; estimatedTime?: string } = {};
          if (!vi.name.trim()) errs.name = 'Variant name is required';
          if (!vi.basePrice || vi.basePrice <= 0) errs.basePrice = 'Price is required';
          if (!vi.estimatedTime || vi.estimatedTime <= 0) errs.estimatedTime = 'Time is required';
          if (Object.keys(errs).length > 0) variantErrs[i] = errs;
        });
      }
    }

    const hasVariantErrs = Object.keys(variantErrs).length > 0;
    const hasNoVariants = form.hasVariants && variantItems.length === 0;
    const variantsErr = hasNoVariants ? 'At least one variant is required' : undefined;

    if (nameErr || brandErr || categoryErr || seriesErr || productErr || basePriceErr || estimatedTimeErr || hasVariantErrs || hasNoVariants) {
      setFormErrors({ name: nameErr, brandId: brandErr, categoryId: categoryErr, seriesId: seriesErr, productId: productErr, basePrice: basePriceErr, estimatedTime: estimatedTimeErr, variants: variantsErr });
      setVariantErrors(variantErrs);
      setTouched({ name: true, brandId: true, categoryId: true, seriesId: true, productId: true, basePrice: true, estimatedTime: true });
      scrollToFirstError();
      return;
    }

    // Resolve the levelId based on level
    const levelId = form.level === 'product' ? form.productId
      : form.level === 'series' ? form.seriesId
      : form.level === 'category' ? form.categoryId
      : form.brandId;

    setSaveError(null);
    setIsSaving(true);
    try {
      if (editing) {
        const updatePayload: Parameters<typeof updateService>[1] = {};

        if (form.name.trim() !== editing.name) updatePayload.name = form.name.trim();
        if (form.description.trim() !== (editing.description || '')) updatePayload.description = form.description.trim();
        if (form.isActive !== editing.isActive) updatePayload.isActive = form.isActive;

        // Level change requires both level and levelId
        if (form.level !== editing.level || levelId !== editing.levelId) {
          updatePayload.level = form.level;
          updatePayload.levelId = levelId;
        }

        if (!form.hasVariants) {
          if (form.basePrice !== editing.basePrice) updatePayload.basePrice = form.basePrice;
          if (form.estimatedTime !== editing.estimatedTime) updatePayload.estimatedTime = form.estimatedTime;
        }

        if (form.hasVariants) {
          const originalVariants = getVariants(editing.id);
          const changedVariants = variantItems.filter(vi => vi.id).filter(vi => {
            const original = originalVariants.find(ov => ov.id === vi.id);
            if (!original) return true;
            return vi.name.trim() !== original.name ||
              vi.description.trim() !== (original.description || '') ||
              vi.basePrice !== original.basePrice ||
              vi.estimatedTime !== original.estimatedTime;
          }).map(vi => ({
            id: vi.id!,
            name: vi.name.trim(),
            description: vi.description.trim(),
            basePrice: vi.basePrice,
            estimatedTime: vi.estimatedTime,
            isActive: true
          }));

          const newVariants = variantItems.filter(vi => !vi.id).map(vi => ({
            name: vi.name.trim(),
            description: vi.description.trim(),
            basePrice: vi.basePrice,
            estimatedTime: vi.estimatedTime,
            isActive: true
          }));

          if (changedVariants.length > 0) updatePayload.variants = changedVariants;
          if (newVariants.length > 0) updatePayload.newVariants = newVariants;
          if (removedVariantIds.length > 0) updatePayload.removeVariants = removedVariantIds;
        }

        // Only send request if there are actual changes
        if (Object.keys(updatePayload).length > 0) {
          await updateService(editing.id, updatePayload);
          toast({ title: 'Service updated successfully', variant: 'success' });
        } else {
          toast({ title: 'No changes detected', variant: 'default' });
        }
      } else {
        const createPayload: Parameters<typeof createService>[0] = {
          name: form.name.trim(),
          description: form.description.trim(),
          level: form.level,
          levelId,
          isActive: form.isActive,
        };
        if (form.hasVariants && variantItems.length > 0) {
          createPayload.variants = variantItems
            .filter(vi => vi.name.trim())
            .map(vi => ({ name: vi.name.trim(), description: vi.description.trim(), basePrice: vi.basePrice, estimatedTime: vi.estimatedTime }));
        } else {
          createPayload.basePrice = form.basePrice;
          createPayload.estimatedTime = form.estimatedTime;
        }
        await createService(createPayload);
        toast({ title: 'Service created successfully', variant: 'success' });
      }
      setIsFormOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save service';
      setSaveError(message);
      toast({ title: message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (deactivateTarget) {
      try {
        await updateServiceStatus(deactivateTarget.id, !deactivateTarget.isActive);
        toast({ title: `Service ${deactivateTarget.isActive ? 'deactivated' : 'activated'} successfully`, variant: 'success' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update service status';
        toast({ title: message, variant: 'destructive' });
      }
      setDeactivateTarget(null);
    }
  };



  // By Product: filtered products list
  const byProductFilteredCategories = byProductBrand !== 'all' ? categories.filter(c => c.brandId === byProductBrand) : categories;
  const byProductFilteredSeries = byProductCategory !== 'all' ? seriesList.filter(s => s.categoryId === byProductCategory) : (byProductBrand !== 'all' ? seriesList.filter(s => {
    const category = categories.find(c => c.id === s.categoryId);
    return category?.brandId === byProductBrand;
  }) : seriesList);

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

  const selectByProduct = async (productId: string, silent = false) => {
    setByProductSelected(productId);
    if (!silent) {
      setByProductCollapsedParents(new Set());
      setOverrideEdits({});
      setIsLoadingProductServices(true);
    }
    try {
      const servicesData = await productServiceService.getServicesForProduct(productId);
      setProductServices(servicesData);
    } catch (error) {
      console.error('Failed to fetch product services:', error);
      toast({ 
        title: 'Failed to fetch services', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
      setProductServices(null);
    } finally {
      if (!silent) setIsLoadingProductServices(false);
    }
  };

  const selectByService = async (serviceId: string, silent = false) => {
    setByServiceSelected(serviceId);
    if (!silent) {
      setByServiceCollapsedVariants(new Set());
      setOverrideEdits({});
      setIsLoadingServiceProducts(true);
    }
    
    try {
      const productsData = await productServiceService.getProductsForService(serviceId);
      setServiceProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch service products:', error);
      toast({ 
        title: 'Failed to fetch products', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      if (!silent) setIsLoadingServiceProducts(false);
    }
  };

  const toggleServiceForProduct = async (productServiceId: string, isActive: boolean) => {
    try {
      await productServiceService.updateProductServiceStatus(productServiceId, isActive);
      if (mainTab === 'by-product' && byProductSelected) {
        selectByProduct(byProductSelected, true);
      } else if (mainTab === 'by-service' && byServiceSelected) {
        selectByService(byServiceSelected, true);
      }
      toast({ title: 'Status updated successfully', variant: 'success' });
    } catch (error) {
      console.error('Failed to update product service status:', error);
      toast({ 
        title: 'Failed to update status', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    }
  };

  const saveOverride = async (productServiceId: string, editKey: string) => {
    const edit = overrideEdits[editKey];
    if (!edit) return;
    
    try {
      await productServiceService.updateProductService(productServiceId, {
       price: Number(edit.price),
      estimatedTime: Number(edit.time)
      });
      if (mainTab === 'by-product' && byProductSelected) {
        selectByProduct(byProductSelected, true);
      } else if (mainTab === 'by-service' && byServiceSelected) {
        selectByService(byServiceSelected, true);
      }
      setOverrideEdits(prev => {
        const next = { ...prev };
        delete next[editKey];
        return next;
      });
      toast({ title: 'Override saved successfully', variant: 'success' });
    } catch (error) {
      console.error('Failed to save override:', error);
      toast({ 
        title: 'Failed to save override', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    }
  };

  const resetOverride = async (productServiceId: string, editKey: string) => {
    try {
      await productServiceService.resetToDefault(productServiceId);
      if (mainTab === 'by-product' && byProductSelected) {
        selectByProduct(byProductSelected, true);
      } else if (mainTab === 'by-service' && byServiceSelected) {
        selectByService(byServiceSelected, true);
      }
      setOverrideEdits(prev => {
        const next = { ...prev };
        delete next[editKey];
        return next;
      });
      toast({ title: 'Override reset to default', variant: 'success' });
    } catch (error) {
      console.error('Failed to reset override:', error);
      toast({ 
        title: 'Failed to reset override', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    }
  };

  const OverrideRow = ({ 
    productServiceId, 
    productId, 
    defaultPrice, 
    defaultTime, 
    editKey, 
    label, 
    sublabel, 
    disabled: isDisabledProp,
    isDefault
  }: {
    productServiceId: string; 
    productId: string; 
    defaultPrice: number; 
    defaultTime: number;
    editKey: string; 
    label: string; 
    sublabel: string; 
    disabled: boolean;
    isDefault: boolean;
  }) => {
    const edit = overrideEdits[editKey];
    const [localPrice, setLocalPrice] = useState(edit?.price ?? String(defaultPrice));
    const [localTime, setLocalTime] = useState(edit?.time ?? String(defaultTime));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Update local state when edit changes
    useEffect(() => {
      if (edit) {
        setLocalPrice(edit.price);
        setLocalTime(edit.time);
      } else {
        setLocalPrice(String(defaultPrice));
        setLocalTime(String(defaultTime));
      }
    }, [edit, defaultPrice, defaultTime]);

    const handlePriceBlur = () => {
      const priceChanged = localPrice !== (edit?.price ?? String(defaultPrice));
      if (priceChanged) {
        setOverrideEdits(prev => ({ 
          ...prev, 
          [editKey]: { price: localPrice, time: prev[editKey]?.time ?? String(defaultTime) } 
        }));
      }
    };

    const handleTimeBlur = () => {
      const timeChanged = localTime !== (edit?.time ?? String(defaultTime));
      if (timeChanged) {
        setOverrideEdits(prev => ({ 
          ...prev, 
          [editKey]: { price: prev[editKey]?.price ?? String(defaultPrice), time: localTime } 
        }));
      }
    };

    const handleSave = async () => {
      setIsSubmitting(true);
      try {
        await saveOverride(productServiceId, editKey);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleReset = async () => {
      setIsResetting(true);
      try {
        await resetOverride(productServiceId, editKey);
      } finally {
        setIsResetting(false);
      }
    };

    return (
      <div className={`rounded-lg border border-border p-3 space-y-2 ${isDisabledProp ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          </div>
          <Switch checked={!isDisabledProp} onCheckedChange={(checked) => toggleServiceForProduct(productServiceId, checked)} />
        </div>
        {!isDisabledProp && (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Price ($)</Label>
              <Input type="number" min={0} step={0.01} placeholder={String(defaultPrice)}
                value={localPrice}
                onChange={e => setLocalPrice(e.target.value)}
                onBlur={handlePriceBlur} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Time (min)</Label>
              <Input type="number" min={1} placeholder={String(defaultTime)}
                value={localTime}
                onChange={e => setLocalTime(e.target.value)}
                onBlur={handleTimeBlur} />
            </div>
            <div className="flex gap-1">
              {!isDefault && (
                <Button size="sm" variant="outline" className="h-9 w-9 p-0" title="Reset to default" onClick={handleReset} disabled={isResetting || isSubmitting}>
                  {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                </Button>
              )}
              <Button size="sm" variant="secondary" disabled={!edit || isSubmitting || isResetting} onClick={handleSave}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
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
                  {brands.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No brands found</div>}
                  {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stagedFilters.category} onValueChange={v => setStagedFilters(f => ({ ...f, category: v, series: "all", product: "all" }))} disabled={stagedFilters.brand === "all" || stagedFilters.level === "brand"}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {stagedCategories.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No categories found</div>}
                  {stagedCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stagedFilters.series} onValueChange={v => setStagedFilters(f => ({ ...f, series: v, product: "all" }))} disabled={stagedFilters.category === "all" || ['brand', 'category'].includes(stagedFilters.level)}>
                <SelectTrigger><SelectValue placeholder="Series" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {stagedSeries.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No series found</div>}
                  {stagedSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stagedFilters.product} onValueChange={v => setStagedFilters(f => ({ ...f, product: v }))} disabled={stagedFilters.series === "all" || ['brand', 'category', 'series'].includes(stagedFilters.level)}>
                <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {stagedProducts.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No products found</div>}
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
            {initialLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Level</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigned To</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Base Price</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Est. Time</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Variants</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Linked Products</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Active</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-0">
                        <EmptyState
                          title="No services found"
                          description={filtered.length === 0 && services.length > 0 ? 'Try adjusting your filters.' : 'Click "Add Service" to create one.'}
                          actionLabel="Add Service"
                          onAction={openAdd}
                        />
                      </td>
                    </tr>
                  )}
                  {paginated.map(s => {
                    const variants = getVariants(s.id);
                    const isExpanded = expandedParents.has(s.id);
                    const variantCount = variants.length;
                    return (
                      <>
                        <tr key={s.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${variantCount > 0 ? 'cursor-pointer' : ''}`} onClick={() => variantCount > 0 && toggleExpanded(s.id)}>
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
                          <td className="py-3 px-4">{s.assignedTo}</td>
                          <td className="py-3 px-4">{variantCount > 0 ? '—' : `$${s.basePrice}`}</td>
                          <td className="py-3 px-4">{variantCount > 0 ? '—' : `${s.estimatedTime} min`}</td>
                          <td className="py-3 px-4">{variantCount || '—'}</td>
                          <td className="py-3 px-4">{s.linkedProductsCount}</td>
                          <td className="py-3 px-4">
                            <Badge variant={s.isActive ? 'default' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                          </td>
                          <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                            <Switch checked={s.isActive} onCheckedChange={() => setDeactivateTarget(s)} />
                          </td>
                          <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {/* Variant rows */}
                        {isExpanded && variants.map(v => (
                          <tr key={v.id} className="border-b border-border/50 bg-muted/10 hover:bg-muted/20 transition-colors">
                            <td className="py-2 px-4 pl-12 font-medium text-foreground text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">└</span>
                                {v.name}
                                <Badge variant="outline" className="text-xs">Variant</Badge>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate text-sm">{v.description}</td>
                            <td className="py-2 px-4"><Badge variant="outline" className="capitalize text-xs">{v.level}</Badge></td>
                            <td className="py-2 px-4 text-sm">{v.assignedTo}</td>
                            <td className="py-2 px-4 text-sm">${v.basePrice}</td>
                            <td className="py-2 px-4 hidden md:table-cell text-sm">{v.estimatedTime} min</td>
                            <td className="py-2 px-4 hidden xl:table-cell text-sm">—</td>
                            <td className="py-2 px-4 hidden xl:table-cell text-sm">{v.linkedProductsCount}</td>
                            <td className="py-2 px-4">
                              <Badge variant={v.isActive ? 'default' : 'secondary'} className="text-xs">{v.isActive ? 'Active' : 'Inactive'}</Badge>
                            </td>
                            <td className="py-2 px-4" onClick={e => e.stopPropagation()}>
                              <Switch checked={v.isActive} onCheckedChange={() => {
                                updateServiceStatus(v.id, !v.isActive).catch((error) => {
                                  const message = error instanceof Error ? error.message : 'Failed to update variant status';
                                  toast({ title: message, variant: 'destructive' });
                                });
                              }} />
                            </td>
                            <td className="py-2 px-4 text-right cursor-default" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-40 pointer-events-none" disabled>
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
            )}
            <TablePagination totalItems={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
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
                  // Count active services for this product (from API data)
                  const apiServices = productServices?.services || [];
                  const svcCount = apiServices.filter(s => s.isActive).length;
                  const totalSvcCount = apiServices.length;
                  const disabledCount = totalSvcCount - svcCount;

                  return (
                    <div key={p.id} className={`flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${byProductSelected === p.id ? 'bg-primary/10' : 'hover:bg-muted/30'}`} onClick={() => selectByProduct(p.id)}>
                      <img src={p.iconImage || ''} alt={p.name} className="h-8 w-8 rounded object-cover bg-muted" onError={(e) => { e.currentTarget.src = ''; e.currentTarget.className = 'h-8 w-8 rounded object-cover bg-muted border border-border'; }} />
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
                
                if (isLoadingProductServices) {
                  return (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Loading services...</p>
                    </div>
                  );
                }
                
                if (!productServices || productServices.services.length === 0) {
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
                      <p className="text-sm text-muted-foreground py-4">No active services are assigned to this product.</p>
                    </div>
                  );
                }
                
                // Show API data with original UI structure
                return (
                  <div className="space-y-4">
                    <button className="lg:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={() => setByProductSelected('')}>← Back to products</button>
                    <div className="flex items-center gap-3">
                      <img src={p.iconImage || ''} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-muted" onError={(e) => { e.currentTarget.src = ''; e.currentTarget.className = 'h-10 w-10 rounded-lg object-cover bg-muted border border-border'; }} />
                      <div>
                        <h3 className="font-semibold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{brandName(p.brandId)} · {categoryName(p.categoryId)} · {seriesName(p.seriesId)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Override price and estimated time for services inherited by this product.</p>
                    <div className="space-y-3">
                      {productServices.services.map((svc: any) => {
                        if (svc.isParent) {
                          // Parent service with variants
                          const isExpanded = !byProductCollapsedParents.has(svc.id);
                          return (
                            <div key={svc.id}>
                              <div 
                                className="mb-2 cursor-pointer" 
                                onClick={() => toggleByProductExpanded(svc.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    {svc.name}
                                    <Badge variant="secondary" className="text-xs">{svc.variants?.length || 0} variants</Badge>
                                  </h4>
                                </div>
                                {isExpanded && svc.description && (
                                  <p className="text-xs text-muted-foreground ml-6 mt-1">{svc.description}</p>
                                )}
                              </div>
                              {isExpanded && svc.variants && svc.variants.length > 0 && (
                                <div className="ml-4 border-l-2 border-border pl-3 space-y-2">
                                  {svc.variants.map((variant: any) => (
                                    <OverrideRow
                                      key={variant.id}
                                      productServiceId={variant.id}
                                      productId={p.id}
                                      editKey={variant.id}
                                      defaultPrice={variant.price}
                                      defaultTime={variant.estimatedTime}
                                      label={variant.name}
                                      sublabel={`${svc.level} service variant`}
                                      disabled={!variant.isActive}
                                      isDefault={variant.isDefault}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <OverrideRow
                              key={svc.id}
                              productServiceId={svc.id}
                              productId={p.id}
                              editKey={svc.id}
                              defaultPrice={svc.price || svc.basePrice}
                              defaultTime={svc.estimatedTime || svc.baseEstimatedTime}
                              label={svc.name}
                              sublabel={`${svc.level} service`}
                              disabled={!svc.isActive}
                              isDefault={svc.isDefault}
                            />
                          );
                        }
                      })}
                    </div>
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
                  const variants = getVariants(s.id);
                  return (
                    <div key={s.id} className={`p-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${byServiceSelected === s.id ? 'bg-primary/10' : 'hover:bg-muted/30'}`} onClick={() => selectByService(s.id)}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{s.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-[6px]">
                            <Badge variant="outline" className="capitalize text-xs mr-1">{s.level}</Badge>
                            {s.assignedTo}
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
                if (isLoadingServiceProducts) {
                  return (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading products...</span>
                    </div>
                  );
                }

                const svc = services.find(s => s.id === byServiceSelected);
                if (!svc) return null;
                const variants = getVariants(svc.id);
                const hasVars = variants.length > 0;
                
                const productsList = serviceProducts?.products || [];
                
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
                        {svc.assignedTo} {!hasVars && `· Default: $${svc.basePrice} · ${svc.estimatedTime} min`}
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
                                  <Badge variant="outline" className="text-xs">{productsList.length} products</Badge>
                                </div>
                              </div>
                              {isVariantExpanded && (
                                <div className="space-y-2 ml-6">
                                  {productsList.map(p => (
                                    <OverrideRow
                                      key={p.product?.id || p.id}
                                      productServiceId={p.productServiceId}
                                      productId={p.product?.id || p.id}
                                      editKey={p.productServiceId}
                                      defaultPrice={variant.basePrice}
                                      defaultTime={variant.estimatedTime}
                                      label={p.product?.name || p.name}
                                      sublabel={`${variant.name} variant`}
                                      disabled={!p.isActive}
                                      isDefault={p.isDefault}
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
                        {productsList.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4">No products linked to this service.</p>
                        ) : (
                          <div className="space-y-2">
                            {productsList.map(p => (
                              <OverrideRow
                                key={p.product?.id || p.id}
                                productServiceId={p.productServiceId}
                                productId={p.product?.id || p.id}
                                editKey={p.productServiceId}
                                defaultPrice={p.price || svc.basePrice}
                                defaultTime={p.estimatedTime || svc.estimatedTime}
                                label={p.product?.name || p.name}
                                sublabel={`${svc.level} service`}
                                disabled={!p.isActive}
                                isDefault={p.isDefault}
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



      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="flex flex-col max-w-xl max-h-[90vh]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle></DialogHeader>
          <div ref={formRef} className="space-y-4 overflow-y-auto overflow-x-hidden w-full flex-1 scrollbar-hide min-w-0">
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
                  disabled={initialLoading || isSaving}
                />
                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" disabled={initialLoading || isSaving} />
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
                }} disabled={initialLoading || isSaving} />
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
                      disabled={initialLoading || isSaving}
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
                      disabled={initialLoading || isSaving}
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
                    <Button type="button" size="sm" variant="outline" onClick={addVariantItem} className="gap-1" disabled={initialLoading || isSaving}>
                      <Plus className="h-3 w-3" /> Add Variant
                    </Button>
                  </div>
                  {variantItems.length === 0 && (
                    <p className={`text-sm text-center py-2 ${formErrors.variants ? 'text-destructive font-medium' : 'text-muted-foreground'}`} data-error={!!formErrors.variants}>
                      {formErrors.variants || 'No variants added. Click "Add Variant" to begin.'}
                    </p>
                  )}
                  {variantItems.map((vi, index) => (
                    <div key={index} className="rounded-lg border border-border bg-card p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Variant {index + 1}</span>
                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeVariantItem(index)} disabled={initialLoading || isSaving}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Variant name (e.g. Original Screen)"
                          value={vi.name}
                          onChange={e => {
                            updateVariantItem(index, 'name', e.target.value);
                            if (variantErrors[index]?.name)
                              setVariantErrors(prev => ({ ...prev, [index]: { ...prev[index], name: undefined } }));
                          }}
                          disabled={initialLoading || isSaving}
                        />
                        {variantErrors[index]?.name && <p className="text-xs text-destructive">{variantErrors[index].name}</p>}
                        <Input placeholder="Description (optional)" value={vi.description} onChange={e => updateVariantItem(index, 'description', e.target.value)} disabled={initialLoading || isSaving} />
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
                              if (variantErrors[index]?.basePrice)
                                setVariantErrors(prev => ({ ...prev, [index]: { ...prev[index], basePrice: undefined } }));
                            }}
                            disabled={initialLoading || isSaving}
                          />
                          {variantErrors[index]?.basePrice && <p className="text-xs text-destructive">{variantErrors[index].basePrice}</p>}
                        </div>
                        <div className="space-y-1" data-error={!!formErrors.estimatedTime}>
                          <Label className="text-xs">Est. Time (min)</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="30"
                            value={vi.estimatedTime === 0 ? '' : vi.estimatedTime}
                            onChange={e => {
                              const raw = e.target.value.replace(/[^0-9.]/g, '');
                              updateVariantItem(index, 'estimatedTime', raw === '' ? 0 : Number(raw));
                              if (variantErrors[index]?.estimatedTime)
                                setVariantErrors(prev => ({ ...prev, [index]: { ...prev[index], estimatedTime: undefined } }));
                            }}
                          />
                          {variantErrors[index]?.estimatedTime && <p className="text-xs text-destructive">{variantErrors[index].estimatedTime}</p>}
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
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    {brands.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No brands found</div>}
                  </SelectContent>
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
                    <SelectContent>
                      {formCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      {formCategories.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No categories found</div>}
                    </SelectContent>
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
                    <SelectContent>
                      {formSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      {formSeries.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No series found</div>}
                    </SelectContent>
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
                    <SelectContent>
                      {formProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      {formProducts.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No products found</div>}
                    </SelectContent>
                  </Select>
                  {formErrors.productId && <p className="text-xs text-destructive">{formErrors.productId}</p>}
                </div>
              )}
              {form.brandId && (
                <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  This service will apply to <strong className="text-foreground">
                    {form.level === 'product' ? (form.productId ? 1 : 0) :
                      form.level === 'series' ? (form.seriesId ? products.filter(p => p.seriesId === form.seriesId).length : 0) :
                        form.level === 'category' ? (form.categoryId ? products.filter(p => p.categoryId === form.categoryId).length : 0) :
                          (form.brandId ? products.filter(p => p.brandId === form.brandId).length : 0)}
                  </strong> product(s).
                  {form.hasVariants && variantItems.filter(v => v.name.trim()).length > 0 && (
                    <> Each product will get <strong className="text-foreground">{variantItems.filter(v => v.name.trim()).length}</strong> variant(s).</>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            {saveError && <p className="text-xs text-destructive text-right">{saveError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handleClose} disabled={isSaving}>Cancel</Button>
              <Button onClick={save} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
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
