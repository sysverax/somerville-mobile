"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Smartphone,
    Wrench,
    CalendarDays,
    Clock,
    DollarSign,
    ChevronUp,
    Tag,
    Layers,
    Cpu,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { useBookingStore } from "@/src/stores/useBookingStore";
import { useFilterOptions } from "@/src/hooks/useFilterOptions";
import { getStorefrontServicesByProduct, type StorefrontService } from "@/src/services/storefrontService";

const BookingSummary = () => {
    const { data: filterOptions } = useFilterOptions();
    const {
        currentStep,
        selectedBrandId,
        selectedCategoryId,
        selectedSeriesId,
        selectedProductId,
        selectedServiceId,
        selectedDate,
        selectedTime,
    } = useBookingStore();

    const [services, setServices] = useState<StorefrontService[]>([]);
    const [mobileExpanded, setMobileExpanded] = useState(false);

    useEffect(() => {
        if (selectedProductId) {
            getStorefrontServicesByProduct(selectedProductId).then(setServices);
        }
    }, [selectedProductId]);

    const selectedBrand = useMemo(
        () => filterOptions.brands.find((b) => b.id === selectedBrandId),
        [selectedBrandId, filterOptions.brands]
    );

    const selectedCategory = useMemo(
        () => filterOptions.categories.find((c) => c.id === selectedCategoryId),
        [selectedCategoryId, filterOptions.categories]
    );

    const selectedSeries = useMemo(
        () => filterOptions.series.find((s) => s.id === selectedSeriesId),
        [selectedSeriesId, filterOptions.series]
    );

    const selectedProduct = useMemo(
        () => filterOptions.products.find((p) => p.id === selectedProductId),
        [selectedProductId, filterOptions.products]
    );

    const selectedService = useMemo(
        () => services.find((s) => s.id === selectedServiceId),
        [selectedServiceId, services]
    );

    const hasAnything = selectedBrandId || selectedProductId || selectedServiceId || selectedDate;

    // Build the items list based on current step
    const items = useMemo(() => {
        const list: any[] = [];

        if (currentStep === 0) {
            // Detailed device info on Step 0
            if (selectedBrand) {
                list.push({ icon: Tag, label: "Brand", value: selectedBrand.name });
            }
            if (selectedCategory) {
                list.push({ icon: Layers, label: "Category", value: selectedCategory.name });
            }
            if (selectedSeries) {
                list.push({ icon: Cpu, label: "Series", value: selectedSeries.name });
            }
            if (selectedProduct) {
                list.push({ icon: Smartphone, label: "Device", value: selectedProduct.name });
            }
        } else {
            // On subsequent steps, only show the product name
            if (selectedProduct) {
                list.push({ icon: Smartphone, label: "Device", value: selectedProduct.name });
            }
        }

        // Shared summary items for all relevant steps
        if (selectedService) {
            list.push({ icon: Wrench, label: "Service", value: selectedService.name });
            list.push({ icon: DollarSign, label: "Price", value: `$${selectedService.price}` });
        }
        if (selectedDate) {
            list.push({ icon: CalendarDays, label: "Date", value: format(selectedDate, "MMM d, yyyy") });
        }
        if (selectedTime) {
            list.push({ icon: Clock, label: "Time", value: selectedTime });
        }

        return list;
    }, [
        currentStep,
        selectedBrand,
        selectedCategory,
        selectedSeries,
        selectedProduct,
        selectedService,
        selectedDate,
        selectedTime
    ]);

    return (
        <>
            {/* Desktop sidebar summary */}
            <div className="hidden lg:block">
                <div className="sticky top-24">
                    <div className="bg-secondary/30 rounded-2xl border border-border/50 p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">
                            Booking Summary
                        </h3>
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <item.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p
                                            className={cn(
                                                "text-sm font-medium truncate",
                                                item.highlight && "text-primary"
                                            )}
                                        >
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    No selections yet
                                </p>
                            )}
                        </div>

                        {selectedService && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Total
                                    </span>
                                    <span className="text-xl font-bold text-primary">
                                        ${selectedService.price}
                                    </span>
                                </div>
                                {selectedService.duration && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Duration: {selectedService.duration}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
                <AnimatePresence>
                    {mobileExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="bg-card/95 backdrop-blur-xl border-t border-border/50 overflow-hidden"
                        >
                            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <item.icon className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                {item.label}
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-sm font-medium truncate",
                                                    item.highlight && "text-primary"
                                                )}
                                            >
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 px-4 py-3">
                    <button
                        type="button"
                        onClick={() => setMobileExpanded(!mobileExpanded)}
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {selectedProduct && (
                                <span className="text-xs font-medium text-foreground/80 truncate max-w-[120px]">
                                    {selectedProduct.name}
                                </span>
                            )}
                            {selectedService && (
                                <>
                                    <span className="text-muted-foreground text-xs">·</span>
                                    <span className="text-xs font-bold text-primary">
                                        ${selectedService.price}
                                    </span>
                                </>
                            )}
                            {!selectedProduct && !selectedService && (
                                <span className="text-xs text-muted-foreground">
                                    {selectedBrand?.name || "Selection in progress..."}
                                </span>
                            )}
                        </div>
                        <motion.div animate={{ rotate: mobileExpanded ? 180 : 0 }}>
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                    </button>
                </div>
            </div>
        </>
    );
};

export default BookingSummary;
