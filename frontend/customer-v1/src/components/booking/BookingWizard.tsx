"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Check, Wrench } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { toast } from "@/src/hooks/use-toast";
import { useBookingStore } from "@/src/stores/useBookingStore";
import { useFilterOptions } from "@/src/hooks/useFilterOptions";
import {
    addStorefrontBooking,
    getStorefrontServicesByProduct,
    type StorefrontService,
} from "@/src/services/storefrontService";

import Stepper from "./Stepper";
import ProductSelector from "./ProductSelector";
import ServiceSelector from "./ServiceSelector";
import ScheduleSelector from "./ScheduleSelector";
import CustomerForm from "./CustomerForm";
import BookingSummary from "./BookingSummary";

interface BookingWizardProps {
    preSelectedBrandId?: string;
}

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -80 : 80,
        opacity: 0,
    }),
};

const BookingWizard = ({ preSelectedBrandId }: BookingWizardProps) => {
    const store = useBookingStore();
    const { data: filterOptions } = useFilterOptions();
    const [direction, setDirection] = useState(0);
    const [services, setServices] = useState<StorefrontService[]>([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Pre-select brand from URL
    useEffect(() => {
        if (preSelectedBrandId && !store.selectedBrandId) {
            store.setBrand(preSelectedBrandId);
        }
    }, [preSelectedBrandId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch services when product changes
    useEffect(() => {
        if (store.selectedProductId) {
            getStorefrontServicesByProduct(store.selectedProductId).then(setServices);
        }
    }, [store.selectedProductId]);

    const selectedProduct = useMemo(
        () => filterOptions.products.find((p) => p.id === store.selectedProductId),
        [store.selectedProductId, filterOptions.products]
    );

    const selectedService = useMemo(
        () => services.find((s) => s.id === store.selectedServiceId),
        [store.selectedServiceId, services]
    );

    // Step validation
    const canProceedStep0 = !!store.selectedProductId;
    const canProceedStep1 = !!store.selectedServiceId;

    const cleanPhone = store.customerPhone.replace(/[\s\-().]/g, "");
    const phoneValid = /^\+?[0-9]\d{6,14}$/.test(cleanPhone);
    const emailValid =
        !store.customerEmail ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.customerEmail);

    const canSubmit =
        !!store.selectedDate &&
        !!store.selectedTime &&
        !!store.customerName.trim() &&
        !!store.customerPhone &&
        phoneValid &&
        emailValid;

    const handleNext = () => {
        if (store.currentStep === 0 && canProceedStep0) {
            setDirection(1);
            store.nextStep();
        } else if (store.currentStep === 1 && canProceedStep1) {
            setDirection(1);
            store.nextStep();
        }
    };

    const handleBack = () => {
        setDirection(-1);
        store.prevStep();
    };

    const handleSubmit = async () => {
        if (!canSubmit || !selectedService || !store.selectedDate) return;

        store.setIsSubmitting(true);

        try {
            const dateStr = format(store.selectedDate, "yyyy-MM-dd");
            await addStorefrontBooking({
                productId: store.selectedProductId,
                serviceId: selectedService.id,
                parentServiceId: selectedService.parentServiceId ?? null,
                price: selectedService.price,
                estimatedTime: selectedService.estimatedTime,
                date: dateStr,
                time: store.selectedTime,
                customerName: store.customerName,
                customerPhone: store.customerPhone,
                customerEmail: store.customerEmail,
                status: "pending",
            });

            toast({
                title: "Booking Confirmed!",
                description: "Your service appointment has been booked successfully.",
                variant: "success",
            });

            setBookingSuccess(true);
        } catch (error) {
            console.error("Booking failed:", error);
            toast({
                title: "Booking Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            store.setIsSubmitting(false);
        }
    };

    const handleBookAgain = () => {
        store.reset();
        setBookingSuccess(false);
        setDirection(0);
    };

    // Success screen
    if (bookingSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto"
                >
                    <Check className="h-10 w-10 text-green-500" />
                </motion.div>
                <div>
                    <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Your appointment has been scheduled. We&apos;ll send you a
                        confirmation shortly.
                    </p>
                </div>
                <div className="bg-secondary/30 rounded-2xl border border-border/50 p-5 max-w-sm mx-auto text-left space-y-2">
                    {selectedProduct && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Device</span>
                            <span className="font-medium">{selectedProduct.name}</span>
                        </div>
                    )}
                    {selectedService && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Service</span>
                                <span className="font-medium">{selectedService.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Price</span>
                                <span className="font-bold text-primary">
                                    ${selectedService.price}
                                </span>
                            </div>
                        </>
                    )}
                    {store.selectedDate && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">
                                {format(store.selectedDate, "MMM d, yyyy")}
                            </span>
                        </div>
                    )}
                    {store.selectedTime && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Time</span>
                            <span className="font-medium">{store.selectedTime}</span>
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleBookAgain}
                    className="bg-gradient-primary hover:opacity-90"
                >
                    Book Another Service
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
            {/* Main Content */}
            <div className="space-y-6">
                {/* Stepper */}
                <Stepper />

                {/* Step Content */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait" custom={direction}>
                        {store.currentStep === 0 && (
                            <motion.div
                                key="step-0"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                                <div className="bg-secondary/20 rounded-2xl border border-border/50 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2.5 rounded-xl bg-primary/10">
                                            <Wrench className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                Choose Your Device
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                Select brand, category, series and model
                                            </p>
                                        </div>
                                    </div>
                                    <ProductSelector />
                                </div>
                            </motion.div>
                        )}

                        {store.currentStep === 1 && (
                            <motion.div
                                key="step-1"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                                <div className="bg-secondary/20 rounded-2xl border border-border/50 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2.5 rounded-xl bg-primary/10">
                                            <Wrench className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                Select a Service
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedProduct
                                                    ? `Services for ${selectedProduct.name}`
                                                    : "Choose a repair or maintenance service"}
                                            </p>
                                        </div>
                                    </div>
                                    <ServiceSelector />
                                </div>
                            </motion.div>
                        )}

                        {store.currentStep === 2 && (
                            <motion.div
                                key="step-2"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                                <div className="space-y-4">
                                    <div className="bg-secondary/20 rounded-2xl border border-border/50 p-4 sm:p-6">
                                        <ScheduleSelector />
                                    </div>
                                    <div className="bg-secondary/20 rounded-2xl border border-border/50 p-4 sm:p-6">
                                        <CustomerForm />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div
                    className={cn(
                        "flex gap-3 pb-20 lg:pb-0",
                        store.currentStep > 0 ? "justify-between" : "justify-end"
                    )}
                >
                    {store.currentStep > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="rounded-xl border-border/50"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    )}

                    {store.currentStep < 2 && (
                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={
                                (store.currentStep === 0 && !canProceedStep0) ||
                                (store.currentStep === 1 && !canProceedStep1)
                            }
                            className="rounded-xl bg-gradient-primary hover:opacity-90 disabled:opacity-40"
                        >
                            Continue
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}

                    {store.currentStep === 2 && (
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit || store.isSubmitting}
                            className="rounded-xl bg-gradient-primary hover:opacity-90 disabled:opacity-40"
                        >
                            {store.isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                "Book Now"
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Sidebar Summary (desktop) */}
            <BookingSummary />

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-14 left-0 right-0 z-50 px-4 py-3 bg-background/95 backdrop-blur-xl border-t border-border/30">
                {store.currentStep < 2 ? (
                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={
                            (store.currentStep === 0 && !canProceedStep0) ||
                            (store.currentStep === 1 && !canProceedStep1)
                        }
                        className="w-full rounded-xl bg-gradient-primary hover:opacity-90 disabled:opacity-40 h-12 text-base font-semibold"
                    >
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit || store.isSubmitting}
                        className="w-full rounded-xl bg-gradient-primary hover:opacity-90 disabled:opacity-40 h-12 text-base font-semibold"
                    >
                        {store.isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Booking...
                            </>
                        ) : (
                            "Book Now"
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default BookingWizard;
