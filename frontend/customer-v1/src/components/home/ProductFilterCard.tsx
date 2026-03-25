"use client"; 

import { useState, useEffect } from "react";
import Link from "next/link";       
import { motion } from "framer-motion";
import { Filter, ChevronRight, Search, Wrench } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useFilterOptions } from "@/src/hooks/useFilterOptions";
import { useMemo } from "react";
import type { StorefrontProduct } from "@/src/services";
import { type FilterOptions } from "@/src/services/filterService";

interface ProductFilterCardProps {
  options?: FilterOptions;
  loading?: boolean;
}

const ProductFilterCard = ({ options, loading: externalLoading }: ProductFilterCardProps) => {
  const { data: defaultOptions, loading: defaultLoading } = useFilterOptions();
  
  const filterOptions = options || defaultOptions;
  const filtersLoading = externalLoading !== undefined ? externalLoading : defaultLoading;
  
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSeriesId, setSelectedSeriesId] = useState("");

  const brands = filterOptions.brands;

  const filteredCategories = useMemo(() => {
    if (!selectedBrandId) return [];
    return filterOptions.categories.filter(c => c.brandId === selectedBrandId);
  }, [selectedBrandId, filterOptions.categories]);

  const filteredSeries = useMemo(() => {
    if (!selectedCategoryId) return [];
    return filterOptions.series.filter(s => s.categoryId === selectedCategoryId);
  }, [selectedCategoryId, filterOptions.series]);

  const filteredProducts = useMemo(() => {
    if (!selectedSeriesId) return [];
    return filterOptions.products.filter(p => p.seriesId === selectedSeriesId);
  }, [selectedSeriesId, filterOptions.products]);

  const loading = filtersLoading;

  const handleBrandChange = (value: string) => {
    setSelectedBrandId(value);
    setSelectedCategoryId("");
    setSelectedSeriesId("");
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setSelectedSeriesId("");
  };

  const clearFilters = () => {
    setSelectedBrandId("");
    setSelectedCategoryId("");
    setSelectedSeriesId("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-2xl shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Find Your Device</h3>
            <p className="text-sm text-muted-foreground">Select your device to request a repair</p>
          </div>
        </div>
        {(selectedBrandId || selectedCategoryId || selectedSeriesId) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
        )}
      </div>

      {/* <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-sm text-muted-foreground">
          <Wrench className="h-4 w-4 text-primary" />
          <span>Request repair service</span>
        </div>
      </div> */}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Brand</label>
          <Select value={selectedBrandId} onValueChange={handleBrandChange}>
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              {brands.length > 0 ? (
                brands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No brands available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Category</label>
          <Select value={selectedCategoryId} onValueChange={handleCategoryChange} disabled={!selectedBrandId}>
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No categories available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Series</label>
          <Select value={selectedSeriesId} onValueChange={setSelectedSeriesId} disabled={!selectedCategoryId}>
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select series" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              {filteredSeries.length > 0 ? (
                filteredSeries.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No series available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
           <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-border pt-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            {filteredProducts.length} {filteredProducts.length === 1 ? "Device" : "Devices"} Found
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductMiniCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      {!loading && selectedSeriesId && filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No devices found for this series.
        </div>
      )}
    </motion.div>
  );
};

const ProductMiniCard = ({ product, index }: { product: StorefrontProduct; index: number }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link
        href={`/product/${product.id}`}
        className="group block p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all"
      >
        <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-secondary/50">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
        </div>
        <h5 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h5>
        <div className="flex items-center gap-1 mt-2 text-xs text-primary">
          <span>View Details</span>
          <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductFilterCard;
