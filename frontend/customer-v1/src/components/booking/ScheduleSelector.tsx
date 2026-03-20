"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    Clock,
    ChevronLeft,
    ChevronRight,
    Sun,
    Sunset,
    Moon,
} from "lucide-react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { cn } from "@/src/lib/utils";
import { useBookingStore } from "@/src/stores/useBookingStore";

// Time slots grouped by period
const TIME_GROUPS = [
    {
        label: "Morning",
        icon: Sun,
        slots: ["09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45"],
    },
    {
        label: "Afternoon",
        icon: Sunset,
        slots: ["12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45"],
    },
    {
        label: "Evening",
        icon: Moon,
        slots: ["16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45"],
    },
];

const ScheduleSelector = () => {
    const { selectedDate, selectedTime, setDate, setTime } = useBookingStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeGroup, setActiveGroup] = useState<string>("Morning");

    const today = useMemo(() => startOfDay(new Date()), []);
    const maxDate = useMemo(() => addDays(today, 30), [today]);

    // Generate 30 days for the horizontal strip
    const dateStrip = useMemo(() => {
        const days: Date[] = [];
        for (let i = 0; i <= 30; i++) {
            days.push(addDays(today, i));
        }
        return days;
    }, [today]);

    // Auto-select today on mount if no date chosen
    useEffect(() => {
        if (!selectedDate) {
            setDate(today);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-scroll to selected date
    useEffect(() => {
        if (selectedDate && scrollRef.current) {
            const idx = dateStrip.findIndex((d) => isSameDay(d, selectedDate));
            if (idx >= 0) {
                const child = scrollRef.current.children[idx] as HTMLElement;
                child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
        }
    }, [selectedDate, dateStrip]);

    // Auto-set active group based on selected time
    useEffect(() => {
        if (selectedTime) {
            const group = TIME_GROUPS.find((g) => g.slots.includes(selectedTime));
            if (group) setActiveGroup(group.label);
        }
    }, [selectedTime]);

    const scrollDates = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({
            left: dir === "left" ? -200 : 200,
            behavior: "smooth",
        });
    };

    return (
        <div className="space-y-5">
            {/* Date Strip */}
            <section aria-label="Select date">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Select Date
                        </h3>
                    </div>
                    {selectedDate && (
                        <span className="text-xs text-primary font-medium">
                            {format(selectedDate, "EEE, MMM d")}
                        </span>
                    )}
                </div>

                <div className="relative group">
                    {/* Scroll arrows */}
                    <button
                        type="button"
                        onClick={() => scrollDates("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/90 border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        aria-label="Scroll dates left"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollDates("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/90 border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        aria-label="Scroll dates right"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    {/* Date chips */}
                    <div
                        ref={scrollRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1"
                    >
                        {dateStrip.map((date) => {
                            const isSelected = selectedDate && isSameDay(date, selectedDate);

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    onClick={() => setDate(date)}
                                    aria-pressed={!!isSelected}
                                    aria-label={format(date, "EEEE, MMMM d")}
                                    className={cn(
                                        "flex flex-col items-center min-w-[52px] py-2.5 px-2 rounded-xl border transition-all duration-200 shrink-0",
                                        isSelected
                                            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_hsl(0_75%_55%/0.25)] scale-105"
                                            : "bg-secondary/30 border-border/30 text-foreground/80 hover:bg-secondary/60 hover:border-border/60"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "text-[10px] uppercase font-semibold tracking-wider",
                                            isSelected
                                                ? "text-primary-foreground/80"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {format(date, "EEE")}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-lg font-bold leading-tight",
                                            isSelected ? "text-primary-foreground" : ""
                                        )}
                                    >
                                        {format(date, "d")}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-[10px] font-medium",
                                            isSelected
                                                ? "text-primary-foreground/70"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {format(date, "MMM")}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Time Slots — always visible since date is auto-selected */}
            <section aria-label="Select time">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Select Time
                        </h3>
                    </div>
                    {selectedTime && (
                        <span className="text-xs text-primary font-medium">
                            {selectedTime}
                        </span>
                    )}
                </div>

                {/* Period tabs */}
                <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl mb-3">
                    {TIME_GROUPS.map((group) => {
                        const Icon = group.icon;
                        const isActive = activeGroup === group.label;
                        const hasSelected = group.slots.includes(selectedTime);

                        return (
                            <button
                                key={group.label}
                                type="button"
                                onClick={() => setActiveGroup(group.label)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 relative",
                                    isActive
                                        ? "bg-secondary text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground/80"
                                )}
                            >
                                <Icon className="h-3 w-3" />
                                {group.label}
                                {hasSelected && !isActive && (
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Time grid */}
                <AnimatePresence mode="wait">
                    {TIME_GROUPS.filter((g) => g.label === activeGroup).map(
                        (group) => (
                            <motion.div
                                key={group.label}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="grid grid-cols-4 sm:grid-cols-6 gap-1.5"
                            >
                                {group.slots.map((slot) => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setTime(slot)}
                                        aria-pressed={selectedTime === slot}
                                        className={cn(
                                            "py-2 text-xs sm:text-sm rounded-lg border font-medium transition-all duration-200",
                                            selectedTime === slot
                                                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(0_75%_55%/0.2)]"
                                                : "bg-secondary/20 border-border/30 text-foreground/80 hover:bg-primary/10 hover:border-primary/30"
                                        )}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

export default ScheduleSelector;
