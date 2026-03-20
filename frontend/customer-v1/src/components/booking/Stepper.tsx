"use client";

import { motion } from "framer-motion";
import { Check, Smartphone, Wrench, CalendarDays } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useBookingStore } from "@/src/stores/useBookingStore";

const steps = [
    { label: "Select Product", icon: Smartphone },
    { label: "Select Service", icon: Wrench },
    { label: "Schedule & Details", icon: CalendarDays },
];

const Stepper = () => {
    const { currentStep, goToStep, selectedProductId, selectedServiceId } =
        useBookingStore();

    const canGoTo = (step: number) => {
        if (step === 0) return true;
        if (step === 1) return !!selectedProductId;
        if (step === 2) return !!selectedProductId && !!selectedServiceId;
        return false;
    };

    return (
        <div className="w-full" role="navigation" aria-label="Booking steps">
            {/* Desktop / Tablet */}
            <div className="hidden sm:flex items-center justify-center gap-0">
                {steps.map((step, idx) => {
                    const isCompleted = idx < currentStep;
                    const isCurrent = idx === currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.label} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => canGoTo(idx) && goToStep(idx)}
                                disabled={!canGoTo(idx)}
                                aria-current={isCurrent ? "step" : undefined}
                                aria-label={`${step.label}${isCompleted ? " (completed)" : ""}`}
                                className={cn(
                                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 group",
                                    isCurrent &&
                                    "bg-primary/15 border border-primary/30 shadow-[0_0_20px_hsl(0_75%_55%/0.1)]",
                                    isCompleted && "cursor-pointer",
                                    !canGoTo(idx) && !isCurrent && "opacity-40 cursor-not-allowed",
                                    canGoTo(idx) && !isCurrent && "hover:bg-secondary/60 cursor-pointer"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300",
                                        isCurrent && "bg-primary text-primary-foreground shadow-lg",
                                        isCompleted && "bg-primary/20 text-primary",
                                        !isCurrent && !isCompleted && "bg-secondary text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Icon className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p
                                        className={cn(
                                            "text-xs font-medium",
                                            isCurrent ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        Step {idx + 1}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-sm font-semibold",
                                            isCurrent
                                                ? "text-foreground"
                                                : isCompleted
                                                    ? "text-foreground/80"
                                                    : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                            </button>

                            {idx < steps.length - 1 && (
                                <div className="w-12 mx-1 h-[2px] rounded-full overflow-hidden bg-secondary">
                                    <motion.div
                                        className="h-full bg-primary rounded-full"
                                        initial={false}
                                        animate={{ width: isCompleted ? "100%" : "0%" }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile */}
            <div className="sm:hidden relative px-2">
                {/* Connector Line Background */}
                <div 
                    className="absolute top-5 left-[15%] right-[15%] h-[1.5px] bg-secondary/50 rounded-full" 
                    aria-hidden="true"
                />
                
                {/* Connector Line Progress */}
                <div 
                    className="absolute top-5 left-[15%] right-[15%] h-[1.5px] overflow-hidden" 
                    aria-hidden="true"
                >
                    <motion.div
                        className="h-full bg-primary"
                        initial={false}
                        animate={{ 
                            width: currentStep === 0 ? "0%" : currentStep === 1 ? "50%" : "100%" 
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                </div>

                <div className="relative flex justify-between">
                    {steps.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        const Icon = step.icon;

                        return (
                            <div key={step.label} className="flex-1">
                                <button
                                    type="button"
                                    onClick={() => canGoTo(idx) && goToStep(idx)}
                                    disabled={!canGoTo(idx)}
                                    aria-current={isCurrent ? "step" : undefined}
                                    aria-label={`${step.label}${isCompleted ? " (completed)" : ""}`}
                                    className="w-full flex flex-col items-center gap-2 group outline-none"
                                >
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10",
                                            isCurrent && "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(0_75%_55%/0.25)] scale-105",
                                            isCompleted && "bg-primary/20 text-primary",
                                            !isCurrent && !isCompleted && "bg-background border border-border/50 text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Icon className="h-4 w-4" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] sm:text-xs font-semibold text-center leading-tight transition-colors duration-300 max-w-[80px]",
                                            isCurrent ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Stepper;
