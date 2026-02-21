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

const CategoriesPage = () => {
  const { brands } = useBrands();
  const { categories, create, update, remove, toggleActive } = useCategories();
  const [view, setView] = useState<ViewMode>('table');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ brandId: '', name: '', image: null as string | null, description: '' });

  const filtered = selectedBrand ? categories.filter(c => c.brandId === selectedBrand) : categories;

  const openAdd = () => { setEditing(null); setForm({ brandId: selectedBrand, name: '', image: null, description: '' }); setIsFormOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ brandId: c.brandId, name: c.name, image: c.image, description: c.description }); setIsFormOpen(true); };
  const handleSave = () => { if (!form.name.trim() || !form.brandId) return; if (editing) { update(editing.id, form); } else { create(form); } setIsFormOpen(false); };

  const brandName = (id: string) => brands.find(b => b.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by Brand" /></SelectTrigger>
            <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
          <ViewToggle view={view} onChange={setView} />
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cat => (
            <div key={cat.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={cat.image} alt={cat.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{brandName(cat.brandId)}</p>
                </div>
                <Badge variant={cat.isActive ? 'default' : 'secondary'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
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
                <TableHead className="w-12">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell><img src={cat.image} alt={cat.name} className="h-8 w-8 rounded-md object-cover bg-muted" /></TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{brandName(cat.brandId)}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-[200px]">{cat.description}</TableCell>
                  <TableCell><Badge variant={cat.isActive ? 'default' : 'secondary'} className="text-xs">{cat.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell><Switch checked={cat.isActive} onCheckedChange={() => toggleActive(cat.id)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(cat)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Brand *</Label>
              <Select value={form.brandId} onValueChange={v => setForm(f => ({ ...f, brandId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} size={120} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Category</AlertDialogTitle><AlertDialogDescription>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogDescription></AlertDialogHeader>
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
