import { useState, useMemo } from 'react';
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
import { Plus, Pencil, Search, ChevronUp, ChevronDown, Power, RotateCcw, Wrench, Package } from 'lucide-react';
import TablePagination from '@/components/TablePagination';

const LEVELS: AssignmentLevel[] = ['brand', 'category', 'series', 'product'];

type SortField = 'name' | 'level' | 'createdAt';
type SortDir = 'asc' | 'desc';

const ServicesPage = () => {
  const { services, createService, updateService, getOverridesByService, getOverridesByProduct, upsertOverride, deleteOverride, overrides, toggleServiceForProduct } = useServices();
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
    level: "all",
    status: "all",
    brand: "all",
    category: "all",
    series: "all",
    product: "all",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    level: "all",
    status: "all",
    brand: "all",
    category: "all",
    series: "all",
    product: "all",
  });

  // Table state
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [detailView, setDetailView] = useState<ServiceRecord | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ServiceRecord | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '', description: '', level: 'brand' as AssignmentLevel,
    brandId: '', categoryId: '', seriesId: '', productId: '',
    basePrice: 0, estimatedTime: 30, isActive: true,
  });

  // Override editing state (shared across tabs)
  const [overrideEdits, setOverrideEdits] = useState<Record<string, { price: number; time: number }>>({});

  // By Product tab state
  const [byProductSelected, setByProductSelected] = useState<string>('');
  const [byProductBrand, setByProductBrand] = useState<string>('all');
  const [byProductCategory, setByProductCategory] = useState<string>('all');
  const [byProductSeries, setByProductSeries] = useState<string>('all');
  const [byProductSearch, setByProductSearch] = useState('');

  // By Service tab state
  const [byServiceSelected, setByServiceSelected] = useState<string>('');
  const [byServiceSearch, setByServiceSearch] = useState('');

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
    return services.filter(s => {
      if (!s.isActive) return false;
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

  // Dynamic filter options
  const stagedCategories =
    stagedFilters.brand !== "all"
      ? categories.filter((c) => c.brandId === stagedFilters.brand)
      : categories;
  const stagedSeries =
    stagedFilters.category !== "all"
      ? seriesList.filter((s) => s.categoryId === stagedFilters.category)
      : [];
  const stagedProducts =
    stagedFilters.series !== "all"
      ? products.filter((p) => p.seriesId === stagedFilters.series)
      : [];

  const hasChanges =
    JSON.stringify(stagedFilters) !== JSON.stringify(appliedFilters) ||
    searchInput !== search;
  const hasApplied = Object.values(appliedFilters).some((v) => v !== "all") || search !== "";

  // Form hierarchy options
  const formCategories = form.brandId ? categories.filter(c => c.brandId === form.brandId) : [];
  const formSeries = form.categoryId ? seriesList.filter(s => s.categoryId === form.categoryId) : [];
  const formProducts = form.seriesId ? products.filter(p => p.seriesId === form.seriesId) : [];

  // Filter & sort for services list
  const filtered = useMemo(() => {
    let result = services;
    if (search)
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (appliedFilters.level !== "all")
      result = result.filter((s) => s.level === appliedFilters.level);
    if (appliedFilters.status !== "all")
      result = result.filter((s) =>
        appliedFilters.status === "active" ? s.isActive : !s.isActive,
      );
    if (appliedFilters.product !== "all") {
      const prod = products.find((p) => p.id === appliedFilters.product);
      result = result.filter(
        (s) =>
          s.productId === prod?.id ||
          s.seriesId === prod?.seriesId ||
          s.categoryId === prod?.categoryId ||
          (s.level === "brand" && s.brandId === prod?.brandId),
      );
    } else if (appliedFilters.series !== "all") {
      const ser = seriesList.find((s) => s.id === appliedFilters.series);
      const cat = ser ? categories.find((c) => c.id === ser.categoryId) : null;
      result = result.filter(
        (s) =>
          s.seriesId === ser?.id ||
          s.categoryId === ser?.categoryId ||
          (s.level === "brand" && s.brandId === cat?.brandId),
      );
    } else if (appliedFilters.category !== "all") {
      const cat = categories.find((c) => c.id === appliedFilters.category);
      result = result.filter(
        (s) =>
          s.categoryId === appliedFilters.category ||
          (s.level === "brand" && s.brandId === cat?.brandId),
      );
    } else if (appliedFilters.brand !== "all") {
      result = result.filter((s) => s.brandId === appliedFilters.brand);
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "level") cmp = a.level.localeCompare(b.level);
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [services, search, appliedFilters, sortField, sortDir]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  // Open form
  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', level: 'brand', brandId: '', categoryId: '', seriesId: '', productId: '', basePrice: 0, estimatedTime: 30, isActive: true });
    setIsFormOpen(true);
  };

  const openEdit = (s: ServiceRecord) => {
    setEditing(s);
    setForm({
      name: s.name, description: s.description, level: s.level,
      brandId: s.brandId, categoryId: s.categoryId || '', seriesId: s.seriesId || '', productId: s.productId || '',
      basePrice: s.basePrice, estimatedTime: s.estimatedTime, isActive: s.isActive,
    });
    setIsFormOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.brandId) return;
    if (form.level === 'category' && !form.categoryId) return;
    if (form.level === 'series' && (!form.categoryId || !form.seriesId)) return;
    if (form.level === 'product' && (!form.categoryId || !form.seriesId || !form.productId)) return;

    const payload: Omit<ServiceRecord, 'id' | 'createdAt'> = {
      name: form.name.trim(),
      description: form.description.trim(),
      level: form.level,
      brandId: form.brandId,
      categoryId: ['category', 'series', 'product'].includes(form.level) ? form.categoryId : undefined,
      seriesId: ['series', 'product'].includes(form.level) ? form.seriesId : undefined,
      productId: form.level === 'product' ? form.productId : undefined,
      basePrice: form.basePrice,
      estimatedTime: form.estimatedTime,
      isActive: form.isActive,
    };

    if (editing) updateService(editing.id, payload);
    else createService(payload);
    setIsFormOpen(false);
  };

  const handleDeactivate = () => {
    if (deactivateTarget) {
      updateService(deactivateTarget.id, { isActive: !deactivateTarget.isActive });
      setDeactivateTarget(null);
    }
  };

  // Open detail with overrides preloaded
  const openDetail = (s: ServiceRecord) => {
    setDetailView(s);
    const existingOverrides = getOverridesByService(s.id);
    const edits: Record<string, { price: number; time: number }> = {};
    existingOverrides.forEach(o => {
      edits[o.productId] = { price: o.priceOverride, time: o.estimatedTimeOverride };
    });
    setOverrideEdits(edits);
  };

  const saveOverride = (serviceId: string, productId: string, keyField: 'serviceId' | 'productId' = 'productId') => {
    const key = keyField === 'productId' ? productId : serviceId;
    const edit = overrideEdits[key];
    if (edit) {
      upsertOverride({ serviceId, productId, priceOverride: edit.price, estimatedTimeOverride: edit.time });
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

  // By Service: filtered services list
  const byServiceFilteredServices = useMemo(() => {
    let result = services.filter(s => s.level !== 'product');
    if (byServiceSearch) result = result.filter(s => s.name.toLowerCase().includes(byServiceSearch.toLowerCase()));
    return result;
  }, [services, byServiceSearch]);

  // Load overrides when selecting in By Product / By Service tabs
  const selectByProduct = (productId: string) => {
    setByProductSelected(productId);
    const existing = getOverridesByProduct(productId);
    const edits: Record<string, { price: number; time: number }> = {};
    existing.forEach(o => {
      edits[o.serviceId] = { price: o.priceOverride, time: o.estimatedTimeOverride };
    });
    setOverrideEdits(edits);
  };

  const selectByService = (serviceId: string) => {
    setByServiceSelected(serviceId);
    const existing = getOverridesByService(serviceId);
    const edits: Record<string, { price: number; time: number }> = {};
    existing.forEach(o => {
      edits[o.productId] = { price: o.priceOverride, time: o.estimatedTimeOverride };
    });
    setOverrideEdits(edits);
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
          <TabsTrigger value="services" className="gap-2">
            <Wrench className="h-4 w-4" /> Services List
          </TabsTrigger>
          <TabsTrigger value="by-product" className="gap-2">
            <Package className="h-4 w-4" /> By Product
          </TabsTrigger>
          <TabsTrigger value="by-service" className="gap-2">
            <Wrench className="h-4 w-4" /> By Service
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Services List ===== */}
        <TabsContent value="services" className="space-y-6 mt-6">
          {/* Filters */}
          <div className="space-y-3 p-4 rounded-lg bg-card border border-border">
            {/* Row 1: Search, Level, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={stagedFilters.level}
                onValueChange={(v) =>
                  setStagedFilters((f) => ({ ...f, level: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l} className="capitalize">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={stagedFilters.status}
                onValueChange={(v) =>
                  setStagedFilters((f) => ({ ...f, status: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Cascading Brand > Category > Series > Product + Apply/Clear */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select
                value={stagedFilters.brand}
                onValueChange={(v) =>
                  setStagedFilters((f) => ({
                    ...f,
                    brand: v,
                    category: "all",
                    series: "all",
                    product: "all",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={stagedFilters.category}
                onValueChange={(v) =>
                  setStagedFilters((f) => ({
                    ...f,
                    category: v,
                    series: "all",
                    product: "all",
                  }))
                }
                disabled={stagedFilters.brand === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {stagedCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={stagedFilters.series}
                onValueChange={(v) =>
                  setStagedFilters((f) => ({ ...f, series: v, product: "all" }))
                }
                disabled={stagedFilters.category === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {stagedSeries.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={stagedFilters.product}
                onValueChange={(v) =>
                  setStagedFilters((f) => ({ ...f, product: v }))
                }
                disabled={stagedFilters.series === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {stagedProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apply / Clear */}
            {(hasChanges || hasApplied) && (
              <div className="flex justify-end gap-2">
                {hasChanges && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setAppliedFilters({ ...stagedFilters });
                      setSearch(searchInput);
                      setPage(1);
                    }}
                  >
                    Apply
                  </Button>
                )}
                {hasApplied && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const cleared = {
                        level: "all",
                        status: "all",
                        brand: "all",
                        category: "all",
                        series: "all",
                        product: "all",
                      };
                      setStagedFilters(cleared);
                      setAppliedFilters(cleared);
                      setSearchInput("");
                      setSearch("");
                      setPage(1);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>
          {/* Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      <span className="inline-flex items-center gap-1">Service Name <SortIcon field="name" /></span>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort('level')}>
                      <span className="inline-flex items-center gap-1">Level <SortIcon field="level" /></span>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigned To</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Base Price</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Est. Time</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden xl:table-cell">Linked Products</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('createdAt')}>
                      <span className="inline-flex items-center gap-1">Created <SortIcon field="createdAt" /></span>
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr><td colSpan={10} className="py-12 text-center text-muted-foreground">No services found.</td></tr>
                  )}
                  {paginated.map(s => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => openDetail(s)}>
                      <td className="py-3 px-4 font-medium text-foreground">{s.name}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{s.description}</td>
                      <td className="py-3 px-4"><Badge variant="outline" className="capitalize">{s.level}</Badge></td>
                      <td className="py-3 px-4">{getAssignedTo(s)}</td>
                      <td className="py-3 px-4">${s.basePrice}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{s.estimatedTime} min</td>
                      <td className="py-3 px-4">
                        <Badge variant={s.isActive ? 'default' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="py-3 px-4 hidden xl:table-cell">{getLinkedProductCount(s)}</td>
                      <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">{s.createdAt}</td>
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
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination totalItems={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
          </div>
        </TabsContent>

        {/* ===== TAB 2: By Product ===== */}
        <TabsContent value="by-product" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Product selector panel */}
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

              <div className="rounded-lg border border-border bg-card overflow-hidden max-h-[500px] overflow-y-auto">
                {byProductFilteredProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">No products found.</p>
                )}
                {byProductFilteredProducts.map(p => {
                  const svcCount = getServicesForProduct(p.id).length;
                  const totalSvcCount = getServicesForProduct(p.id, true).length;
                  const disabledCount = totalSvcCount - svcCount;
                  const overrideCount = getOverridesByProduct(p.id).length;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${byProductSelected === p.id ? 'bg-primary/10' : 'hover:bg-muted/30'}`}
                      onClick={() => selectByProduct(p.id)}
                    >
                      <img src={p.iconImage} alt={p.name} className="h-8 w-8 rounded object-cover bg-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{svcCount} active{disabledCount > 0 && `, ${disabledCount} disabled`}{overrideCount > 0 && ` · ${overrideCount} override(s)`}</p>
                      </div>
                      {overrideCount > 0 && <Badge variant="outline" className="text-xs shrink-0">Customized</Badge>}
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
              const productServices = getServicesForProduct(p.id, true);
              const productOverrides = getOverridesByProduct(p.id);
              return (
                <div className="space-y-4">
                  <button
                    className="lg:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setByProductSelected('')}
                  >
                    ← Back to products
                  </button>
                    <div className="flex items-center gap-3">
                      <img src={p.iconImage} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-muted" />
                      <div>
                        <h3 className="font-semibold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{brandName(p.brandId)} · {categoryName(p.categoryId)} · {seriesName(p.seriesId)}</p>
                      </div>
                    </div>

                    {productServices.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No services are assigned to this product.</p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Override price and estimated time for services inherited by this product.
                        </p>
                        <div className="space-y-2">
                          {productServices.map(svc => {
                            const hasOverride = productOverrides.some(o => o.serviceId === svc.id);
                            const edit = overrideEdits[svc.id];
                            const isProductLevel = svc.level === 'product';
                            const disabled = isServiceDisabledForProduct(svc.id, p.id);
                            return (
                              <div key={svc.id} className={`rounded-lg border border-border p-3 space-y-2 ${disabled ? 'opacity-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm">{svc.name}</p>
                                        {hasOverride && !disabled && <Badge variant="outline" className="text-xs">Customized</Badge>}
                                        {isProductLevel && <Badge variant="secondary" className="text-xs">Direct</Badge>}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        <Badge variant="outline" className="capitalize text-xs mr-1">{svc.level}</Badge>
                                        Default: ${svc.basePrice} · {svc.estimatedTime} min
                                      </p>  
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Switch
                                      checked={!disabled}
                                      onCheckedChange={(checked) => toggleServiceForProduct(svc.id, p.id, !checked)}
                                    />
                                  </div>
                                </div>
                                {!disabled && (
                                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Price ($)</Label>
                                      <Input
                                        type="number" min={0} step={0.01}
                                        placeholder={String(svc.basePrice)}
                                        value={edit?.price ?? ''}
                                        onChange={e => setOverrideEdits(prev => ({
                                          ...prev,
                                          [svc.id]: { price: Number(e.target.value), time: prev[svc.id]?.time ?? svc.estimatedTime }
                                        }))}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Time (min)</Label>
                                      <Input
                                        type="number" min={1}
                                        placeholder={String(svc.estimatedTime)}
                                        value={edit?.time ?? ''}
                                        onChange={e => setOverrideEdits(prev => ({
                                          ...prev,
                                          [svc.id]: { price: prev[svc.id]?.price ?? svc.basePrice, time: Number(e.target.value) }
                                        }))}
                                      />
                                    </div>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="secondary" disabled={!edit}
                                        onClick={() => { upsertOverride({ serviceId: svc.id, productId: p.id, priceOverride: edit!.price, estimatedTimeOverride: edit!.time }); }}>
                                        Save
                                      </Button>
                                      {hasOverride && (
                                        <Button size="sm" variant="ghost" title="Reset to default"
                                          onClick={() => removeOverride(svc.id, p.id, 'serviceId')}>
                                          <RotateCcw className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
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
            {/* Service selector panel */}
              <div className={`space-y-4 ${byServiceSelected ? 'hidden lg:block' : 'block'}`}>
              <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Select a Service</h3>
                <p className="text-xs text-muted-foreground">Only Brand, Category, and Series level services are shown (product-level services don't need overrides).</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search services..." value={byServiceSearch} onChange={e => setByServiceSearch(e.target.value)} className="pl-9" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden max-h-[500px] overflow-y-auto">
                {byServiceFilteredServices.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">No services found.</p>
                )}
                {byServiceFilteredServices.map(s => {
                  const linkedCount = getLinkedProductCount(s);
                  const overrideCount = getOverridesByService(s.id).length;
                  return (
                    <div
                      key={s.id}
                      className={`p-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0 ${byServiceSelected === s.id ? 'bg-primary/10' : 'hover:bg-muted/30'}`}
                      onClick={() => selectByService(s.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            <Badge variant="outline" className="capitalize text-xs mr-1">{s.level}</Badge>
                            {getAssignedTo(s)} · {linkedCount} product(s)
                          </p>
                        </div>
                        {overrideCount > 0 && <Badge variant="outline" className="text-xs shrink-0">{overrideCount} override(s)</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Override editor for selected service */}
            <div className={`rounded-lg border border-border bg-card p-5 ${!byServiceSelected ? 'hidden lg:flex lg:flex-col lg:items-center lg:justify-center' : ''}`}>
              {!byServiceSelected ? (
                <>
                  <Wrench className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-center text-muted-foreground">Select a service to view and customize its product overrides.</p>
                </>
              ) : (() => {
                const svc = services.find(s => s.id === byServiceSelected);
                if (!svc) return null;
                const linkedProducts = getLinkedProducts(svc);
                const svcOverrides = getOverridesByService(svc.id);
                return (
                  <div className="space-y-4">
                    <button
                      className="lg:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setByServiceSelected('')}
                    >
                      ← Back to services
                    </button>
                    <div>
                      <h3 className="font-semibold text-foreground">{svc.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="capitalize text-xs mr-1">{svc.level}</Badge>
                        {getAssignedTo(svc)} · Default: ${svc.basePrice} · {svc.estimatedTime} min
                      </p>
                      {svc.description && <p className="text-sm text-muted-foreground mt-2">{svc.description}</p>}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Customize price and time for individual products. Products without overrides use defaults (${svc.basePrice}, {svc.estimatedTime} min).
                    </p>

                    {linkedProducts.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No products linked to this service.</p>
                    ) : (
                      <div className="space-y-2">
                        {linkedProducts.map(p => {
                          const hasOverride = svcOverrides.some(o => o.productId === p.id);
                          const edit = overrideEdits[p.id];
                          const disabled = isServiceDisabledForProduct(svc.id, p.id);
                          return (
                            <div key={p.id} className={`rounded-lg border border-border p-3 space-y-2 ${disabled ? 'opacity-50' : ''}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-sm">{p.name}</p>
                                      {disabled && <Badge variant="destructive" className="text-xs">Disabled</Badge>}
                                      {hasOverride && !disabled && <Badge variant="outline" className="text-xs">Customized</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{seriesName(p.seriesId)} · {categoryName(p.categoryId)}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                   <Switch
                                    checked={!disabled}
                                    onCheckedChange={(checked) => toggleServiceForProduct(svc.id, p.id, !checked)}
                                  />
                                </div>
                              </div>
                              {!disabled && (
                                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Price ($)</Label>
                                    <Input
                                      type="number" min={0} step={0.01}
                                      placeholder={String(svc.basePrice)}
                                      value={edit?.price ?? ''}
                                      onChange={e => setOverrideEdits(prev => ({
                                        ...prev,
                                        [p.id]: { price: Number(e.target.value), time: prev[p.id]?.time ?? svc.estimatedTime }
                                      }))}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Time (min)</Label>
                                    <Input
                                      type="number" min={1}
                                      placeholder={String(svc.estimatedTime)}
                                      value={edit?.time ?? ''}
                                      onChange={e => setOverrideEdits(prev => ({
                                        ...prev,
                                        [p.id]: { price: prev[p.id]?.price ?? svc.basePrice, time: Number(e.target.value) }
                                      }))}
                                    />
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="secondary" disabled={!edit}
                                      onClick={() => saveOverride(svc.id, p.id)}>
                                      Save
                                    </Button>
                                    {hasOverride && (
                                      <Button size="sm" variant="ghost" title="Reset to default"
                                        onClick={() => removeOverride(svc.id, p.id)}>
                                        <RotateCcw className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail View Dialog with Overrides */}
      <Dialog open={!!detailView} onOpenChange={() => setDetailView(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Service Detail</DialogTitle></DialogHeader>
          {detailView && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="overrides" className="flex-1">
                  Product Overrides ({getLinkedProducts(detailView).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground text-xs">Name</Label><p className="font-medium">{detailView.name}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Status</Label><p><Badge variant={detailView.isActive ? 'default' : 'secondary'}>{detailView.isActive ? 'Active' : 'Inactive'}</Badge></p></div>
                </div>
                <div><Label className="text-muted-foreground text-xs">Description</Label><p className="text-sm">{detailView.description || '—'}</p></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-muted-foreground text-xs">Level</Label><p className="capitalize">{detailView.level}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Assigned To</Label><p>{getAssignedTo(detailView)}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Linked Products</Label><p>{getLinkedProductCount(detailView)}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-muted-foreground text-xs">Base Price</Label><p>${detailView.basePrice}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Est. Time</Label><p>{detailView.estimatedTime} min</p></div>
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

              <TabsContent value="overrides" className="mt-4">
                {detailView.level === 'product' ? (
                  <p className="text-sm text-muted-foreground py-4">This service is already assigned at the product level. No overrides needed.</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Customize price and estimated time for individual products. Products without overrides use the default values (${detailView.basePrice}, {detailView.estimatedTime} min).
                    </p>
                    <div className="space-y-2">
                      {getLinkedProducts(detailView).map(p => {
                        const existingOverrides = getOverridesByService(detailView.id);
                        const hasOverride = existingOverrides.some(o => o.productId === p.id);
                        const edit = overrideEdits[p.id];
                        return (
                          <div key={p.id} className="rounded-lg border border-border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{seriesName(p.seriesId)} · {categoryName(p.categoryId)}</p>
                              </div>
                              {hasOverride && <Badge variant="outline" className="text-xs">Customized</Badge>}
                            </div>
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                              <div className="space-y-1">
                                <Label className="text-xs">Price ($)</Label>
                                <Input
                                  type="number" min={0} step={0.01}
                                  placeholder={String(detailView.basePrice)}
                                  value={edit?.price ?? ''}
                                  onChange={e => setOverrideEdits(prev => ({
                                    ...prev,
                                    [p.id]: { price: Number(e.target.value), time: prev[p.id]?.time ?? detailView.estimatedTime }
                                  }))}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Time (min)</Label>
                                <Input
                                  type="number" min={1}
                                  placeholder={String(detailView.estimatedTime)}
                                  value={edit?.time ?? ''}
                                  onChange={e => setOverrideEdits(prev => ({
                                    ...prev,
                                    [p.id]: { price: prev[p.id]?.price ?? detailView.basePrice, time: Number(e.target.value) }
                                  }))}
                                />
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="secondary" disabled={!edit}
                                  onClick={() => saveOverride(detailView.id, p.id)}>
                                  Save
                                </Button>
                                {hasOverride && (
                                  <Button size="sm" variant="ghost" title="Reset to default"
                                    onClick={() => removeOverride(detailView.id, p.id)}>
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailView(null)}>Close</Button>
            <Button onClick={() => { if (detailView) { openEdit(detailView); setDetailView(null); } }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Screen Repair" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Price ($) {form.level === 'product' && '*'}</Label>
                  <Input type="number" min={0} step={0.01} value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Est. Time (min) *</Label>
                  <Input type="number" min={1} value={form.estimatedTime} onChange={e => setForm(f => ({ ...f, estimatedTime: Math.max(1, Number(e.target.value)) }))} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{form.isActive ? 'Active' : 'Inactive'}</span>
                  <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-foreground">Service Assignment</h3>
              <div className="space-y-2">
                <Label>Level *</Label>
                <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v as AssignmentLevel, categoryId: '', seriesId: '', productId: '' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Brand *</Label>
                <Select value={form.brandId} onValueChange={v => setForm(f => ({ ...f, brandId: v, categoryId: '', seriesId: '', productId: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {['category', 'series', 'product'].includes(form.level) && (
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v, seriesId: '', productId: '' }))} disabled={!form.brandId}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{formCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {['series', 'product'].includes(form.level) && (
                <div className="space-y-2">
                  <Label>Series *</Label>
                  <Select value={form.seriesId} onValueChange={v => setForm(f => ({ ...f, seriesId: v, productId: '' }))} disabled={!form.categoryId}>
                    <SelectTrigger><SelectValue placeholder="Select series" /></SelectTrigger>
                    <SelectContent>{formSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {form.level === 'product' && (
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select value={form.productId} onValueChange={v => setForm(f => ({ ...f, productId: v }))} disabled={!form.seriesId}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{formProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
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
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
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
                ? `Deactivate "${deactivateTarget?.name}"? It will no longer appear as available.`
                : `Activate "${deactivateTarget?.name}"?`}
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
