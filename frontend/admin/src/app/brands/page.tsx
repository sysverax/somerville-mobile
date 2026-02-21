import { useState } from 'react';
import { useBrands } from '@/hooks/useBrands';
import { Brand } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import ImageUpload from '@/components/ImageUpload';

const BrandsPage = () => {
  const { brands, create, update, remove, toggleActive, count } = useBrands();
  const [view, setView] = useState<ViewMode>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', iconImage: '' as string | null, mainImage: '' as string | null, description: '' });

  const openAdd = () => { setEditing(null); setForm({ name: '', iconImage: null, mainImage: null, description: '' }); setIsFormOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, iconImage: b.iconImage, mainImage: b.mainImage, description: b.description }); setIsFormOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) { update(editing.id, form); } else { create(form); }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">{count} / 10 brands used</Badge>
          <ViewToggle view={view} onChange={setView} />
        </div>
        <Button onClick={openAdd} disabled={count >= 10} className="gap-2"><Plus className="h-4 w-4" /> Add Brand</Button>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map(brand => (
            <div key={brand.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={brand.iconImage} alt={brand.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{brand.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{brand.description}</p>
                </div>
                <Badge variant={brand.isActive ? 'default' : 'secondary'}>{brand.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Active</Label>
                  <Switch checked={brand.isActive} onCheckedChange={() => toggleActive(brand.id)} />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(brand)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(brand)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
                <TableHead className="w-12">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map(brand => (
                <TableRow key={brand.id}>
                  <TableCell><img src={brand.iconImage} alt={brand.name} className="h-8 w-8 rounded-md object-cover bg-muted" /></TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-[200px]">{brand.description}</TableCell>
                  <TableCell><Badge variant={brand.isActive ? 'default' : 'secondary'} className="text-xs">{brand.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell><Switch checked={brand.isActive} onCheckedChange={() => toggleActive(brand.id)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(brand)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(brand)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit Brand' : 'Add Brand'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Brand Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon Image</Label>
                <ImageUpload value={form.iconImage} onChange={v => setForm(f => ({ ...f, iconImage: v }))} size={120} />
              </div>
              <div className="space-y-2">
                <Label>Main Image</Label>
                <ImageUpload value={form.mainImage} onChange={v => setForm(f => ({ ...f, mainImage: v }))} size={120} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Add Brand'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) { remove(deleteTarget.id); setDeleteTarget(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BrandsPage;
