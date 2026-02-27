import { useState } from 'react';
import { useSeriesData } from '@/hooks/useSeries';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import ImageUpload from '@/components/ImageUpload';
import TablePagination from '@/components/TablePagination';
import { computeSeriesVisibility, isParentInactive } from '@/lib/visibility';
import { VisibilityBadge, HiddenReasonCell, ParentNameCell } from '@/components/VisibilityBadge';

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
  return undefined;
};

type FormErrors = { brandId?: string; categoryId?: string; name?: string; image?: string };

const SeriesPage = () => {
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { seriesList, create, update, remove, toggleActive } = useSeriesData();
  const [view, setView] = useState<ViewMode>('table');

  const [filters, setFilters] = useState({ brandId: '', categoryId: '' });
  const [applied, setApplied] = useState({ brandId: '', categoryId: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Series | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Series | null>(null);
  const [form, setForm] = useState({ categoryId: '', brandId: '', name: '', image: null as string | null, description: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ brandId?: boolean; categoryId?: boolean; name?: boolean; image?: boolean }>({});

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCats = filters.brandId ? categories.filter(c => c.brandId === filters.brandId) : categories;
  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);
  const filtered = seriesList.filter(s => (!applied.brandId || s.brandId === applied.brandId) && (!applied.categoryId || s.categoryId === applied.categoryId));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => { setEditing(null); setForm({ categoryId: applied.categoryId, brandId: applied.brandId, name: '', image: null, description: '' }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };
  const openEdit = (s: Series) => { setEditing(s); setForm({ categoryId: s.categoryId, brandId: s.brandId, name: s.name, image: s.image, description: s.description }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };

  const handleClose = () => { setIsFormOpen(false); setFormErrors({}); setTouched({}); };

  const handleSave = () => {
    const brandErr = validateBrand(form.brandId);
    const categoryErr = validateCategory(form.categoryId);
    const nameErr = validateName(form.name);
    const imageErr = validateImage(form.image);
    if (brandErr || categoryErr || nameErr || imageErr) {
      setFormErrors({ brandId: brandErr, categoryId: categoryErr, name: nameErr, image: imageErr });
      setTouched({ brandId: true, categoryId: true, name: true, image: true });
      return;
    }
    if (editing) update(editing.id, form); else create(form);
    setIsFormOpen(false);
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
            <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Select value={filters.categoryId} onValueChange={v => { setFilters(f => ({ ...f, categoryId: v })); setPage(1); }} disabled={!filters.brandId}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>{filteredCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {hasChanges && <Button onClick={() => { setApplied({ ...filters }); setPage(1); }}>Apply</Button>}
        {(applied.brandId || applied.categoryId) && (
          <Button variant="outline" onClick={() => { const empty = { brandId: '', categoryId: '' }; setFilters(empty); setApplied(empty); setPage(1); }}>Clear</Button>
        )}
        <ViewToggle view={view} onChange={setView} />
        <div className="ml-auto"><Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Series</Button></div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={s.image} alt={s.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{s.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                </div>
                <VisibilityBadge visibility={computeSeriesVisibility(s, getCategory(s.categoryId), getBrand(s.brandId))} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2"><Label className="text-xs">Active</Label><Switch checked={s.isActive} onCheckedChange={() => toggleActive(s.id)} /></div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(s)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-24">Visibility</TableHead>
                <TableHead className="w-[150px] hidden lg:table-cell">Hidden Reason</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(s => {
                const brand = getBrand(s.brandId);
                const category = getCategory(s.categoryId);
                const visibility = computeSeriesVisibility(s, category, brand);
                const brandInactive = isParentInactive(brand);
                const categoryInactive = isParentInactive(category);
                return (
                  <TableRow key={s.id}>
                    <TableCell><img src={s.image} alt={s.name} className="h-8 w-8 rounded-md object-cover bg-muted" /></TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm"><ParentNameCell name={brandName(s.brandId)} isInactive={brandInactive} /></TableCell>
                    <TableCell className="text-sm"><ParentNameCell name={categoryName(s.categoryId)} isInactive={categoryInactive} /></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-[200px]">{s.description}</TableCell>
                    <TableCell><VisibilityBadge visibility={visibility} /></TableCell>
                    <TableCell className="hidden lg:table-cell"><HiddenReasonCell visibility={visibility} /></TableCell>
                    <TableCell><Switch checked={s.isActive} onCheckedChange={() => toggleActive(s.id)} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(s)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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

      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent className="flex flex-col max-h-[90vh]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Series' : 'Add Series'}</DialogTitle></DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
            <div className="space-y-2 mx-1">
              <Label>Brand *</Label>
              <Select value={form.brandId} onValueChange={v => {
                setForm(f => ({ ...f, brandId: v, categoryId: '' }));
                setTouched(prev => ({ ...prev, brandId: true }));
                setFormErrors(prev => ({ ...prev, brandId: validateBrand(v), categoryId: undefined }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              {formErrors.brandId && <p className="text-xs text-destructive">{formErrors.brandId}</p>}
            </div>
            <div className="space-y-2 mx-1">
              <Label>Category *</Label>
              <Select value={form.categoryId}
                onValueChange={v => {
                  setForm(f => ({ ...f, categoryId: v }));
                  setTouched(prev => ({ ...prev, categoryId: true }));
                  setFormErrors(prev => ({ ...prev, categoryId: validateCategory(v) }));
                }}
                disabled={!form.brandId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.filter(c => c.brandId === form.brandId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              {formErrors.categoryId && <p className="text-xs text-destructive">{formErrors.categoryId}</p>}
            </div>
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
            <div className="space-y-2 mx-1"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="space-y-2">
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
          <DialogFooter><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Series</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget) { remove(deleteTarget.id); setDeleteTarget(null); } }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeriesPage;
