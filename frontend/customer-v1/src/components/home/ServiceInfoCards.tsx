"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  Battery, 
  Smartphone, 
  Shield, 
  Cpu, 
  HardDrive,
  Clock,
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const services = [
  {
    icon: Wrench,
    title: "Screen Repair",
    description: "Professional LCD and OLED screen replacement for all major brands. Genuine parts with warranty.",
    features: ["Same-day service", "Genuine parts", "90-day warranty"],
  },
  {
    icon: Battery,
    title: "Battery Replacement",
    description: "Restore your device's battery life with high-quality replacement batteries.",
    features: ["Quick turnaround", "Health diagnostics", "Certified batteries"],
  },
  {
    icon: Smartphone,
    title: "Software Repair",
    description: "Fix software issues, remove viruses, and restore your device to optimal performance.",
    features: ["Data backup", "OS updates", "Performance tuning"],
  },
  {
    icon: Cpu,
    title: "Hardware Diagnostics",
    description: "Comprehensive hardware testing to identify and resolve any component issues.",
    features: ["Full inspection", "Detailed report", "Expert analysis"],
  },
  {
    icon: HardDrive,
    title: "Data Recovery",
    description: "Recover lost or deleted data from damaged or corrupted storage devices.",
    features: ["Secure process", "High success rate", "Confidential handling"],
  },
  {
    icon: Shield,
    title: "Extended Warranty",
    description: "Protect your investment with our comprehensive warranty and protection plans.",
    features: ["Accidental damage", "24/7 support", "No hidden fees"],
  },
];

const ServiceInfoCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === services.length - 1 ? 0 : prev + 1));
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0 })
  };

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional repair and maintenance services for all your devices. 
          Certified technicians, genuine parts, and satisfaction guaranteed.
        </p>
      </motion.div>

      {/* MOBILE: Single card carousel */}
      <div className="md:hidden relative max-w-4xl mx-auto">
        <div className="relative overflow-hidden min-h-[350px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 600, damping: 50 },
                opacity: { duration: 0.15 }
              }}
              className="w-full flex-shrink-0"
            >
              <div className="group p-8 rounded-2xl bg-gradient-card shadow-card border border-border/50 relative overflow-hidden">
                {/* Instagram-style Count Badge */}
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-medium text-white/70 z-20 border border-white/5 shadow-sm select-none tracking-wider">
                  {currentIndex + 1} / {services.length}
                </div>

                <div className="space-y-6 relative z-10 px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      {(() => { const Icon = services[currentIndex].icon; return <Icon className="h-6 w-6 text-primary" />; })()}
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {services[currentIndex].title}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {services[currentIndex].description}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {services[currentIndex].features.map(feature => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={handlePrevious} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-20" aria-label="Previous service">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-20" aria-label="Next service">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* DESKTOP: Full grid of all services */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.title} className="group p-8 rounded-2xl bg-gradient-card shadow-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2">
                  {service.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid sm:grid-cols-3 gap-4 pt-12 border-t border-border/10"
      >
        {[
          { icon: Clock, title: "Fast Turnaround", subtitle: "Most repairs same day" },
          { icon: Award, title: "Certified Technicians", subtitle: "Factory trained experts" },
          { icon: Shield, title: "Warranty Included", subtitle: "90-day service guarantee" },
        ].map((badge) => (
          <div 
            key={badge.title}
            className="flex items-center gap-4 p-5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            <div className="p-3 rounded-lg bg-primary/10">
              <badge.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{badge.title}</h4>
              <p className="text-sm text-muted-foreground">{badge.subtitle}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ServiceInfoCards;
