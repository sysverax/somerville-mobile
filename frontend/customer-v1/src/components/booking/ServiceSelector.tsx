"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, DollarSign, Wrench, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useBookingStore } from "@/src/stores/useBookingStore";
import { getStorefrontServicesByProduct, type StorefrontService } from "@/src/services/storefrontService";
import { Skeleton } from "@/src/components/ui/skeleton";

const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25 },
};

const ServiceSelector = () => {
    const { selectedProductId, selectedServiceId, setService } = useBookingStore();
    const [services, setServices] = useState<StorefrontService[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedProductId) {
            setServices([]);
            return;
        }
        setLoading(true);
        getStorefrontServicesByProduct(selectedProductId)
            .then((data) => setServices(data))
            .catch(() => setServices([]))
            .finally(() => setLoading(false));
    }, [selectedProductId]);

    const availableServices = useMemo(
        () => services.filter((s) => !s.isParent && s.isAvailable),
        [services]
    );

    if (loading) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Loading services...</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (availableServices.length === 0) {
        return (
            <motion.div {...fadeIn} className="text-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No services available for this product.</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Choose a service for your device
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                    {availableServices.map((service, idx) => {
                        const isSelected = selectedServiceId === service.id;

                        return (
                            <motion.button
                                key={service.id}
                                type="button"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: idx * 0.04 }}
                                onClick={() => setService(service.id)}
                                aria-pressed={isSelected}
                                className={cn(
                                    "relative text-left p-4 rounded-2xl border transition-all duration-300 group",
                                    isSelected
                                        ? "bg-primary/10 border-primary/40 shadow-[0_0_24px_hsl(0_75%_55%/0.12)]"
                                        : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-border"
                                )}
                            >
                                {/* Selection indicator */}
                                {isSelected && (
                                    <motion.div
                                        layoutId="service-selection"
                                        className="absolute inset-0 rounded-2xl border-2 border-primary/50 pointer-events-none"
                                        transition={{ duration: 0.2 }}
                                    />
                                )}

                                <div className="flex items-start justify-between mb-3">

                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                        >
                                            <svg
                                                className="h-3.5 w-3.5 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </motion.div>
                                    )}
                                </div>

                                <h4 className="font-semibold text-sm mb-1.5 leading-tight">
                                    {service.name}
                                </h4>

                                {service.description && (
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                        {service.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-3 mt-auto">
                                    <span className="flex items-center gap-1 text-primary font-bold text-base">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        {service.price}
                                    </span>
                                    {service.duration && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {service.duration}
                                        </span>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ServiceSelector;
