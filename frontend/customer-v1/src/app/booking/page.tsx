"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Shield, Cpu, Zap } from "lucide-react";
import Layout from "@/src/components/layout/Layout";
import BookingWizard from "@/src/components/booking/BookingWizard";

const BookingContent = () => {
  const searchParams = useSearchParams();
  const brandId = searchParams.get("brandId") || undefined;

  return (
    <Layout>
      <section className="py-8 md:py-12 min-h-screen">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Service Booking
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Book a Service
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
              Schedule a repair, warranty service, or maintenance appointment in
              3 easy steps.
            </p>
          </motion.div>

          {/* Booking Wizard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BookingWizard preSelectedBrandId={brandId} />
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 grid md:grid-cols-3 gap-4"
          >
            {[
              {
                icon: Shield,
                title: "Expert Technicians",
                description: "Certified professionals for all repairs",
              },
              {
                icon: Cpu,
                title: "Genuine Parts",
                description: "Only authentic manufacturer parts used",
              },
              {
                icon: Zap,
                title: "Quick Turnaround",
                description: "Most repairs completed same day",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl bg-secondary/20 border border-border/30 text-center"
              >
                <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
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
