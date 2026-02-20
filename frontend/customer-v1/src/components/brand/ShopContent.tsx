"use client";

import { motion } from "framer-motion";
import { Sparkles, Truck, ShieldCheck, Award } from "lucide-react";

const highlights = [
  {
    icon: Sparkles,
    title: "Latest Models",
    description: "Always in stock with the newest releases",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Same-day pickup or quick shipping options",
  },
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    description: "Authorized dealer for all major brands",
  },
  {
    icon: Award,
    title: "Best Price Guarantee",
    description: "Competitive pricing with price match",
  },
];

const ShopContent = () => {
  return (
    <section className="py-16 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Shop With Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner for premium mobile devices and accessories
          </p>
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
        </motion.div>
      </div>
    </section>
  );
};

export default ShopContent;
