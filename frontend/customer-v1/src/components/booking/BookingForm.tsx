"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, Check, Wrench, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "@/src/hooks/use-toast";
import { cn } from "@/src/lib/utils";
import {
  getStorefrontBrands,
  getStorefrontCategoriesByBrand,
  getStorefrontSeriesByCategory,
  getStorefrontProductsBySeries,
  getStorefrontProductById,
  getAllStorefrontServices,
  addStorefrontBooking,
  type StorefrontProduct,
  type StorefrontService,
} from "@/src/services";

interface BookingFormProps {
  preSelectedBrandId?: string; 
  preSelectedCategoryId?: string; 
  preSelectedSeriesId?: string;  
  preSelectedProductId?: string;
  preSelectedServiceId?: string;
  onSuccess?: () => void;
}

// Generate 15-minute time slots from 9 AM to 6 PM
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const startHour = hour.toString().padStart(2, '0');
      const startMin = min.toString().padStart(2, '0');
      const endMin = (min + 15) % 60;
      const endHour = endMin === 0 ? hour + 1 : hour;
      const endHourStr = endHour.toString().padStart(2, '0');
      const endMinStr = endMin.toString().padStart(2, '0');
      slots.push(`${startHour}:${startMin} – ${endHourStr}:${endMinStr}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const BookingForm = ({preSelectedBrandId,   preSelectedCategoryId, preSelectedSeriesId, preSelectedProductId, preSelectedServiceId, onSuccess }: BookingFormProps) => {
  const brands = getStorefrontBrands();
  const allServices = getAllStorefrontServices();

  const [selectedBrandId, setSelectedBrandId] = useState(preSelectedBrandId || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(preSelectedCategoryId || "");
  const [selectedSeriesId, setSelectedSeriesId] = useState(preSelectedSeriesId || "");
  const [selectedProductId, setSelectedProductId] = useState(preSelectedProductId || "");
  const [selectedServiceId, setSelectedServiceId] = useState(preSelectedServiceId || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preSelectedBrandId) setSelectedBrandId(preSelectedBrandId);
    if (preSelectedCategoryId) setSelectedCategoryId(preSelectedCategoryId);
    if (preSelectedSeriesId) setSelectedSeriesId(preSelectedSeriesId);
    if (preSelectedProductId) setSelectedProductId(preSelectedProductId);
    if (preSelectedServiceId) setSelectedServiceId(preSelectedServiceId);
  }, [preSelectedBrandId, preSelectedCategoryId, preSelectedSeriesId, preSelectedProductId, preSelectedServiceId]);

  const filteredCategories = useMemo(() => {
    if (!selectedBrandId) return [];
    return getStorefrontCategoriesByBrand(selectedBrandId);
  }, [selectedBrandId]);

  const filteredSeries = useMemo(() => {
    if (!selectedCategoryId) return [];
    return getStorefrontSeriesByCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    if (!selectedSeriesId) return [];
    return getStorefrontProductsBySeries(selectedSeriesId);
  }, [selectedSeriesId]);

  const availableServices = useMemo(() => {
    if (!selectedProductId) return [];
    return allServices.filter(s => s.productId === selectedProductId);
  }, [selectedProductId, allServices]);

  const selectedService = useMemo(() => {
    return allServices.find(s => s.id === selectedServiceId);
  }, [selectedServiceId, allServices]);

  const handleBrandChange = (value: string) => {
    setSelectedBrandId(value);
    setSelectedCategoryId("");
    setSelectedSeriesId("");
    setSelectedProductId("");
    setSelectedServiceId("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setSelectedSeriesId("");
    setSelectedProductId("");
    setSelectedServiceId("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const handleSeriesChange = (value: string) => {
    setSelectedSeriesId(value);
    setSelectedProductId("");
    setSelectedServiceId("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const handleProductChange = (value: string) => {
    setSelectedProductId(value);
    setSelectedServiceId("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const handleServiceChange = (value: string) => {
    setSelectedServiceId(value);
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !selectedServiceId || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    addStorefrontBooking({
      productId: selectedProductId,
      serviceId: selectedServiceId,
      date: dateStr,
      time: selectedTime,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      status: "confirmed",
    });

    toast({
      title: "Booking Confirmed! 🎉",
      description: `Your service has been scheduled for ${format(selectedDate, 'PPP')} at ${selectedTime}`,
    });

    setSelectedBrandId("");
    setSelectedCategoryId("");
    setSelectedSeriesId("");
    setSelectedProductId("");
    setSelectedServiceId("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setIsSubmitting(false);

    onSuccess?.();
  };

  const selectedProduct = selectedProductId ? getStorefrontProductById(selectedProductId) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
        <span className={cn("px-2 py-1 rounded", selectedBrandId ? "bg-primary/20 text-primary" : "bg-secondary")}>Brand</span>
        <ChevronRight className="h-4 w-4" />
        <span className={cn("px-2 py-1 rounded", selectedCategoryId ? "bg-primary/20 text-primary" : "bg-secondary")}>Category</span>
        <ChevronRight className="h-4 w-4" />
        <span className={cn("px-2 py-1 rounded", selectedSeriesId ? "bg-primary/20 text-primary" : "bg-secondary")}>Series</span>
        <ChevronRight className="h-4 w-4" />
        <span className={cn("px-2 py-1 rounded", selectedProductId ? "bg-primary/20 text-primary" : "bg-secondary")}>Product</span>
      </div>

      {/* Brand Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">Select Brand</Label>
        <Select value={selectedBrandId} onValueChange={handleBrandChange}>
          <SelectTrigger className="bg-secondary/50 border-border">
            <SelectValue placeholder="Choose a brand" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            {brands.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Selection */}
      {selectedBrandId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Label className="flex items-center gap-2">Select Category</Label>
          <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              {filteredCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Series Selection */}
      {selectedCategoryId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Label className="flex items-center gap-2">Select Series</Label>
          <Select value={selectedSeriesId} onValueChange={handleSeriesChange}>
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Choose a series" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              {filteredSeries.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Product Selection */}
      {selectedSeriesId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Label htmlFor="product" className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Select Product
          </Label>
          <Select value={selectedProductId} onValueChange={handleProductChange}>
            <SelectTrigger id="product" className="bg-secondary/50 border-border">
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              {filteredProducts.map(product => (
                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Service Selection */}
      {selectedProductId && availableServices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Label htmlFor="service" className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Select Service
          </Label>
          <Select value={selectedServiceId} onValueChange={handleServiceChange}>
            <SelectTrigger id="service" className="bg-secondary/50 border-border">
              <SelectValue placeholder="Choose a service" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              {availableServices.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{service.name}</span>
                    <span className="text-primary font-semibold">${service.price}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedService && (
            <p className="text-sm text-muted-foreground">
              Duration: {selectedService.duration} • Price: ${selectedService.price}
            </p>
          )}
        </motion.div>
      )}

      {selectedProductId && availableServices.length === 0 && (
        <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
          No services available for this product.
        </div>
      )}

      {/* Date Selection */}
      {selectedServiceId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Select Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-secondary/50 border-border",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border-border z-50" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime("");
                }}
                disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </motion.div>
      )}

      {/* Time Slot Selection */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Select Time Slot
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={cn(
                  "px-3 py-2 text-xs sm:text-sm rounded-lg border transition-all duration-200",
                  selectedTime === slot
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                    : "bg-secondary/50 border-border hover:bg-primary/10 hover:border-primary/50"
                )}
              >
                {slot.split(' – ')[0]}
              </button>
            ))}
          </div>
          {selectedTime && (
            <p className="text-sm text-muted-foreground text-center">
              Selected: <span className="font-medium text-primary">{selectedTime}</span>
            </p>
          )}
        </motion.div>
      )}

      {/* Customer Info */}
      {selectedTime && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground">Customer Information (Optional)</h4>
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Name
            </Label>
            <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone
            </Label>
            <Input id="phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Your phone number" className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Your email address" className="bg-secondary/50 border-border" />
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {selectedService && selectedDate && selectedTime && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Booking Summary
          </h4>
          <div className="space-y-2 text-sm">
            {selectedProduct && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{selectedProduct.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-medium">{selectedService.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{selectedService.duration}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="text-lg font-bold text-primary">${selectedService.price}</span>
            </div>
          </div>
        </motion.div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-gradient-primary hover:opacity-90"
        disabled={!selectedServiceId || !selectedDate || !selectedTime || isSubmitting}
      >
        {isSubmitting ? "Booking..." : "Confirm Booking"}
      </Button>
    </form>
  );
};

export default BookingForm;
