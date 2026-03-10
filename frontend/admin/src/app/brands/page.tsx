import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import { Plus, Pencil, Trash2, Loader2, Tags } from 'lucide-react';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import ImageUpload from '@/components/ImageUpload';
import TablePagination from '@/components/TablePagination';
import { computeBrandVisibility } from '@/lib/visibility';
import { VisibilityBadge, HiddenReasonCell } from '@/components/VisibilityBadge';
import EmptyState from '@/components/EmptyState';

const validateName = (value: string): string | undefined => {
  if (!value.trim()) return 'Brand name is required';
  return undefined;
};

const validateIcon = (value: string | null): string | undefined => {
  if (!value) return 'Icon image is required';
  return undefined;
};

type FormErrors = { name?: string; iconImage?: string };

const BrandsPage = () => {
  const { brands, create, update, remove, toggleActive, count, isLoading: initialLoading } = useBrands();
  const { toast } = useToast();
  const [view, setView] = useState<ViewMode>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', iconImage: '' as string | null, description: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ name?: boolean; iconImage?: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const paginated = brands.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => { setEditing(null); setForm({ name: '', iconImage: null, description: '' }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, iconImage: b.iconImage, description: b.description }); setFormErrors({}); setTouched({}); setIsFormOpen(true); };
  const handleClose = () => { setIsFormOpen(false); setFormErrors({}); setTouched({}); setRequestError(null); };

  const handleSave = async () => {
    const nameErr = validateName(form.name);
    const iconErr = validateIcon(form.iconImage);
    if (nameErr || iconErr) {
      setFormErrors({ name: nameErr, iconImage: iconErr });
      return;
    }
    setRequestError(null);
    setIsLoading(true);
    try {
      if (editing) {
        await update(editing.id, form);
        toast({ title: 'Brand updated successfully', variant: 'success' });
      } else {
        await create(form);
        toast({ title: 'Brand created successfully', variant: 'success' });
      }
      setIsFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save brand';
      toast({ title: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameBlur = () => {
    setTouched(prev => ({ ...prev, name: true }));
    setFormErrors(prev => ({ ...prev, name: validateName(form.name) }));
  };

  const handleIconChange = (v: string | null) => {
    setForm(f => ({ ...f, iconImage: v }));
    setTouched(prev => ({ ...prev, iconImage: true }));
    setFormErrors(prev => ({ ...prev, iconImage: validateIcon(v) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">{count} / 7 brands used</Badge>
          <ViewToggle view={view} onChange={setView} />
        </div>
        <Button onClick={openAdd} disabled={count >= 7 || isLoading} className="gap-2"><Plus className="h-4 w-4" /> Add Brand</Button>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Tags className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No brands found</p>
              <p className="text-sm text-muted-foreground mt-1 text-center px-4">Add your first brand to get started.</p>
            </div>
          ) : paginated.map(brand => (
            <div key={brand.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={brand.iconImage} alt={brand.name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{brand.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{brand.description}</p>
                </div>
                <VisibilityBadge visibility={computeBrandVisibility(brand)} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Active</Label>
                  <Switch checked={brand.isActive} onCheckedChange={() => {
                    toggleActive(brand.id).catch((error) => {
                      const message = error instanceof Error ? error.message : 'Failed to update brand status';
                      toast({ title: message, variant: 'destructive' });
                    });
                  }} disabled={isLoading} />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(brand)} disabled={isLoading}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(brand)} disabled={isLoading}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
                <TableHead className="w-[150px]">Icon</TableHead>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-[110px]">Visibility</TableHead>
                <TableHead className="w-[150px] hidden lg:table-cell">Hidden Reason</TableHead>
                <TableHead className="w-[100px]">Active</TableHead>
                <TableHead className="w-[110px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Tags className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">No brands found</p>
                      <p className="text-sm text-muted-foreground mt-1">Add your first brand to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.map(brand => {
                const visibility = computeBrandVisibility(brand);
                return (
                  <TableRow key={brand.id}>
                    <TableCell><img src={brand.iconImage} alt={brand.name} className="h-8 w-8 rounded-md object-cover bg-muted" /></TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-[200px]">{brand.description}</TableCell>
                    <TableCell><VisibilityBadge visibility={visibility} /></TableCell>
                    <TableCell className="hidden lg:table-cell"><HiddenReasonCell visibility={visibility} /></TableCell>
                    <TableCell><Switch checked={brand.isActive} onCheckedChange={() => {
                      toggleActive(brand.id).catch((error) => {
                        const message = error instanceof Error ? error.message : 'Failed to update brand status';
                        toast({ title: message, variant: 'destructive' });
                      });
                    }} disabled={isLoading} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(brand)} disabled={isLoading}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(brand)} disabled={isLoading}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Brand' : 'Add Brand'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Brand Name *</Label><Input value={form.name}
              onChange={e => {
                const val = e.target.value;
                setForm(f => ({ ...f, name: val }));
                if (touched.name) {
                  setFormErrors(prev => ({ ...prev, name: validateName(val) }));
                }
              }}
              onBlur={handleNameBlur}
              disabled={isLoading} />
              {formErrors.name && (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} disabled={isLoading} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon Image *</Label>
                <ImageUpload value={form.iconImage} onChange={handleIconChange} size={120} />
                {formErrors.iconImage && (
                  <p className="text-xs text-destructive">{formErrors.iconImage}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Add Brand'}
            </Button>
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
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (deleteTarget) {
                  const name = deleteTarget.name;
                  setIsLoading(true);
                  try {
                    await remove(deleteTarget.id);
                    toast({ title: 'Brand deleted successfully', variant: 'success' });
                    setDeleteTarget(null);
                  } catch (error) {
                    const message = error instanceof Error ? error.message : 'Failed to delete brand';
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

export default BrandsPage;
