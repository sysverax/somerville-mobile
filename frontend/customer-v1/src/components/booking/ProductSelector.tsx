"use client";

import { useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, Smartphone } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { useBookingStore } from "@/src/stores/useBookingStore";
import { useFilterOptions } from "@/src/hooks/useFilterOptions";
import type { StorefrontBrand, StorefrontCategory, StorefrontSeries, StorefrontProduct } from "@/src/services/storefrontService";
import { Skeleton } from "@/src/components/ui/skeleton";

const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25 },
};

const ProductSelector = () => {
    const { data: filterOptions, loading } = useFilterOptions();
    const {
        selectedBrandId,
        selectedCategoryId,
        selectedSeriesId,
        selectedProductId,
        expandedSeriesId,
        setBrand,
        setCategory,
        setSeries,
        setExpandedSeries,
        setProduct,
    } = useBookingStore();

    const brands = filterOptions.brands;

    const filteredCategories = useMemo(() => {
        if (!selectedBrandId) return [];
        return filterOptions.categories.filter((c) => c.brandId === selectedBrandId);
    }, [selectedBrandId, filterOptions.categories]);

    const filteredSeries = useMemo(() => {
        if (!selectedCategoryId) return [];
        return filterOptions.series.filter((s) => s.categoryId === selectedCategoryId);
    }, [selectedCategoryId, filterOptions.series]);

    const filteredProducts = useMemo(() => {
        if (!selectedSeriesId) return [];
        return filterOptions.products.filter((p) => p.seriesId === selectedSeriesId);
    }, [selectedSeriesId, filterOptions.products]);

    // Products grouped by series (for accordion display)
    const productsBySeries = useMemo(() => {
        if (!selectedCategoryId) return new Map<string, StorefrontProduct[]>();
        const map = new Map<string, StorefrontProduct[]>();
        const seriesIds = filteredSeries.map((s) => s.id);
        for (const product of filterOptions.products) {
            if (seriesIds.includes(product.seriesId)) {
                const existing = map.get(product.seriesId) || [];
                existing.push(product);
                map.set(product.seriesId, existing);
            }
        }
        return map;
    }, [selectedCategoryId, filteredSeries, filterOptions.products]);

    // Auto-skip: if only one option, auto-select it
    useEffect(() => {
        if (selectedBrandId && filteredCategories.length === 1 && !selectedCategoryId) {
            setCategory(filteredCategories[0].id);
        }
    }, [selectedBrandId, filteredCategories, selectedCategoryId, setCategory]);

    useEffect(() => {
        if (selectedCategoryId && filteredSeries.length === 1 && !selectedSeriesId) {
            const series = filteredSeries[0];
            setSeries(series.id);
            setExpandedSeries(series.id);
        }
    }, [selectedCategoryId, filteredSeries, selectedSeriesId, setSeries, setExpandedSeries]);

    useEffect(() => {
        if (selectedSeriesId && filteredProducts.length === 1 && !selectedProductId) {
            setProduct(filteredProducts[0].id);
        }
    }, [selectedSeriesId, filteredProducts, selectedProductId, setProduct]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-3">
                    <Skeleton className="h-5 w-28" />
                    <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-24 rounded-xl" />
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-20 rounded-xl" />
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Brand Selection */}
            <section aria-label="Select brand">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Select Brand
                </h3>
                <div className="flex items-stretch gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                    {brands.map((brand: StorefrontBrand) => (
                        <button
                            key={brand.id}
                            type="button"
                            onClick={() => setBrand(brand.id)}
                            aria-pressed={selectedBrandId === brand.id}
                            className={cn(
                                "flex items-center h-full gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                                selectedBrandId === brand.id
                                    ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_hsl(0_75%_55%/0.15)]"
                                    : "bg-secondary/40 border-border/50 text-foreground/80 hover:bg-secondary/70 hover:border-border"
                            )}
                        >
                            <div className="w-6 h-6 rounded-md bg-secondary/60 flex items-center justify-center overflow-hidden shrink-0">
                                {brand.logo ? (
                                    <img
                                        src={brand.logo}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const el = e.target as HTMLImageElement;
                                            el.style.display = "none";
                                            el.parentElement!.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${brand.name.charAt(0)}</span>`;
                                        }}
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {brand.name.charAt(0)}
                                    </span>
                                )}
                            </div>
                            {brand.name}
                            {selectedBrandId === brand.id && (
                                <Check className="h-3.5 w-3.5 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Category Selection */}
            <AnimatePresence mode="wait">
                {selectedBrandId && filteredCategories.length > 0 && (
                    <motion.section {...fadeIn} key="categories" aria-label="Select category">
                        <h3 key="cat-title" className="text-sm font-medium text-muted-foreground mb-3">
                            Select Category
                        </h3>
                        <div key="cat-list" className="flex items-stretch gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                            {filteredCategories.map((cat: StorefrontCategory) => {
                                const catImage = Array.isArray(cat.image) ? cat.image[0] : cat.image;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        aria-pressed={selectedCategoryId === cat.id}
                                        className={cn(
                                            "flex items-center h-full gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                                            selectedCategoryId === cat.id
                                                ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_hsl(0_75%_55%/0.15)]"
                                                : "bg-secondary/40 border-border/50 text-foreground/80 hover:bg-secondary/70 hover:border-border"
                                        )}
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center overflow-hidden shrink-0">
                                            {catImage ? (
                                                <img
                                                    src={catImage}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const el = e.target as HTMLImageElement;
                                                        el.style.display = "none";
                                                        el.parentElement!.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${cat.name.charAt(0)}</span>`;
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {cat.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        {cat.name}
                                        {selectedCategoryId === cat.id && (
                                            <Check className="h-3.5 w-3.5 text-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Series Cards with Accordion Products */}
            <AnimatePresence mode="wait">
                {selectedCategoryId && filteredSeries.length > 0 && (
                    <motion.section {...fadeIn} key="series" aria-label="Select series and product">
                        <h3 key="series-title" className="text-sm font-medium text-muted-foreground mb-3">
                            Select Series
                        </h3>
                        <div key="series-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredSeries.map((series: StorefrontSeries) => {
                                const isExpanded = expandedSeriesId === series.id;
                                const products = productsBySeries.get(series.id) || [];
                                const hasSelection = selectedSeriesId === series.id;

                                return (
                                    <motion.div
                                        key={series.id}
                                        layout
                                        className={cn(
                                            "flex flex-col h-full border overflow-hidden transition-all duration-300",
                                            hasSelection
                                                ? "border-primary/40 shadow-[0_0_20px_hsl(0_75%_55%/0.1)]"
                                                : "border-border/50 hover:border-border"
                                        )}
                                    >
                                        {/* Series Card Header */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSeries(series.id);
                                                setExpandedSeries(series.id);
                                            }}
                                            className="w-full text-left"
                                            aria-expanded={isExpanded}
                                        >
                                            <div className="relative h-28 sm:h-32 overflow-hidden">
                                                {series.banner ? (
                                                    <img
                                                        src={series.banner}
                                                        alt=""
                                                        className="w-full h-full object-cover opacity-60"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/60" />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-white font-semibold text-base leading-tight">
                                                            {series.name}
                                                        </p>
                                                        <p className="text-white/60 text-xs mt-0.5">
                                                            {products.length} {products.length === 1 ? "model" : "models"}
                                                        </p>
                                                    </div>
                                                    <motion.div
                                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronDown className="h-5 w-5 text-white/70" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Expanded Products */}
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-2 space-y-1 bg-secondary/20 min-h-[50px] flex flex-col justify-center">
                                                        {products.length > 0 ? (
                                                            products
                                                                .map((product: StorefrontProduct) => (
                                                                    <button
                                                                        key={product.id}
                                                                        type="button"
                                                                        onClick={() => setProduct(product.id)}
                                                                        aria-pressed={selectedProductId === product.id}
                                                                        className={cn(
                                                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                                                                            selectedProductId === product.id
                                                                                ? "bg-primary/15 border border-primary/30"
                                                                                : "hover:bg-secondary/60 border border-transparent"
                                                                        )}
                                                                    >
                                                                        {product.images?.[0] ? (
                                                                            <img
                                                                                src={product.images[0]}
                                                                                alt=""
                                                                                className="w-9 h-9 rounded-lg object-contain bg-secondary/50"
                                                                                onError={(e) => {
                                                                                    (e.target as HTMLImageElement).src = "";
                                                                                    (e.target as HTMLImageElement).style.display = "none";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                                                                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                                            </div>
                                                                        )}
                                                                        <span className="flex-1 text-sm font-medium">
                                                                            {product.name}
                                                                        </span>
                                                                        {selectedProductId === product.id && (
                                                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                                                <Check className="h-3 w-3 text-white" />
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                ))
                                                        ) : (
                                                            <p className="text-center text-xs text-muted-foreground py-4">
                                                                No models available for this series.
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ProductSelector;
