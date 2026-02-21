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

  const filteredCats = filters.brandId ? categories.filter(c => c.brandId === filters.brandId) : categories;
  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);
  const filtered = seriesList.filter(s => (!applied.brandId || s.brandId === applied.brandId) && (!applied.categoryId || s.categoryId === applied.categoryId));

  const openAdd = () => { setEditing(null); setForm({ categoryId: applied.categoryId, brandId: applied.brandId, name: '', image: null, description: '' }); setIsFormOpen(true); };
  const openEdit = (s: Series) => { setEditing(s); setForm({ categoryId: s.categoryId, brandId: s.brandId, name: s.name, image: s.image, description: s.description }); setIsFormOpen(true); };
  const handleSave = () => { if (!form.name.trim() || !form.categoryId || !form.brandId) return; if (editing) update(editing.id, form); else create(form); setIsFormOpen(false); };

  const brandName = (id: string) => brands.find(b => b.id === id)?.name || id;
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Brand</Label>
          <Select value={filters.brandId} onValueChange={v => setFilters(f => ({ ...f, brandId: v, categoryId: '' }))}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Brands" /></SelectTrigger>
            <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Select value={filters.categoryId} onValueChange={v => setFilters(f => ({ ...f, categoryId: v }))}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>{filteredCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {hasChanges && <Button onClick={() => setApplied({ ...filters })}>Apply</Button>}
        <ViewToggle view={view} onChange={setView} />
        <div className="ml-auto"><Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Series</Button></div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={s.image} alt={s.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{s.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                </div>
                <Badge variant={s.isActive ? 'default' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
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
                <TableHead className="w-12">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell><img src={s.image} alt={s.name} className="h-8 w-8 rounded-md object-cover bg-muted" /></TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{brandName(s.brandId)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{categoryName(s.categoryId)}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-[200px]">{s.description}</TableCell>
                  <TableCell><Badge variant={s.isActive ? 'default' : 'secondary'} className="text-xs">{s.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell><Switch checked={s.isActive} onCheckedChange={() => toggleActive(s.id)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(s)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Series' : 'Add Series'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Brand *</Label>
              <Select value={form.brandId} onValueChange={v => setForm(f => ({ ...f, brandId: v, categoryId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.filter(c => c.brandId === form.brandId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} size={120} />
            </div>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Series</AlertDialogTitle><AlertDialogDescription>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget) { remove(deleteTarget.id); setDeleteTarget(null); } }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeriesPage;
