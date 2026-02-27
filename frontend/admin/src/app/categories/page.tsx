import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { Category } from '@/types';
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
import { computeCategoryVisibility, isParentInactive } from '@/lib/visibility';
import { VisibilityBadge, HiddenReasonCell, ParentNameCell } from '@/components/VisibilityBadge';

const validateBrand = (value: string): string | undefined => {
  if (!value) return 'Brand is required';
  return undefined;
};

const validateName = (value: string): string | undefined => {
  if (!value.trim()) return 'Category name is required';
  return undefined;
};

const validateImage = (value: string | null): string | undefined => {
  if (!value) return 'Image is required';
  return undefined;
};

type FormErrors = { brandId?: string; name?: string; image?: string };

const CategoriesPage = () => {
  const { brands } = useBrands();
  const { categories, create, update, remove, toggleActive } = useCategories();
  const [view, setView] = useState<ViewMode>('table');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ brandId: '', name: '', image: null as string | null, description: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ brandId?: boolean; name?: boolean; image?: boolean }>({});

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = selectedBrand ? categories.filter(c => c.brandId === selectedBrand) : categories;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => { setEditing(null); setForm({ brandId: selectedBrand, name: '', image: null, description: '' }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ brandId: c.brandId, name: c.name, image: c.image, description: c.description }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };

  const handleClose = () => { setIsFormOpen(false); setFormErrors({}); setTouched({}); };

  const handleSave = () => {
    const brandErr = validateBrand(form.brandId);
    const nameErr = validateName(form.name);
    const imageErr = validateImage(form.image);
    if (brandErr || nameErr || imageErr) {
      setFormErrors({ brandId: brandErr, name: nameErr, image: imageErr });
      setTouched({ brandId: true, name: true, image: true });
      return;
    }
    if (editing) { update(editing.id, form); } else { create(form); }
    setIsFormOpen(false);
  };

  const brandName = (id: string) => brands.find(b => b.id === id)?.name || id;
  const getBrand = (id: string) => brands.find(b => b.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-end gap-3">
          <Select value={selectedBrand} onValueChange={v => { setSelectedBrand(v); setPage(1); }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by Brand" /></SelectTrigger>
            <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
          {selectedBrand && <Button variant="outline" onClick={() => { setSelectedBrand(''); setPage(1); }}>Clear</Button>}
          <ViewToggle view={view} onChange={setView} />
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(cat => (
            <div key={cat.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={cat.image} alt={cat.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{brandName(cat.brandId)}</p>
                </div>
                <VisibilityBadge visibility={computeCategoryVisibility(cat, getBrand(cat.brandId))} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2"><Label className="text-xs">Active</Label><Switch checked={cat.isActive} onCheckedChange={() => toggleActive(cat.id)} /></div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(cat)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-[110px]">Visibility</TableHead>
                <TableHead className="w-[150px] hidden lg:table-cell">Hidden Reason</TableHead>
                <TableHead className="w-[100px]">Active</TableHead>
                <TableHead className="w-[110px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(cat => {
                const brand = getBrand(cat.brandId);
                const visibility = computeCategoryVisibility(cat, brand);
                const brandInactive = isParentInactive(brand);
                return (
                  <TableRow key={cat.id}>
                    <TableCell><img src={cat.image} alt={cat.name} className="h-8 w-8 rounded-md object-cover bg-muted" /></TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-sm"><ParentNameCell name={brandName(cat.brandId)} isInactive={brandInactive} /></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-[200px]">{cat.description}</TableCell>
                    <TableCell><VisibilityBadge visibility={visibility} /></TableCell>
                    <TableCell className="hidden lg:table-cell"><HiddenReasonCell visibility={visibility} /></TableCell>
                    <TableCell><Switch checked={cat.isActive} onCheckedChange={() => toggleActive(cat.id)} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(cat)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Brand *</Label>
              <Select value={form.brandId} onValueChange={v => { setForm(f => ({ ...f, brandId: v })); setTouched(prev => ({ ...prev, brandId: true })); setFormErrors(prev => ({ ...prev, brandId: validateBrand(v) })); }}>
                <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              {formErrors.brandId && <p className="text-xs text-destructive">{formErrors.brandId}</p>}
            </div>
            <div className="space-y-2"><Label>Name *</Label>
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
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
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
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Category</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) { remove(deleteTarget.id); setDeleteTarget(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesPage;
