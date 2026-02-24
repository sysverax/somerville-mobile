import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useSeriesData } from '@/hooks/useSeries';
import { useServices } from '@/hooks/useServices';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Wrench, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import ImageUpload from '@/components/ImageUpload';
import TablePagination from '@/components/TablePagination';

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

const validateName = (value: string): string | undefined => {
  if (!value.trim()) return 'Product name is required';
  return undefined;
};

const validateImage = (value: string | null): string | undefined => {
  if (!value) return 'Product image is required';
  return undefined;
};

type FormErrors = { brandId?: string; categoryId?: string; seriesId?: string; name?: string; iconImage?: string };

const ProductsPage = () => {
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { seriesList } = useSeriesData();
  const { products, create, update, remove, toggleActive } = useProducts();
  const { services, getOverridesByProduct, upsertOverride, hasVariants, overrides, toggleServiceForProduct } = useServices();

  const [view, setView] = useState<ViewMode>('table');
  const [filters, setFilters] = useState({ brandId: 'all', categoryId: 'all', seriesId: 'all' });
  const [applied, setApplied] = useState({ brandId: 'all', categoryId: 'all', seriesId: 'all' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({ seriesId: '', categoryId: '', brandId: '', name: '', description: '', specifications: {} as Record<string, string>, iconImage: null as string | null, galleryImages: [] as string[] });
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ brandId?: boolean; categoryId?: boolean; seriesId?: boolean; name?: boolean; iconImage?: boolean }>({});

  // Service overrides dialog
  const [serviceProduct, setServiceProduct] = useState<Product | null>(null);
  const [overrideEdits, setOverrideEdits] = useState<Record<string, { price: number | string; time: number | string }>>({});
  const [popupCollapsedParents, setPopupCollapsedParents] = useState<Set<string>>(new Set());

  const filteredCats = filters.brandId !== 'all' ? categories.filter(c => c.brandId === filters.brandId) : categories;
  const filteredSeries = filters.categoryId !== 'all' ? seriesList.filter(s => s.categoryId === filters.categoryId) : seriesList;
  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);
  const filtered = products.filter(p => (applied.brandId === 'all' || p.brandId === applied.brandId) && (applied.categoryId === 'all' || p.categoryId === applied.categoryId) && (applied.seriesId === 'all' || p.seriesId === applied.seriesId));

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => { setEditing(null); setForm({ seriesId: '', categoryId: '', brandId: '', name: '', description: '', specifications: {}, iconImage: null, galleryImages: [] }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ seriesId: p.seriesId, categoryId: p.categoryId, brandId: p.brandId, name: p.name, description: p.description, specifications: { ...p.specifications }, iconImage: p.iconImage, galleryImages: [...p.galleryImages] }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };

  const handleClose = () => { setIsFormOpen(false); setFormErrors({}); setTouched({}); };

  const handleSave = () => {
    const brandErr = validateBrand(form.brandId);
    const categoryErr = validateCategory(form.categoryId);
    const seriesErr = validateSeries(form.seriesId);
    const nameErr = validateName(form.name);
    const imageErr = validateImage(form.iconImage);
    if (brandErr || categoryErr || seriesErr || nameErr || imageErr) {
      setFormErrors({ brandId: brandErr, categoryId: categoryErr, seriesId: seriesErr, name: nameErr, iconImage: imageErr });
      setTouched({ brandId: true, categoryId: true, seriesId: true, name: true, iconImage: true });
      return;
    }
    if (editing) update(editing.id, form); else create(form);
    setIsFormOpen(false);
  };
  const addSpec = () => { if (specKey.trim() && specVal.trim()) { setForm(f => ({ ...f, specifications: { ...f.specifications, [specKey]: specVal } })); setSpecKey(''); setSpecVal(''); } };

  // Get all services that apply to a product (inherited from brand/category/series/product levels)
  const getServicesForProduct = (p: Product, includeDisabled = false) => {
    return services.filter(s => {
      if (!s.isActive) return false;
      if (!s.isVariant && hasVariants(s.id)) return false;
      switch (s.level) {
        case 'brand': {
          if (s.brandId !== p.brandId) return false;
          break;
        }
        case 'category': {
          if (s.categoryId !== p.categoryId) return false;
          break;
        }
        case 'series': {
          if (s.seriesId !== p.seriesId) return false;
          break;
        }
        case 'product': {
          if (s.productId !== p.id) return false;
          break;
        }
        default: return false;
      }
      if (!includeDisabled) {
        const override = overrides.find(o => o.serviceId === s.id && o.productId === p.id);
        if (override?.isDisabled) return false;
      }
      return true;
    });
  };

  const isServiceDisabledForProduct = (serviceId: string, productId: string): boolean => {
    const override = overrides.find(o => o.serviceId === serviceId && o.productId === productId);
    return override?.isDisabled === true;
  };

  const groupServicesForProduct = (productId: string) => {
    const product = products.find(pr => pr.id === productId);
    if (!product) return [] as { parent: typeof services[number] | null; items: typeof services }[];

    const allSvcs = getServicesForProduct(product, true);
    const groups: { parent: typeof services[number] | null; items: typeof services }[] = [];
    const variantsByParent = new Map<string, typeof services>();
    const standalone: typeof services = [];

    allSvcs.forEach(s => {
      if (s.isVariant && s.parentServiceId) {
        const existing = variantsByParent.get(s.parentServiceId) || [];
        variantsByParent.set(s.parentServiceId, [...existing, s]);
      } else {
        standalone.push(s);
      }
    });

    variantsByParent.forEach((variants, parentId) => {
      const parent = services.find(s => s.id === parentId) || null;
      groups.push({ parent, items: variants });
    });

    standalone.forEach(s => {
      groups.push({ parent: null, items: [s] });
    });

    return groups;
  };

  const openServiceOverrides = (p: Product) => {
    setServiceProduct(p);
    setPopupCollapsedParents(new Set());
    const existing = getOverridesByProduct(p.id);
    const edits: Record<string, { price: number; time: number }> = {};
    existing.forEach(o => {
      edits[o.serviceId] = { price: o.price, time: o.estimatedTime };
    });
    setOverrideEdits(edits);
  };

  const saveServiceOverride = (serviceId: string, productId: string) => {
    const edit = overrideEdits[serviceId];
    if (edit) {
      upsertOverride({ serviceId, productId, price: Number(edit.price), estimatedTime: Number(edit.time) });
    }
  };

  const togglePopupParentExpanded = (parentId: string) => {
    setPopupCollapsedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

  const brandName = (id: string) => brands.find(b => b.id === id)?.name || id;
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const seriesName = (id: string) => seriesList.find(s => s.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1"><Label className="text-xs">Brand</Label>
          <Select value={filters.brandId} onValueChange={v => setFilters(f => ({ ...f, brandId: v, categoryId: 'all', seriesId: 'all' }))}><SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All Brands</SelectItem>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <Select value={filters.categoryId} onValueChange={v => setFilters(f => ({ ...f, categoryId: v, seriesId: 'all' }))}><SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{filteredCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Series</Label>
          <Select value={filters.seriesId} onValueChange={v => setFilters(f => ({ ...f, seriesId: v }))}><SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All Series</SelectItem>{filteredSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
        {hasChanges && <Button onClick={() => { setApplied({ ...filters }); setPage(1); }}>Apply</Button>}
        {(applied.brandId !== 'all' || applied.categoryId !== 'all' || applied.seriesId !== 'all') && (
          <Button variant="outline" onClick={() => { const empty = { brandId: 'all', categoryId: 'all', seriesId: 'all' }; setFilters(empty); setApplied(empty); setPage(1); }}>Clear</Button>
        )}
        <ViewToggle view={view} onChange={setView} />
        <div className="ml-auto"><Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button></div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products found. {filtered.length === 0 && products.length > 0 ? 'Try adjusting your filters.' : 'Click "Add Product" to create one.'}</p>
            </div>
          ) : paginated.map(p => {
            const productServices = getServicesForProduct(p);
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={p.iconImage} alt={p.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                  <div className="flex-1 min-w-0"><h3 className="font-semibold truncate">{p.name}</h3><p className="text-xs text-muted-foreground truncate">{p.description}</p></div>
                  <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                {Object.keys(p.specifications).length > 0 && (
                  <div className="flex flex-wrap gap-1">{Object.entries(p.specifications).map(([k, v]) => <Badge key={k} variant="outline" className="text-xs">{k}: {v}</Badge>)}</div>
                )}
                {productServices.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <Wrench className="h-3 w-3 inline mr-1" />
                    {productServices.length} service(s) available
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2"><Label className="text-xs">Active</Label><Switch checked={p.isActive} onCheckedChange={() => toggleActive(p.id)} /></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openServiceOverrides(p)} title="Manage service overrides"><Wrench className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(p)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Icon</TableHead>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Series</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Services</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No products found. {filtered.length === 0 && products.length > 0 ? 'Try adjusting your filters.' : 'Click "Add Product" to create one.'}
                  </TableCell>
                </TableRow>
              ) : paginated.map(p => {
                const productServices = getServicesForProduct(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell><img src={p.iconImage} alt={p.name} className="h-8 w-8 rounded-md object-cover bg-muted" /></TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{seriesName(p.seriesId)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{categoryName(p.categoryId)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{productServices.length} service(s)</TableCell>
                    <TableCell><Badge variant={p.isActive ? 'default' : 'secondary'} className="text-xs">{p.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell><Switch checked={p.isActive} onCheckedChange={() => toggleActive(p.id)} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openServiceOverrides(p)} title="Service overrides"><Wrench className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(p)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination totalItems={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />

      {/* Add/Edit Product Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent className="flex flex-col max-h-[90vh]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
            {/* Brand / Category / Series */}
            <div className="grid grid-cols-3 gap-2 mx-1">
              <div className="space-y-1">
                <Label className="text-xs">Brand *</Label>
                <Select
                  value={form.brandId}
                  onValueChange={v => {
                    setForm(f => ({ ...f, brandId: v, categoryId: '', seriesId: '' }));
                    setTouched(prev => ({ ...prev, brandId: true }));
                    setFormErrors(prev => ({ ...prev, brandId: validateBrand(v), categoryId: undefined, seriesId: undefined }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
                {formErrors.brandId && <p className="text-xs text-destructive">{formErrors.brandId}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={v => {
                    setForm(f => ({ ...f, categoryId: v, seriesId: '' }));
                    setTouched(prev => ({ ...prev, categoryId: true }));
                    setFormErrors(prev => ({ ...prev, categoryId: validateCategory(v), seriesId: undefined }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.filter(c => c.brandId === form.brandId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                {formErrors.categoryId && <p className="text-xs text-destructive">{formErrors.categoryId}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Series *</Label>
                <Select
                  value={form.seriesId}
                  onValueChange={v => {
                    setForm(f => ({ ...f, seriesId: v }));
                    setTouched(prev => ({ ...prev, seriesId: true }));
                    setFormErrors(prev => ({ ...prev, seriesId: validateSeries(v) }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{seriesList.filter(s => s.categoryId === form.categoryId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                {formErrors.seriesId && <p className="text-xs text-destructive">{formErrors.seriesId}</p>}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2 mx-1">
              <Label>Name *</Label>
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
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2 mx-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Product Image */}
            <div className="space-y-2">
              <Label>Product Image *</Label>
              <ImageUpload
                value={form.iconImage}
                onChange={v => {
                  setForm(f => ({ ...f, iconImage: v }));
                  setTouched(prev => ({ ...prev, iconImage: true }));
                  setFormErrors(prev => ({ ...prev, iconImage: validateImage(v) }));
                }}
                size={150}
              />
              {formErrors.iconImage && <p className="text-xs text-destructive">{formErrors.iconImage}</p>}
            </div>

            {/* Specifications */}
            <div className="space-y-2 mx-1">
              <Label>Specifications</Label>
              <div className="flex gap-2">
                <Input placeholder="Key" value={specKey} onChange={e => setSpecKey(e.target.value)} />
                <Input placeholder="Value" value={specVal} onChange={e => setSpecVal(e.target.value)} />
                <Button type="button" variant="secondary" onClick={addSpec}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(form.specifications).map(([k, v]) => (
                  <Badge key={k} variant="outline" className="gap-1">{k}: {v}
                    <button onClick={() => setForm(f => { const s = { ...f.specifications }; delete s[k]; return { ...f, specifications: s }; })} className="ml-1 text-destructive">&times;</button>
                  </Badge>
                ))}
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save' : 'Add Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Overrides Dialog */}
      <Dialog open={!!serviceProduct} onOpenChange={() => setServiceProduct(null)}>
        <DialogContent className="flex flex-col max-h-[90vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Overrides — {serviceProduct?.name}</DialogTitle>
          </DialogHeader>
          {serviceProduct && (() => {
            const groups = groupServicesForProduct(serviceProduct.id);

            if (groups.length === 0) {
              return <p className="text-sm text-muted-foreground py-4">No services are assigned to this product.</p>;
            }

            return (
              <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
                <div className="flex items-center gap-3">
                  <img src={serviceProduct.iconImage} alt={serviceProduct.name} className="h-10 w-10 rounded-lg object-cover bg-muted" />
                  <div>
                    <h3 className="font-semibold text-foreground">{serviceProduct.name}</h3>
                    <p className="text-xs text-muted-foreground">{brandName(serviceProduct.brandId)} · {categoryName(serviceProduct.categoryId)} · {seriesName(serviceProduct.seriesId)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Override price and estimated time for services inherited by this product.
                </p>
                <div className="space-y-4">
                  {groups.map((group, gi) => {
                    const isExpanded = group.parent ? !popupCollapsedParents.has(group.parent.id) : true;
                    return (
                      <div key={gi}>
                        {group.parent && (
                          <div className="mb-2 cursor-pointer" onClick={() => togglePopupParentExpanded(group.parent!.id)}>
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
                            {group.items.map(svc => {
                              const edit = overrideEdits[svc.id];
                              const isDisabled = isServiceDisabledForProduct(svc.id, serviceProduct.id);
                              return (
                                <div key={svc.id} className={`rounded-lg border border-border p-3 space-y-2 ${isDisabled ? 'opacity-50' : ''}`}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm">{svc.name}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {svc.isVariant ? 'Variant ' : ''}{svc.level} · Default: ${svc.basePrice} · {svc.estimatedTime} min
                                      </p>
                                    </div>
                                    <Switch checked={!isDisabled} onCheckedChange={(checked) => toggleServiceForProduct(svc.id, serviceProduct.id, !checked)} />
                                  </div>
                                  {!isDisabled && (
                                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                                      <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          step={0.01}
                                          placeholder={String(svc.basePrice)}
                                          value={edit?.price ?? ''}
                                          onChange={e => setOverrideEdits(prev => ({
                                            ...prev,
                                            [svc.id]: { price: e.target.value, time: prev[svc.id]?.time ?? svc.estimatedTime }
                                          }))}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">Time (min)</Label>
                                        <Input
                                          type="number"
                                          min={1}
                                          placeholder={String(svc.estimatedTime)}
                                          value={edit?.time ?? ''}
                                          onChange={e => setOverrideEdits(prev => ({
                                            ...prev,
                                            [svc.id]: { price: prev[svc.id]?.price ?? svc.basePrice, time: e.target.value }
                                          }))}
                                        />
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={!edit}
                                        onClick={() => saveServiceOverride(svc.id, serviceProduct.id)}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setServiceProduct(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Product</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget) { remove(deleteTarget.id); setDeleteTarget(null); } }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;