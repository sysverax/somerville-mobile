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
import { Plus, Pencil, Trash2, RotateCcw, Wrench } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import ImageUpload from '@/components/ImageUpload';
import TablePagination from '@/components/TablePagination';

const ProductsPage = () => {
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { seriesList } = useSeriesData();
  const { products, create, update, remove, toggleActive } = useProducts();
  const { services, getOverridesByProduct, upsertOverride, deleteOverride } = useServices();

  const [view, setView] = useState<ViewMode>('table');
  const [filters, setFilters] = useState({ brandId: '', categoryId: '', seriesId: '' });
  const [applied, setApplied] = useState({ brandId: '', categoryId: '', seriesId: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({ seriesId: '', categoryId: '', brandId: '', name: '', description: '', specifications: {} as Record<string, string>, iconImage: null as string | null, galleryImages: [] as string[] });
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  // Service overrides dialog
  const [serviceProduct, setServiceProduct] = useState<Product | null>(null);
  const [overrideEdits, setOverrideEdits] = useState<Record<string, { price: number; time: number }>>({});

  const filteredCats = filters.brandId ? categories.filter(c => c.brandId === filters.brandId) : categories;
  const filteredSeries = filters.categoryId ? seriesList.filter(s => s.categoryId === filters.categoryId) : seriesList;
  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);
  const filtered = products.filter(p => (!applied.brandId || p.brandId === applied.brandId) && (!applied.categoryId || p.categoryId === applied.categoryId) && (!applied.seriesId || p.seriesId === applied.seriesId));

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => { setEditing(null); setForm({ seriesId: '', categoryId: '', brandId: '', name: '', description: '', specifications: {}, iconImage: null, galleryImages: [] }); setIsFormOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ seriesId: p.seriesId, categoryId: p.categoryId, brandId: p.brandId, name: p.name, description: p.description, specifications: { ...p.specifications }, iconImage: p.iconImage, galleryImages: [...p.galleryImages] }); setIsFormOpen(true); };
  const handleSave = () => { if (!form.name.trim() || !form.seriesId) return; if (editing) update(editing.id, form); else create(form); setIsFormOpen(false); };
  const addSpec = () => { if (specKey.trim() && specVal.trim()) { setForm(f => ({ ...f, specifications: { ...f.specifications, [specKey]: specVal } })); setSpecKey(''); setSpecVal(''); } };

  // Get all services that apply to a product (inherited from brand/category/series/product levels)
  const getServicesForProduct = (p: Product) => {
    return services.filter(s => {
      if (!s.isActive) return false;
      switch (s.level) {
        case 'brand': return s.brandId === p.brandId;
        case 'category': return s.categoryId === p.categoryId;
        case 'series': return s.seriesId === p.seriesId;
        case 'product': return s.productId === p.id;
        default: return false;
      }
    });
  };

  const openServiceOverrides = (p: Product) => {
    setServiceProduct(p);
    const existing = getOverridesByProduct(p.id);
    const edits: Record<string, { price: number; time: number }> = {};
    existing.forEach(o => {
      edits[o.serviceId] = { price: o.priceOverride, time: o.estimatedTimeOverride };
    });
    setOverrideEdits(edits);
  };

  const saveServiceOverride = (serviceId: string, productId: string) => {
    const edit = overrideEdits[serviceId];
    if (edit) {
      upsertOverride({ serviceId, productId, priceOverride: edit.price, estimatedTimeOverride: edit.time });
    }
  };

  const removeServiceOverride = (serviceId: string, productId: string) => {
    const existing = getOverridesByProduct(productId).find(o => o.serviceId === serviceId);
    if (existing) {
      deleteOverride(existing.id);
      setOverrideEdits(prev => {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      });
    }
  };

  const categoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const seriesName = (id: string) => seriesList.find(s => s.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1"><Label className="text-xs">Brand</Label>
          <Select value={filters.brandId} onValueChange={v => setFilters(f => ({ ...f, brandId: v, categoryId: '', seriesId: '' }))}><SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <Select value={filters.categoryId} onValueChange={v => setFilters(f => ({ ...f, categoryId: v, seriesId: '' }))}><SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{filteredCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Series</Label>
          <Select value={filters.seriesId} onValueChange={v => setFilters(f => ({ ...f, seriesId: v }))}><SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{filteredSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
        {hasChanges && <Button onClick={() => { setApplied({ ...filters }); setPage(1); }}>Apply</Button>}
        {(applied.brandId || applied.categoryId || applied.seriesId) && (
          <Button variant="outline" onClick={() => { const empty = { brandId: '', categoryId: '', seriesId: '' }; setFilters(empty); setApplied(empty); setPage(1); }}>Clear</Button>
        )}
        <ViewToggle view={view} onChange={setView} />
        <div className="ml-auto"><Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button></div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(p => {
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
                <TableHead className="w-12">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Series</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Services</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(p => {
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
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label className="text-xs">Brand *</Label><Select value={form.brandId} onValueChange={v => setForm(f => ({ ...f, brandId: v, categoryId: '', seriesId: '' }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs">Category *</Label><Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v, seriesId: '' }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.filter(c => c.brandId === form.brandId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs">Series *</Label><Select value={form.seriesId} onValueChange={v => setForm(f => ({ ...f, seriesId: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{seriesList.filter(s => s.categoryId === form.categoryId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Product Image</Label>
              <ImageUpload value={form.iconImage} onChange={v => setForm(f => ({ ...f, iconImage: v }))} size={150} />
            </div>
            <div className="space-y-2">
              <Label>Specifications</Label>
              <div className="flex gap-2"><Input placeholder="Key" value={specKey} onChange={e => setSpecKey(e.target.value)} /><Input placeholder="Value" value={specVal} onChange={e => setSpecVal(e.target.value)} /><Button type="button" variant="secondary" onClick={addSpec}>Add</Button></div>
              <div className="flex flex-wrap gap-1">{Object.entries(form.specifications).map(([k, v]) => <Badge key={k} variant="outline" className="gap-1">{k}: {v}<button onClick={() => setForm(f => { const s = { ...f.specifications }; delete s[k]; return { ...f, specifications: s }; })} className="ml-1 text-destructive">&times;</button></Badge>)}</div>
            </div>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Overrides Dialog */}
      <Dialog open={!!serviceProduct} onOpenChange={() => setServiceProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Overrides — {serviceProduct?.name}</DialogTitle>
          </DialogHeader>
          {serviceProduct && (() => {
            const productServices = getServicesForProduct(serviceProduct);
            const productOverrides = getOverridesByProduct(serviceProduct.id);

            if (productServices.length === 0) {
              return <p className="text-sm text-muted-foreground py-4">No services are assigned to this product.</p>;
            }

            return (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Override price and estimated time for services inherited by this product.
                </p>
                {productServices.map(svc => {
                  const hasOverride = productOverrides.some(o => o.serviceId === svc.id);
                  const edit = overrideEdits[svc.id];
                  const isProductLevel = svc.level === 'product';
                  return (
                    <div key={svc.id} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{svc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            <Badge variant="outline" className="capitalize text-xs mr-1">{svc.level}</Badge>
                            Default: ${svc.basePrice} · {svc.estimatedTime} min
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {hasOverride && <Badge variant="outline" className="text-xs">Customized</Badge>}
                          {isProductLevel && <Badge variant="secondary" className="text-xs">Direct</Badge>}
                        </div>
                      </div>
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
                              [svc.id]: { price: Number(e.target.value), time: prev[svc.id]?.time ?? svc.estimatedTime }
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
                              [svc.id]: { price: prev[svc.id]?.price ?? svc.basePrice, time: Number(e.target.value) }
                            }))}
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!edit}
                            onClick={() => saveServiceOverride(svc.id, serviceProduct.id)}
                          >
                            Save
                          </Button>
                          {hasOverride && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeServiceOverride(svc.id, serviceProduct.id)}
                              title="Reset to default"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Product</AlertDialogTitle><AlertDialogDescription>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget) { remove(deleteTarget.id); setDeleteTarget(null); } }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;