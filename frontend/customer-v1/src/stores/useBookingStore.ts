import { create } from "zustand";

export interface BookingState {
    currentStep: number;
    // Product selection
    selectedBrandId: string;
    selectedCategoryId: string;
    selectedSeriesId: string;
    selectedProductId: string;
    expandedSeriesId: string;
    searchQuery: string;
    // Service selection
    selectedServiceId: string;
    // Schedule
    selectedDate: Date | undefined;
    selectedTime: string;
    // Customer info
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    // Submission
    isSubmitting: boolean;
    // Actions
    setBrand: (id: string) => void;
    setCategory: (id: string) => void;
    setSeries: (id: string) => void;
    setExpandedSeries: (id: string) => void;
    setProduct: (id: string) => void;
    setService: (id: string) => void;
    setDate: (date: Date | undefined) => void;
    setTime: (time: string) => void;
    setCustomerName: (name: string) => void;
    setCustomerPhone: (phone: string) => void;
    setCustomerEmail: (email: string) => void;
    setSearchQuery: (query: string) => void;
    setIsSubmitting: (v: boolean) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    reset: () => void;
}

const initialState = {
    currentStep: 0,
    selectedBrandId: "",
    selectedCategoryId: "",
    selectedSeriesId: "",
    selectedProductId: "",
    expandedSeriesId: "",
    searchQuery: "",
    selectedServiceId: "",
    selectedDate: undefined as Date | undefined,
    selectedTime: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    isSubmitting: false,
};

export const useBookingStore = create<BookingState>((set) => ({
    ...initialState,

    setBrand: (id) =>
        set({
            selectedBrandId: id,
            selectedCategoryId: "",
            selectedSeriesId: "",
            selectedProductId: "",
            expandedSeriesId: "",
            selectedServiceId: "",
            selectedDate: undefined,
            selectedTime: "",
        }),

    setCategory: (id) =>
        set({
            selectedCategoryId: id,
            selectedSeriesId: "",
            selectedProductId: "",
            expandedSeriesId: "",
            selectedServiceId: "",
            selectedDate: undefined,
            selectedTime: "",
        }),

    setSeries: (id) =>
        set({
            selectedSeriesId: id,
            selectedProductId: "",
            selectedServiceId: "",
            selectedDate: undefined,
            selectedTime: "",
        }),

    setExpandedSeries: (id) =>
        set((state) => ({
            expandedSeriesId: state.expandedSeriesId === id ? "" : id,
        })),

    setProduct: (id) =>
        set({
            selectedProductId: id,
            selectedServiceId: "",
            selectedDate: undefined,
            selectedTime: "",
        }),

    setService: (id) =>
        set({
            selectedServiceId: id,
            selectedDate: undefined,
            selectedTime: "",
        }),

    setDate: (date) => set({ selectedDate: date, selectedTime: "" }),
    setTime: (time) => set({ selectedTime: time }),
    setCustomerName: (name) => set({ customerName: name }),
    setCustomerPhone: (phone) => set({ customerPhone: phone }),
    setCustomerEmail: (email) => set({ customerEmail: email }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setIsSubmitting: (v) => set({ isSubmitting: v }),

    nextStep: () =>
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, 2) })),
    prevStep: () =>
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
    goToStep: (step) => set({ currentStep: step }),

    reset: () => set(initialState),
}));
