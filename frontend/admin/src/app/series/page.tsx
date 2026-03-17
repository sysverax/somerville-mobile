import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSeriesData } from '@/hooks/useSeries';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { Series } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Layers } from 'lucide-react';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import ImageUpload from '@/components/ImageUpload';
import TablePagination from '@/components/TablePagination';
import { computeSeriesVisibility, isParentInactive } from '@/lib/visibility';
import { VisibilityBadge, HiddenReasonCell, ParentNameCell } from '@/components/VisibilityBadge';
import EmptyState from '@/components/EmptyState';
import { TruncatedText } from '@/components/ui/truncated-text';

const validateBrand = (value: string): string | undefined => {
  if (!value) return 'Brand is required';
  return undefined;
};

const validateCategory = (value: string): string | undefined => {
  if (!value) return 'Category is required';
  return undefined;
};

const validateName = (value: string): string | undefined => {
  if (!value.trim()) return 'Series name is required';
  return undefined;
};

const validateImage = (value: string | null): string | undefined => {
  if (!value) return 'Image is required';
  if (value.startsWith('data:')) {
    const mimeMatch = value.match(/^data:([^;]+);base64,/);
    if (mimeMatch) {
      const mimeType = mimeMatch[1];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(mimeType)) {
        return 'Unsupported format. Use JPG, PNG, WEBP, or SVG.';
      }
    }
  }
  return undefined;
};

type FormErrors = { brandId?: string; categoryId?: string; name?: string; image?: string };

