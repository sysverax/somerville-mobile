"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Wrench } from "lucide-react";
import Layout from "@/src/components/layout/Layout";
import BookingForm from "@/src/components/booking/BookingForm";

const BookingContent  = () => {
  const searchParams = useSearchParams();
  const brandId = searchParams.get("brandId") || undefined;

  return (
    <Layout>
      <section className="py-12 min-h-screen">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Service Booking</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Book a Service
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Schedule a repair, warranty service, or maintenance appointment. 
                Select your product, choose a service, and pick a convenient time slot.
              </p>
            </div>

            {/* Booking Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-card rounded-2xl shadow-card p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Service Appointment</h2>
                  <p className="text-sm text-muted-foreground">Fill in the details below</p>
                </div>
              </div>

            <BookingForm preSelectedBrandId={brandId ?? undefined} />
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 grid md:grid-cols-3 gap-4"
            >
              {[
                {
                  title: "Expert Technicians",
                  description: "Certified professionals for all repairs",
                },
                {
                  title: "Genuine Parts",
                  description: "Only authentic manufacturer parts used",
                },
                {
                  title: "Quick Turnaround",
                  description: "Most repairs completed same day",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-secondary/30 text-center"
                >
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

const BookingPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-dark" />}>
      <BookingContent />
    </Suspense>
  );
};

export default BookingPage;
