"use client";

import { motion } from "framer-motion";
import { User, Phone, Mail } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";
import { useBookingStore } from "@/src/stores/useBookingStore";

const CustomerForm = () => {
    const { customerName, customerPhone, customerEmail, setCustomerName, setCustomerPhone, setCustomerEmail } =
        useBookingStore();

    const cleanPhone = customerPhone.replace(/[\s\-().]/g, "");
    const phoneError =
        customerPhone && !/^\+?[0-9]\d{6,14}$/.test(cleanPhone)
            ? "Enter a valid phone number (e.g. +61412345678)"
            : "";

    const emailError =
        customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
            ? "Enter a valid email address"
            : "";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <h3 className="text-sm font-medium text-muted-foreground">
                Your Details
            </h3>

            {/* Name */}
            <div className="space-y-1.5">
                <Label htmlFor="booking-name" className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Name <span className="text-primary">*</span>
                </Label>
                <Input
                    id="booking-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-secondary/40 border-border/50 rounded-xl h-11 focus-visible:ring-primary/30"
                    required
                    autoComplete="name"
                />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
                <Label htmlFor="booking-phone" className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone <span className="text-primary">*</span>
                </Label>
                <Input
                    id="booking-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+61 412 345 678"
                    className={cn(
                        "bg-secondary/40 border-border/50 rounded-xl h-11 focus-visible:ring-primary/30",
                        phoneError && "border-destructive focus-visible:ring-destructive/30"
                    )}
                    required
                    autoComplete="tel"
                />
                {phoneError && (
                    <p className="text-xs text-destructive">{phoneError}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <Label htmlFor="booking-email" className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email <span className="text-primary">*</span>
                </Label>
                <Input
                    id="booking-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={cn(
                        "bg-secondary/40 border-border/50 rounded-xl h-11 focus-visible:ring-primary/30",
                        emailError && "border-destructive focus-visible:ring-destructive/30"
                    )}
                    required
                    autoComplete="email"
                />
                {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                )}
            </div>
        </motion.div>
    );
};

export default CustomerForm;