const SeriesPage = () => {
  const { brands, categories, isLoading: optionsLoading } = useFilterOptions();
  const { seriesList, total, create, update, remove, toggleActive, isLoading: seriesLoading, refresh } = useSeriesData();
  const initialLoading = seriesLoading || optionsLoading;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<ViewMode>('table');

  const [filters, setFilters] = useState({ brandId: 'all', categoryId: 'all' });
  const [applied, setApplied] = useState({ brandId: 'all', categoryId: 'all' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Series | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Series | null>(null);
  const [form, setForm] = useState({ categoryId: '', brandId: '', name: '', image: null as string | null, description: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ brandId?: boolean; categoryId?: boolean; name?: boolean; image?: boolean }>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = formRef.current?.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCats = (filters.brandId !== 'all' || applied.brandId !== 'all') ? categories.filter(c => c.brandId === (filters.brandId !== 'all' ? filters.brandId : applied.brandId)) : categories;
  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);
  const paginated = seriesList;

  useEffect(() => {
    if (!isFormOpen) {
      refresh({ 
        brandId: applied.brandId !== 'all' ? applied.brandId : undefined,
        categoryId: applied.categoryId !== 'all' ? applied.categoryId : undefined,
        page,
        limit: pageSize
      });
    }
  }, [applied, page, pageSize, refresh, isFormOpen]);

  const openAdd = () => { setEditing(null); setForm({ categoryId: applied.categoryId !== 'all' ? applied.categoryId : '', brandId: applied.brandId !== 'all' ? applied.brandId : '', name: '', image: null, description: '' }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };
  const openEdit = (s: Series) => { setEditing(s); setForm({ categoryId: s.category?.id || s.categoryId, brandId: s.brand?.id || s.brandId, name: s.name, image: s.image, description: s.description }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };

  const handleClose = () => { setIsFormOpen(false); setFormErrors({}); setTouched({}); };

  const handleSave = async () => {
    const brandErr = validateBrand(form.brandId);
    const categoryErr = validateCategory(form.categoryId);
    const nameErr = validateName(form.name);
    const imageErr = validateImage(form.image);
    if (brandErr || categoryErr || nameErr || imageErr) {
      setFormErrors({ brandId: brandErr, categoryId: categoryErr, name: nameErr, image: imageErr });
      setTouched({ brandId: true, categoryId: true, name: true, image: true });
      scrollToFirstError();
      return;
    }
    setIsLoading(true);
    try {
      if (editing) {
        const updateData: any = {};
        if (form.name !== editing.name) updateData.name = form.name;
        if (form.description !== editing.description) updateData.description = form.description;
        if (form.image !== editing.image) updateData.image = form.image;
        
        if (Object.keys(updateData).length > 0) {
          await update(editing.id, updateData);
          toast({ title: 'Series updated successfully', variant: 'success' });
        }
      } else {
        await create(form);
        toast({ title: 'Series created successfully', variant: 'success' });
      }
      setIsFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save series';
      toast({ title: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const brandName = (id: string) => brands.find(b => b.id === id)?.name || id;
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const getBrand = (id: string) => brands.find(b => b.id === id);
  const getCategory = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Brand</Label>
          <Select value={filters.brandId} onValueChange={v => { setFilters(f => ({ ...f, brandId: v, categoryId: '' })); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Brands" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No brands found</div>}
              {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Select value={filters.categoryId} onValueChange={v => { setFilters(f => ({ ...f, categoryId: v })); setPage(1); }} disabled={!filters.brandId || filters.brandId === 'all'}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {filteredCats.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No categories found</div>}
              {filteredCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {hasChanges && <Button onClick={() => { setApplied({ ...filters }); setPage(1); }}>Apply</Button>}
        {(applied.brandId !== 'all' || applied.categoryId !== 'all') && (
          <Button variant="outline" onClick={() => { const empty = { brandId: 'all', categoryId: 'all' }; setFilters(empty); setApplied(empty); setPage(1); }}>Clear</Button>
        )}
        <ViewToggle view={view} onChange={setView} />
        <div className="ml-auto"><Button onClick={openAdd} disabled={isLoading} className="gap-2"><Plus className="h-4 w-4" /> Add Series</Button></div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-card">
              <EmptyState
                title="No series found"
                description={seriesList.length > 0 ? 'Try changing page size or page number.' : 'Click "Add Series" to create your first series.'}
                actionLabel="Add Series"
                onAction={openAdd}
              />
            </div>
          ) : paginated.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={s.image} alt={s.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{s.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                </div>
                <VisibilityBadge visibility={computeSeriesVisibility(s, getCategory(s.category?.id || s.categoryId), getBrand(s.brand?.id || s.brandId))} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Active</Label>
                  <div className="w-10 flex justify-center items-center">
                    {togglingId === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Switch checked={s.isActive} onCheckedChange={async () => {
                        setTogglingId(s.id);
                        try {
                          await toggleActive(s.id);
                        } catch (error) {
                          const message = error instanceof Error ? error.message : 'Failed to update series status';
                          toast({ title: message, variant: 'destructive' });
                        } finally {
                          setTogglingId(null);
                        }
                      }} disabled={isLoading} />
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} disabled={isLoading}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(s)} disabled={isLoading}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden scrollbar-hide">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead className='w-[230px]'>Name</TableHead>
                <TableHead className="w-[100px]">Brand</TableHead>
                <TableHead className="w-14">Category</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-14">Visibility</TableHead>
                <TableHead className="w-20 hidden lg:table-cell">Hidden Reason</TableHead>
                <TableHead className="w-14">Active</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-0">
                    <EmptyState
                      title="No series found"
                      description={seriesList.length > 0 ? 'Try changing page size or page number.' : 'Click "Add Series" to create your first series.'}
                      actionLabel="Add Series"
                      onAction={openAdd}
                    />
                  </TableCell>
                </TableRow>
              ) : paginated.map(s => {
                const brand = getBrand(s.brand?.id || s.brandId);
                const category = getCategory(s.category?.id || s.categoryId);
                const visibility = computeSeriesVisibility(s, category, brand);
                const brandInactive = isParentInactive(brand);
                const categoryInactive = isParentInactive(category);
                return (
                  <TableRow key={s.id}>
                    <TableCell><img src={s.image} alt={s.name} className="h-8 w-8 rounded-md object-cover bg-muted" /></TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm"><ParentNameCell name={s.brand?.name || brandName(s.brand?.id || s.brandId) || s.brandId} isInactive={brandInactive} /></TableCell>
                    <TableCell className="text-sm"><ParentNameCell name={s.category?.name || categoryName(s.category?.id || s.categoryId) || s.categoryId} isInactive={categoryInactive} /></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[100px]"><TruncatedText text={s.description} /></TableCell>
                    <TableCell><VisibilityBadge visibility={visibility} /></TableCell>
                    <TableCell className="hidden lg:table-cell"><HiddenReasonCell visibility={visibility} /></TableCell>
                    <TableCell>
                      <div className="w-10 flex justify-center items-center">
                        {togglingId === s.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Switch checked={s.isActive} onCheckedChange={async () => {
                            setTogglingId(s.id);
                            try {
                              await toggleActive(s.id);
                            } catch (error) {
                              const message = error instanceof Error ? error.message : 'Failed to update series status';
                              toast({ title: message, variant: 'destructive' });
                            } finally {
                              setTogglingId(null);
                            }
                          }} disabled={isLoading} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} disabled={isLoading}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(s)} disabled={isLoading}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination totalItems={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />

      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="flex flex-col max-h-[90vh]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Series' : 'Add Series'}</DialogTitle></DialogHeader>
          <div ref={formRef} className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
            <div className="space-y-2 mx-1" data-error={!!formErrors.brandId}>
              <Label>Brand *</Label>
              <Select value={form.brandId} onValueChange={v => {
                setForm(f => ({ ...f, brandId: v, categoryId: '' }));
                setTouched(prev => ({ ...prev, brandId: true }));
                setFormErrors(prev => ({ ...prev, brandId: validateBrand(v), categoryId: undefined }));
              }}>
                <SelectTrigger disabled={isLoading || !!editing}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {brands.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No brands found</div>}
                  {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {formErrors.brandId && <p className="text-xs text-destructive">{formErrors.brandId}</p>}
            </div>
            <div className="space-y-2 mx-1" data-error={!!formErrors.categoryId}>
              <Label>Category *</Label>
              <Select value={form.categoryId}
                onValueChange={v => {
                  setForm(f => ({ ...f, categoryId: v }));
                  setTouched(prev => ({ ...prev, categoryId: true }));
                  setFormErrors(prev => ({ ...prev, categoryId: validateCategory(v) }));
                }}
                disabled={!form.brandId || !!editing}>
                <SelectTrigger disabled={isLoading}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.brandId === form.brandId).length === 0 && (
                    <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No categories found</div>
                  )}
                  {categories.filter(c => c.brandId === form.brandId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {formErrors.categoryId && <p className="text-xs text-destructive">{formErrors.categoryId}</p>}
            </div>
            <div className="space-y-2 mx-1" data-error={!!formErrors.name}>
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
                disabled={isLoading}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-2 mx-1"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} disabled={isLoading} /></div>
            <div className="space-y-2 mx-1" data-error={!!formErrors.image}>
              <Label>Image *</Label>
              <ImageUpload
                value={form.image}
                onChange={v => {
                  setForm(f => ({ ...f, image: v }));
                  setTouched(prev => ({ ...prev, image: true }));
                  setFormErrors(prev => ({ ...prev, image: validateImage(v) }));
                }}
                size={120}
              />
              {formErrors.image && <p className="text-xs text-destructive">{formErrors.image}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Add Series'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Series</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (deleteTarget) {
                  setIsLoading(true);
                  try {
                    await remove(deleteTarget.id);
                    toast({ title: 'Series deleted successfully', variant: 'success' });
                    setDeleteTarget(null);
                  } catch (error) {
                    const message = error instanceof Error ? error.message : 'Failed to delete series';
                    toast({ title: message, variant: 'destructive' });
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeriesPage;
