import { useState } from 'react';
import { useStock } from '@/hooks/useStock';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useSeriesData } from '@/hooks/useSeries';
import { useProducts } from '@/hooks/useProducts';
import { ProductStockType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2 } from 'lucide-react';

const StockPricingPage = () => {
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { seriesList } = useSeriesData();
  const { products } = useProducts();
  const { getByProduct, toggleEnabled, toggleVisibility, updatePrice, addVariant, updateVariant, deleteVariant } = useStock();

  const [filters, setFilters] = useState({ brandId: '', categoryId: '', seriesId: '', productId: '' });
  const [applied, setApplied] = useState({ brandId: '', categoryId: '', seriesId: '', productId: '' });
  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);

  const [stockData, setStockData] = useState<ProductStockType[]>([]);
  const [variantForm, setVariantForm] = useState({ stockTypeId: '', name: '', price: 0, description: '' });
  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<{ stockTypeId: string; variantId: string } | null>(null);

  const filteredCats = filters.brandId ? categories.filter(c => c.brandId === filters.brandId) : [];
  const filteredSeries = filters.categoryId ? seriesList.filter(s => s.categoryId === filters.categoryId) : [];
  const filteredProducts = filters.seriesId ? products.filter(p => p.seriesId === filters.seriesId) : [];

  const handleApply = () => {
    setApplied({ ...filters });
    if (filters.productId) setStockData(getByProduct(filters.productId));
    else setStockData([]);
  };

  const refreshStock = () => { if (applied.productId) setStockData(getByProduct(applied.productId)); };

  const openAddVariant = (stockTypeId: string) => { setVariantForm({ stockTypeId, name: '', price: 0, description: '' }); setIsVariantOpen(true); };
  const saveVariant = () => { if (!variantForm.name.trim()) return; addVariant(variantForm.stockTypeId, { name: variantForm.name, price: variantForm.price, description: variantForm.description }); refreshStock(); setIsVariantOpen(false); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1"><Label className="text-xs">Brand</Label>
          <Select value={filters.brandId} onValueChange={v => setFilters({ brandId: v, categoryId: '', seriesId: '', productId: '' })}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <Select value={filters.categoryId} onValueChange={v => setFilters(f => ({ ...f, categoryId: v, seriesId: '', productId: '' }))}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{filteredCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Series</Label>
          <Select value={filters.seriesId} onValueChange={v => setFilters(f => ({ ...f, seriesId: v, productId: '' }))}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{filteredSeries.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Product</Label>
          <Select value={filters.productId} onValueChange={v => setFilters(f => ({ ...f, productId: v }))}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{filteredProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
        {hasChanges && <Button onClick={handleApply}>Apply</Button>}
      </div>

      {stockData.length === 0 && applied.productId && <p className="text-muted-foreground text-sm">No stock data for this product.</p>}
      {!applied.productId && <p className="text-muted-foreground text-sm">Select a product and click Apply to manage stock & pricing.</p>}

      <div className="space-y-4">
        {stockData.map(st => (
          <Card key={st.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{st.name}</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><Label className="text-xs">Enabled</Label><Switch checked={st.isEnabled} onCheckedChange={() => { toggleEnabled(st.id); refreshStock(); }} /></div>
                  <div className="flex items-center gap-2"><Label className="text-xs">Public</Label><Switch checked={st.isPublicVisible} onCheckedChange={() => { toggleVisibility(st.id); refreshStock(); }} /></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {st.variants.length === 0 && (
                <div className="flex items-center gap-3">
                  <Label className="text-sm">Base Price ($)</Label>
                  <Input type="number" className="w-32" value={st.price} onChange={e => { updatePrice(st.id, Number(e.target.value)); refreshStock(); }} />
                </div>
              )}
              {st.variants.length > 0 && (
                <div className="space-y-2">
                  {st.variants.map(v => (
                    <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium flex-1">{v.name}</span>
                      <span className="text-sm text-muted-foreground">{v.description}</span>
                      <Input type="number" className="w-28" value={v.price} onChange={e => { updateVariant(st.id, v.id, { price: Number(e.target.value) }); refreshStock(); }} />
                      <Switch checked={v.isActive} onCheckedChange={() => { updateVariant(st.id, v.id, { isActive: !v.isActive }); refreshStock(); }} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteVariantTarget({ stockTypeId: st.id, variantId: v.id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="gap-2" onClick={() => openAddVariant(st.id)}><Plus className="h-3 w-3" /> Add Variant</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isVariantOpen} onOpenChange={setIsVariantOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Variant</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Variant Name *</Label><Input value={variantForm.name} onChange={e => setVariantForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 128GB or Grade A+" /></div>
            <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={variantForm.price} onChange={e => setVariantForm(f => ({ ...f, price: Number(e.target.value) }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={variantForm.description} onChange={e => setVariantForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setIsVariantOpen(false)}>Cancel</Button><Button onClick={saveVariant}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteVariantTarget} onOpenChange={() => setDeleteVariantTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Variant</AlertDialogTitle><AlertDialogDescription>Remove this variant?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteVariantTarget) { deleteVariant(deleteVariantTarget.stockTypeId, deleteVariantTarget.variantId); refreshStock(); setDeleteVariantTarget(null); } }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StockPricingPage;
